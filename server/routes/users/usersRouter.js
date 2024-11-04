const express = require("express");
const {
  register,
  login,
  getProfile,
} = require("../../controllers/users/UserCtrl");
const isLoggin = require("../../middileware/isLoggedIn");
const userRouter = express.Router();

// Import User model
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/profile/:id", isLoggin, getProfile);

//? export userRouter
module.exports = userRouter;
