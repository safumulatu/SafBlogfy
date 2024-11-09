const express = require("express");
const multer = require("multer");
const {
  register,
  login,
  getProfile,
  blockUser,
  unblockUser,
  profileViewers,
  followingUser,
  getUsers,
  unFollowingUser,
  forgotPassword,
  resetPassword,
  accountVerificationEmail,
  verifyAccount,
} = require("../../controllers/users/UserCtrl");
const isLoggin = require("../../middileware/isLoggedIn");
const storage = require("../../utils/fileUpload");

const userRouter = express.Router();

//* file upload middleware
const upload = multer({ storage });

//! register
userRouter.post("/register", upload.single("profilePicture"), register);

//! login
userRouter.post("/login", login);

//! get all users
userRouter.get("/", getUsers);
//! get profile
userRouter.get("/profile", isLoggin, getProfile);

//! block user
userRouter.put("/block/:userIdToBlock", isLoggin, blockUser);

//! unblock user
userRouter.put("/unblock/:userIdToUnBlock", isLoggin, unblockUser);

//! get profile viewers
userRouter.get("/profile-viewer/:userProfileId", isLoggin, profileViewers);
//! following user
userRouter.put("/following/:userToFollowId", isLoggin, followingUser);
//! unfollowing user
userRouter.put("/unfollowing/:userToUnFollowId", isLoggin, unFollowingUser);
//! forgot password user
userRouter.post("/forgot-password", forgotPassword);
//! reset password user
userRouter.post("/reset-password/:resetToken", resetPassword);

/// send account verification email
userRouter.put(
  "/account-verification-email",
  isLoggin,
  accountVerificationEmail
);
// send account verification email
userRouter.put("/account-verification/:verifyToken", isLoggin, verifyAccount);

//? export userRouter
module.exports = userRouter;
