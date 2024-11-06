const express = require("express");
const {
  createComment,
  deleteComment,
  updateComment,
} = require("../../controllers/comment/commentCtrlr");
const isLoggin = require("../../middileware/isLoggedIn");

const commentRoute = express.Router();

commentRoute.post("/:postId", isLoggin, createComment);
commentRoute.delete("/:id", isLoggin, deleteComment);
commentRoute.put("/:id", isLoggin, updateComment);

module.exports = commentRoute;
