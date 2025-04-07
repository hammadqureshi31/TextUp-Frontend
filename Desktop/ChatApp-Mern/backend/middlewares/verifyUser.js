import { accessTokenOptions, generateAccessAndRefreshTokens, refreshTokenOptions } from "../controllers/userControllers.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

export const verifyUser = async (req, res, next) => {
  try {
    const access = req.cookies.accessToken;
    const refresh = req.cookies.refreshToken;

    if (!access && !refresh) {
      return res.status(401).send("Unauthorized Request: No tokens provided.");
    }

    if (!access) {
      try {
        const refreshTokenDetails = jwt.verify(
          refresh,
          process.env.REFRESH_TOKEN_SECRET
        );

        const refreshTokenUser = await User.findById(refreshTokenDetails._id);
        if (!refreshTokenUser) return res.status(404).send("No user found!");

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(refreshTokenUser._id);

        res.cookie("accessToken", accessToken, accessTokenOptions);
        res.cookie("refreshToken", refreshToken, refreshTokenOptions);

        req.valideUser = refreshTokenUser;
        return next();
      } catch (err) {
        return res.status(401).send("Invalid Refresh token. Please login.");
      }
    }

    try {
      const accessTokenDetails = jwt.verify(access, process.env.ACCESS_TOKEN_SECRET);
      const accessTokenUser = await User.findById(accessTokenDetails._id);

      if (!accessTokenUser) return res.status(404).send("No user found!");

      req.valideUser = accessTokenUser;
      next();
    } catch (err) {
      return res.status(401).send("Invalid Access token. Please login.");
    }
  } catch (error) {
    console.error("Error in token verification:", error);
    return res.status(500).send("Internal Server Error.");
  }
};
