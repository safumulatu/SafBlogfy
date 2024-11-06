const express = require("express");
const {
  register,
  login,
  getProfile,
  blockUser,
  unblockUser,
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
userRouter.put("/unblock/:userIdTounBlock", isLoggin, unblockUser);

//? export userRouter
module.exports = userRouter;
