const express = require("express");
const {
  register,
  login,
  getProfile,
  blockUser,
  unblockUser,
  profileViewers,
} = require("../../controllers/users/UserCtrl");
const isLoggin = require("../../middileware/isLoggedIn");
const userRouter = express.Router();

//! register
userRouter.post("/register", register);

//! login
userRouter.post("/login", login);

//! get profile
userRouter.get("/profile/:id", isLoggin, getProfile);

//! block user
userRouter.put("/block/:userIdToBlock", isLoggin, blockUser);

//! unblock user
userRouter.put("/unblock/:userIdToUnBlock", isLoggin, unblockUser);

//! get profile viewers
userRouter.get("/profile-viewer/:userProfileId", isLoggin, profileViewers);

//? export userRouter
module.exports = userRouter;
