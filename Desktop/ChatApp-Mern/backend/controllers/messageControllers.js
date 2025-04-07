import mongoose from "mongoose";
import { Message } from "../models/messageModel.js";
import { Group } from "../models/groupModel.js";

export async function handleGetAllMessages(req, res) {
  if (!req.valideUser) {
    return res.status(401).send("Unauthorized request.");
  }

  const currentUser = req.valideUser;
  const { chatId, userId, mode = "inbox", offset = 0 } = req.query;
  let messages = null;

  try {
    if (!chatId) {
      return res.status(409).send("Invalid Request.");
    }

    // console.log("groupID", chatId, userId, mode, offset);

    // Validate chatId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ error: "Invalid chatId" });
    }
    const chatObjectId = new mongoose.Types.ObjectId(chatId);

    const offsetNo = parseInt(offset, 10);
    const offsetSize = 10;

    if (mode === "inbox") {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid userId" });
      }
      const userObjectId = new mongoose.Types.ObjectId(userId);

      messages = await Message.find({
        $or: [
          { sender: chatObjectId, receiver: userObjectId },
          { receiver: chatObjectId, sender: userObjectId },
        ],
      })
        .sort({ createdAt: -1 })
        .skip(offsetNo * offsetSize)
        .limit(offsetSize)
        .populate({
          path: "sender",
          model: "User",
          select: "firstname lastname profilePicture",
        });
    } else if (mode === "group") {
      messages = await Message.find({ receiver: chatObjectId })
        .sort({ createdAt: -1 })
        .skip(offsetNo * offsetSize)
        .limit(offsetSize)
        .populate({
          path: "sender",
          model: "User",
          select: "firstname lastname profilePicture",
        });
    }

    if (!messages || messages.length === 0) {
      return res.status(404).send("No messages found!");
    }

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Internal Server Error. Please try again.");
  }
}
