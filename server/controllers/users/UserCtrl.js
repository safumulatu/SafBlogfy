const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

const User = require("../../model/User/User");
const jwt = require("jsonwebtoken");
//! @route - api/v1/users/register
//!@access - Public

exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  //! check if user already exists
  const user = await User.findOne({ email });
  if (user) {
    throw new Error("User Already Exists");
  }

  //? Hash the password before saving it to the database
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  //! create new user
  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();
  res.status(201).json({
    status: "success",
    message: "User Registered Successfully",
  });
});
//! @desc - log in to your account

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //? check if user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid login credentials");
  }
  //? check if password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid login credentials");
  }
  //? update last user loged in
  //!genereate a token
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
  const { password: hashedPassword, ...userInfo } = user._doc;
  user.lastLogin = Date.now();
  res
    .cookie("token", token)
    .status(200)
    .json({ message: "Login successful", userInfo, token });
});

//! user prifile
exports.getProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }
  const { password: hashedPassword, ...userInfo } = user._doc;
  res.json({ userInfo });
});
//@desc   Block user
//@route  PUT /api/v1/users/block/:userIdToBlock
//@access Private
exports.blockUser = asyncHandler(async (req, res) => {
  //! find the user to block
  const userIdToBlock = req.params.userIdToBlock;
  const userToBlock = await User.findById(userIdToBlock);
  if (!userToBlock) {
    throw new Error("user to block not found");
  }

  //@ user who is blocking the user
  const userBlocking = req.userAuth._id;
  // check if user is blocking him self
  if (userIdToBlock.toString() === userBlocking) {
    throw new Error("You can't block yourself");
  }
  //find the curreent user
  const currentUser = await User.findById(userBlocking);
  // check if user is already blocked
  if (currentUser?.blockedUsers?.includes(userIdToBlock)) {
    throw new Error("User is already blocked");
  }
  //push the user to be blocked in the array of the current user
  currentUser?.blockedUsers?.push(userIdToBlock);
  await currentUser.save();
  res.status(200).json({
    message: "User blocked successfully",
    status: "success",
  });
});

//@desc   unBlock user
//@route  PUT /api/v1/users/unblock/:userIdToUnBlock
//@access Private

exports.unblockUser = asyncHandler(async (req, res) => {
  const userIdToUnBlock = req.params.userIdToUnBlock;
  const userToUnBlock = await User.findById(userIdToUnBlock);
  if (!userToUnBlock) {
    return res.status(404).json({ message: "User to be unblocked not found" });
  }

  const userUnBlocking = req.userAuth._id;
  const currentUser = await User.findById(userUnBlocking);

  if (!currentUser.blockedUsers.includes(userIdToUnBlock)) {
    return res.status(400).json({ message: "User is not blocked" });
  }

  currentUser.blockedUsers = currentUser.blockedUsers.filter(
    (id) => id.toString() !== userIdToUnBlock.toString()
  );
  await currentUser.save();
  res.json({
    status: "success",
    message: "User unblocked successfully",
  });
});
