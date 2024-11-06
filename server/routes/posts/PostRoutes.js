const express = require("express");
const isLoggin = require("../../middileware/isLoggedIn");
const {
  createPost,
  getPosts,
  getPost,
  deletePost,
  updatePost,
} = require("../../controllers/post/postCtrl");
const postRouter = express.Router();

//import Post model
postRouter.post("/", isLoggin, createPost);
postRouter.get("/", getPosts);
postRouter.get("/:id", getPost);
postRouter.delete("/:id", isLoggin, deletePost);
postRouter.put("/:id", isLoggin, updatePost);
//export
module.exports = postRouter;
