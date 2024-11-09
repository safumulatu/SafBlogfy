const asyncHandler = require("express-async-handler");
const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const Category = require("../../model/Category/Category");

//@desc  Create a post
//@route POST /api/v1/posts
//@access Private

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
    image: req?.file?.path,
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

//@desc  Get all posts
//@route GET /api/v1/posts
//@access Private

exports.getPosts = asyncHandler(async (req, res) => {
  // !find all users who have blocked the logged-in user
  const loggedInUserId = req.userAuth?._id;
  //get current time
  const currentTime = new Date();
  const usersBlockingLoggedInuser = await User.find({
    blockedUsers: loggedInUserId,
  });
  // Extract the IDs of users who have blocked the logged-in user
  const blockingUsersIds = usersBlockingLoggedInuser?.map((user) => user?._id);
  //! Get the category, searchterm from request
  const category = req.query.category;
  const searchTerm = req.query.searchTerm;
  let query = {
    author: { $nin: blockingUsersIds },
    $or: [
      {
        shedduledPublished: { $lte: currentTime },
        shedduledPublished: null,
      },
    ],
  };
  const posts = await Post.find(query).populate({
    path: "author",
    model: "User",
    select: "email username role",
  });
  res.status(200).json({
    status: "success",
    message: "Posts fetched successfully",
    posts,
  });
});

//@desc  Get single post
//@route GET /api/v1/posts/:id
//@access PUBLIC

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

//@desc  Delete Post
//@route DELETE /api/v1/posts/:id
//@access Private
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

//@desc  update Post
//@route PUT /api/v1/posts/:id
//@access Private

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

//@desc   liking a Post
//@route  PUT /api/v1/posts/likes/:id
//@access Private

exports.likePost = asyncHandler(async (req, res) => {
  // get the id of the post
  const { id } = req.params;
  // get the log in user
  const userId = req.userAuth._id;
  // find the post
  const post = await Post.findById(id);
  if (!post) {
    throw new Error("Post not found");
  }
  // push the user in to the post likes
  await Post.findByIdAndUpdate(
    id,
    {
      $addToSet: { likes: userId },
    },
    { new: true }
  );
  // Remove the user from the dislikes array if present
  post.dislikes = post.dislikes.filter(
    (dislike) => dislike.toString() !== userId.toString()
  );
  //resave the post
  await post.save();
  res.status(200).json({ message: "Post liked successfully.", post });
});

//@desc   liking a Post
//@route  PUT /api/v1/posts/likes/:id
//@access Private

exports.dislikePost = asyncHandler(async (req, res) => {
  // get the id of the post
  const { id } = req.params;
  // get the log in user
  const userId = req.userAuth._id;
  // find the post
  const post = await Post.findById(id);
  if (!post) {
    throw new Error("Post not found");
  }
  // push the user in to the post dislikes
  await Post.findByIdAndUpdate(
    id,
    {
      $addToSet: { dislikes: userId },
    },
    { new: true }
  );
  // Remove the user from the likes array if present
  post.likes = post.likes.filter(
    (like) => like.toString() !== userId.toString()
  );
  //resave the post
  await post.save();
  res.status(200).json({ message: "Post disliked successfully.", post });
});

//@desc   clapong a Post
//@route  PUT /api/v1/posts/claps/:id
//@access Private

exports.claps = asyncHandler(async (req, res) => {
  //Get the id of the post
  const { id } = req.params;
  //Find the posts
  const post = await Post.findById(id);
  if (!post) {
    throw new Error("Post not found");
  }
  //implement the claps
  const updatedPost = await Post.findByIdAndUpdate(
    id,
    {
      $inc: { claps: 1 },
    },
    {
      new: true,
    }
  );
  res.status(200).json({ message: "Post clapped successfully.", updatedPost });
});

//@desc   Shedule a post
//@route  PUT /api/v1/posts/schedule/:postId
//@access Private

exports.schedule = asyncHandler(async (req, res) => {
  // get the payload
  const { schedulePublish } = req.body;
  const { postId } = req.params;
  // check if the post  exists and schedule published found
  if (!postId || !schedulePublish) {
    throw new Error("PostID and schedule date are required");
  }
  // find the post
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error("Post not found");
  }
  //check if the user is the auther of the post
  if (post.author.toString() !== req.userAuth._id.toString()) {
    throw new Error("You can only schedule your own post");
  }
  const scheduleDate = new Date(schedulePublish);
  const currentDate = new Date();
  if (scheduleDate < currentDate) {
    throw new Error("Schedule date cannot be in the past");
  }
  //update the post
  post.shedduledPublished = scheduleDate;
  await post.save();
  res
    .status(200)
    .json({ status: "success", message: "Post scheduled successfully" });
});
