const jwt = require("jsonwebtoken");
const User = require("../model/User/User");

const isLoggin = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new Error("No token provided");
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Get the user ID directly from decoded
    const userId = decoded?.userId;

    // Find the user by ID
    const user = await User.findById(userId).select("username email role _id");

    if (!user) {
      throw new Error("User not found");
    }

    // Save user into req object
    req.userAuth = user;
    next();
  } catch (err) {
    next(new Error("Token expired/Invalid or user not found"));
  }
};

module.exports = isLoggin;
