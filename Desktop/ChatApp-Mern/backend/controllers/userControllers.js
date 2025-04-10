import { Message } from "../models/messageModel.js";
import { User } from "../models/userModel.js";
import { Group } from "../models/groupModel.js";
import { google } from "googleapis";
import nodemailer from "nodemailer";  
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const accessTokenMaxAge = 24 * 60 * 60 * 1000; // 1 day in milliseconds
const refreshTokenMaxAge = 240 * 60 * 60 * 1000; // 10 days in milliseconds

export const accessTokenOptions = {
  maxAge: accessTokenMaxAge,
  httpOnly: true,
  secure: true, // Must be true in production (for HTTPS)
  sameSite: "None", // Use 'lax' for cross-site requests
  path: "/",
};
 
export const refreshTokenOptions = {
  maxAge: refreshTokenMaxAge,
  httpOnly: true,
  secure: true, // Must be true in production (for HTTPS)
  sameSite: "None", // Use 'lax' for cross-site requests
  path: "/",
};

export const generateAccessAndRefreshTokens = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send("No user found! Please Signup..");
    }

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generating Access and Refresh Token", error);
  }
};

export async function handleSignupUser(req, res) {
  try {
    const { firstname, email, password } = req.body;

    if (
      [firstname, email, password].some(
        (field) => !field || field.trim() === ""
      )
    ) {
      return res.status(404).send("All fields required...");
    }

    const userExist = await User.findOne({
      $or: [{ firstname }, { email: email.toLowerCase() }],
    });
    if (userExist) {
      return res
        .status(409)
        .send("User with this email or username already exists.");
    }

    const signupUser = await User.create({
      firstname,
      email,
      password,
    });

    if (!signupUser) {
      return res.status(500).send("Some went wrong..");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      signupUser._id
    );

    const user = await User.findById(signupUser._id).select(
      "-password -refreshToken"
    );

    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).send("Error in signing up user..");
  }
}

export async function handleLoginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(409).send("Email and password required..");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .send("No user found with this email.. Please Signup");
    }

    const isMatch = user.isPasswordCorrect(user.password);

    if (!isMatch) {
      return res.status(404).send("Invalid credentials..");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    res.cookie("accessToken", accessToken, accessTokenOptions);
    res.cookie("refreshToken", refreshToken, refreshTokenOptions);
    res.status(200).json(loggedInUser);
  } catch (error) {
    res.status(500).send("Error in login user..");
  }
}

export async function handleSignOutUser(req, res) {
  if (req.valideUser) {
    try {
      await User.findByIdAndUpdate(
        req.valideUser._id,
        {
          $unset: { refreshToken: 1 },
        },
        { new: true }
      );

      res
        .status(200)
        .cookie("accessToken", "", {
          ...accessTokenOptions,
          expires: new Date(0),
        })
        .cookie("refreshToken", "", {
          ...refreshTokenOptions,
          expires: new Date(0),
        })
        .send("SignOut Successfully...");
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).send("SignOut failed");
    }
  }
}



export async function handleUpdateLastSeen(req, res) {
  try {
    const { userId } = JSON.parse(req.body.toString()); 

    console.log("userId",JSON.parse(req.body))

    if (!userId) {
      return res.status(400).send("User ID is required.");
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        lastSeen: new Date(),
        isOnline: false,
      },
      { new: true }
    ); 

    if (!updatedUser) {
      return res.status(404).send("User not found.");
    }

    return res.status(200).send("User last seen updated.");
  } catch (error) {
    console.error("Error updating last seen:", error);
    res.status(500).send("An error occurred while updating last seen.");
  }
}


