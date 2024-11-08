const express = require("express");
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
} = require("../../controllers/users/UserCtrl");
const isLoggin = require("../../middileware/isLoggedIn");
const userRouter = express.Router();

//! register
userRouter.post("/register", register);

//! login
userRouter.post("/login", login);

//! get all users
userRouter.get("/", getUsers);
//! get profile
userRouter.get("/profile/:id", isLoggin, getProfile);

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

//? export userRouter
module.exports = userRouter;
