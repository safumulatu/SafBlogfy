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
