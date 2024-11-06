const asyncHandler = require("express-async-handler");
const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const Category = require("../../model/Category/Category");

//? @route - api/v1/posts
//? @desc - create a new post
exports.createPost = asyncHandler(async (req, res) => {
  //! get payload
  const { title, content, categoryId } = req.body;
  // check if post is already existing
  const postFound = await Post.findOne({ title });
  if (postFound) {
    throw new Error("Post already exists");
  }
  //! create new post
  const post = await Post.create({
    title,
    content,
    category: categoryId,
    author: req?.userAuth?._id,
  });
  //* associate post to the user
  await User.findByIdAndUpdate(
    req?.userAuth?._id,
    {
      $push: { posts: post._id },
    },
    { new: true }
  );
  //* push post in to category
  await Category.findByIdAndUpdate(
    req?.userAuth?._id,
    {
      $push: { posts: post._id },
    },
    { new: true }
  );
  res.status(201).json({
    status: "success",
    message: "Post created successfully",
    post,
  });
});

//? get the all post
exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({}).populate("comments");
  res.status(200).json({
    status: "success",
    message: "Posts fetched successfully",
    posts,
  });
});

//! get single post
exports.getPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) {
    return res.status(404).json({ msg: "Post not found" });
  }
  res.status(200).json({
    status: "success",
    message: "Post fetched successfully",
    post,
  });
});

//delete post

exports.deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findByIdAndDelete(id);
  if (!post) {
    return res.status(404).json({ msg: "Post not found" });
  }
  //* remove post from user
  await User.findByIdAndUpdate(
    req?.userAuth?._id,
    {
      $pull: { posts: id },
    },
    { new: true }
  );
  //* remove post from category
  await Category.findByIdAndUpdate(
    req?.userAuth?._id,
    {
      $pull: { posts: id },
    },
    { new: true }
  );
  res.status(200).json({
    status: "success",
    message: "Post deleted successfully",
  });
});

//update post
exports.updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!post) {
    return res.status(404).json({ msg: "Post not found" });
  }
  res.status(200).json({
    status: "success",
    message: "Post updated successfully",
  });
});
