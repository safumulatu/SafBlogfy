const express = require("express");
const isLoggin = require("../../middileware/isLoggedIn");
const {
  createPost,
  getPosts,
  getPost,
  deletePost,
  updatePost,
  likePost,
  dislikePost,
  claps,
  schedule,
} = require("../../controllers/post/postCtrl");
const checkAccountVerification = require("../../middileware/isAccountVerified");
const postRouter = express.Router();

//import Post model
postRouter.post("/", isLoggin, checkAccountVerification, createPost);
postRouter.get("/", isLoggin, getPosts);
postRouter.get("/:id", getPost);
postRouter.delete("/:id", isLoggin, checkAccountVerification, deletePost);
postRouter.put("/:id", isLoggin, checkAccountVerification, updatePost);
//like post
postRouter.put("/likes/:id", isLoggin, likePost);

//dislike post
postRouter.put("/dislikes/:id", isLoggin, dislikePost);

//clap a post
postRouter.put("/claps/:id", isLoggin, claps);

//schedule the post
postRouter.put("/schedule/:postId", isLoggin, schedule);

//export
module.exports = postRouter;