export async function handleGetUserDetails(req, res) {
  const userDetails = req.valideUser;
  
  // console.log("userDetails..",userDetails);
  
  if (!userDetails || !userDetails._id) {
    return res.status(401).send("Unauthorized Request...");
  }

  try {
    // Fetch current user details (excluding password & refreshToken)
    const currentUser = await User.findById(userDetails._id)
      .select("-password -refreshToken")
      .lean();

    if (!currentUser) {
      return res.status(404).send("User not found.");
    }

    // Fetch contacted users and user groups in parallel
    const [contactedUsers, userGroups] = await Promise.all([
      User.find({ _id: { $in: currentUser.contacts } }).select(
        "-password -refreshToken"
      ),
      Group.find({ _id: { $in: currentUser.groups } }),
    ]);

    // Fetch messages (direct & group) efficiently
    const messages = await Message.find({
      $or: [
        { sender: userDetails._id },
        { receiver: userDetails._id },
        { receiver: { $in: userGroups.map((group) => group._id) } },
      ],
    }).lean(); // Lean for performance improvement

    // Fetch last messages for contacts & groups in parallel
    const lastMessages = {};

    await Promise.all([
      ...currentUser.contacts.map(async (userId) => {
        lastMessages[userId] = await Message.findOne({
          $or: [
            { sender: currentUser._id, receiver: userId },
            { sender: userId, receiver: currentUser._id },
          ],
        })
          .sort({ createdAt: -1 })
          .lean();
      }),
      ...currentUser.groups.map(async (groupId) => {
        lastMessages[groupId] = await Message.findOne({
          $or: [{ sender: currentUser._id, receiver: groupId }, { receiver: groupId }],
        })
          .sort({ createdAt: -1 })
          .lean();
      }),
    ]);

    const [unreadCount, unreadGroup] = await Promise.all([
      Message.find({
        receiver: userDetails._id,
        unread: false,
        mode: "inbox",
      }),
      Message.find({
        receiver: { $in: userGroups.map((group) => group._id) },
        unread: false,
        mode: "group",
      }),
    ]);

    // console.log("unreadCount",unreadCount, "unreadGroup",unreadGroup)

    res.status(200).json({
      details: currentUser,
      contactedUsers,
      myGroups: userGroups,
      lastMessages,
      unread: unreadCount,
      groupUnreads: unreadGroup,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).send("An error occurred while fetching user details.");
  }
}


export async function handleUserProfileSetup(req, res) {
  const { lastname, profilePicture, profileSetup } = req.body;
  const { userId } = req.params;

  try {
    if (req.valideUser) {
      const userDetails = await User.findByIdAndUpdate(
        userId,
        {
          lastname: lastname.length > 0 ? lastname : "",
          profilePicture,
          profileSetup,
        },
        { new: true }
      );

      if (!userDetails) {
        return res.status(404).send("No user found...");
      }

      return res.status(200).send("Profile setup successfully...");
    } else {
      return res.status(401).send("Unauthorized request...");
    }
  } catch (error) {
    res.status(500).send("Error in setting user profile...");
  }
}

export async function handleFetchAvailableContacts(req, res) {
  try {
    if (req.valideUser) {
      const contacts = await User.find().select(
        "-password -refreshToken -profileSetup"
      );
      if (!contacts) return res.status(404).send("No available contacts...");

      // console.log(contacts);
      return res.status(200).send(contacts);
    } else {
      return res.status(401).send("Unauthorized request...");
    }
  } catch (error) {
    res.status(500).send("Error in fetching available contacts...");
  }
}

export async function handleAddNewContact(req, res) {
  try {
    if (req.valideUser) {
      const { contactId } = req.body;
      const { userId } = req.params;

      const user = await User.findById(userId).select(
        "-password -refreshToken -contacts -profileSetup"
      );
      const contactUser = await User.findById(contactId).select(
        "-password -refreshToken -contacts -profileSetup"
      );

      if (!user) {
        return res.status(404).send("User not found");
      }

      if (!contactUser) {
        return res.status(404).send("Contact user not found");
      }

      if (user.contacts?.length > 0 && user.contacts.includes(contactId)) {
        return res.status(400).send("Contact already added");
      }

      const sender = await User.findByIdAndUpdate(
        userId,
        { $push: { contacts: contactId } },
        { new: true }
      );

      const receiver = await User.findByIdAndUpdate(
        contactId,
        { $push: { contacts: userId } },
        { new: true }
      );

      // console.log(sender, receiver);
      return res.status(200).send("Contact added successfully");
    } else {
      return res.status(401).send("Unauthorized request");
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error adding new contact");
  }
}


export async function handleForgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(403).send("Email is required.");
  }
  console.log("Received forgot password request for email:", email);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send("No user found with this email.");
    }
    console.log("User found:", user);

    const CLIENT_ID = process.env.CLIENT_ID_FOR_MAIL;
    const CLIENT_SECRET = process.env.CLIENT_SECRET_FOR_MAIL;
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN_FOR_MAIL;
    const REDIRECT_URI = "https://developers.google.com/oauthplayground";
    const MY_EMAIL = "muhammadhammadq882@gmail.com";
    const tosend = user.email;

    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    const sendTestEmail = async () => {
      try {
        const ACCESS_TOKEN = await oAuth2Client.getAccessToken();

        if (!ACCESS_TOKEN.token) {
          throw new Error("Failed to retrieve access token");
        }

        console.log("Access token retrieved successfully.");

        const transport = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: MY_EMAIL,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: ACCESS_TOKEN.token,
          },
          tls: {
            rejectUnauthorized: true,
          },
        });

        const from = MY_EMAIL;
        const subject = "Password Reset Request - TextUp Chat Application";
        const text = `
          <p>Dear ${user.firstname},</p>
          <p>We received a request to reset your password for your account associated with this email address. If you made this request, please click on the link below to reset your password:</p>
          <p><a href="https://text-up-chat-applicatoin-mern.vercel.app/reset-password/${user._id}" target="_blank">Reset your password</a></p>
          <p>If you did not request a password reset, please ignore this email. Your account security is important to us, and we recommend that you do not share your account details with anyone.</p>
          <p>Thank you for choosing TextUp Chat Application.</p>
          <p>Best regards,<br/>The TextUp Chat Team</p>
        `;

        return new Promise((resolve, reject) => {
          console.log("Sending email...");
          transport.sendMail(
            { from, to: tosend, subject, html: text },
            (err, info) => {
              if (err) reject(err);
              else resolve(info);
            }
          );
        });
      } catch (error) {
        throw new Error(`Error while sending email: ${error.message}`);
      }
    };

    await sendTestEmail();
    console.log("Password reset email sent successfully...");
    res.status(200).send("Password reset email sent successfully.");
  } catch (error) {
    console.error("Error in sending forgot password email:", error);
    res.status(500).send("Error in sending forgot password email");
  }
}


export async function handleResetPassword(req, res) {
  const { password } = req.body;
  const { userId } = req.params;

  if (!password || password.length < 6) {
    return res
      .status(400)
      .send("Strong password required and must be at least 6 characters long.");
  }

  console.log(password, userId)

  try {
    const hashedPass = await bcrypt.hash(password, 10);
    const resetPass = await User.findByIdAndUpdate(
      userId,
      { password: hashedPass },
      { new: true }
    );

    if (!resetPass) {
      return res.status(404).send("User not found.");
    }

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("Error in resetting password:", error);
    res.status(500).send("Internal Server Error");
  }
}
