const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");

const User = require("../../model/User/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");
const sendAccVerificationEmail = require("../../utils/sendAccountVerificationEmail");
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
  const id = req.userAuth._id;
  const user = await User.findById(id)
    .populate({
      path: "posts",
      model: "Post",
    })
    .populate({
      path: "following",
      model: "User",
    })
    .populate({
      path: "followers",
      model: "User",
    })
    .populate({
      path: "blockedUsers",
      model: "User",
      select: "-password",
    })
    .populate({
      path: "profileViewers",
      model: "User",
    });

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }
  //*********** */ remove password from response
  const { password: hashedPassword, ...userInfo } = user._doc;
  res.json({
    status: "success",
    message: "profilefetched",
    userInfo,
  });
});
//@desc   get all user
//@route  GET /api/v1/users/
//@access public
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json({ users });
});
exports.blockUser = asyncHandler(async (req, res) => {
  //* Find the user to be blocked
  const userIdToBlock = req.params.userIdToBlock;
  const userToBlock = await User.findById(userIdToBlock);
  if (!userToBlock) {
    throw new Error("User to block not found");
  }
  // ! user who is blocking
  const userBlocking = req.userAuth._id;
  // check if user is blocking him/herself
  if (userIdToBlock.toString() === userBlocking.toString()) {
    throw new Error("Cannot block yourself");
  }
  //find the current user
  const currentUser = await User.findById(userBlocking);
  //? Check if user already blocked
  if (currentUser?.blockedUsers?.includes(userIdToBlock)) {
    throw new Error("User already blocked");
  }
  //push the user to be blocked in the array of the current user
  currentUser.blockedUsers.push(userIdToBlock);
  await currentUser.save();
  res.json({
    message: "User blocked successfully",
    status: "success",
  });
});

//@desc   unBlock user
//@route  PUT /api/v1/users/unblock/:userIdToUnBlock
//@access Private

exports.unblockUser = asyncHandler(async (req, res) => {
  //* Find the user to be unblocked
  const userIdToUnBlock = req.params.userIdToUnBlock;
  const userToUnBlock = await User.findById(userIdToUnBlock);
  if (!userToUnBlock) {
    throw new Error("User to be unblock not found");
  }
  //find the current user
  const userUnBlocking = req.userAuth._id;
  const currentUser = await User.findById(userUnBlocking);

  //check if user is blocked before unblocking
  if (!currentUser.blockedUsers.includes(userIdToUnBlock)) {
    throw new Error("User not block");
  }
  //remove the user from the current user blocked users array
  currentUser.blockedUsers = currentUser.blockedUsers.filter(
    (id) => id.toString() !== userIdToUnBlock.toString()
  );
  //resave the current user
  await currentUser.save();
  res.json({
    status: "success",
    message: "User unblocked successfully",
  });
});

//@desc   who view my profile
//@route  GET /api/v1/users/profile-viewer/:userProfileId
//@access Private
exports.profileViewers = asyncHandler(async (req, res) => {
  //* Find that we want to view his profile
  const userProfileId = req.params.userProfileId;

  const userProfile = await User.findById(userProfileId);
  if (!userProfile) {
    throw new Error("User to view his profile not found");
  }
  //find the current user
  const currentUserId = req.userAuth._id;
  //? Check if user already viewed the profile
  if (userProfile?.profileViewers?.includes(currentUserId)) {
    throw new Error("You have already viewed this profile");
  }
  //push the user current user id into the user profile
  userProfile.profileViewers.push(currentUserId);
  await userProfile.save();
  res.json({
    message: "You have successfully viewed his/her profile",
    status: "success",
  });
});

//@desc   Follwing user
//@route  PUT /api/v1/users/following/:userIdToFollow
//@access Private
exports.followingUser = asyncHandler(async (req, res) => {
  //Find the current user
  const currentUserId = req.userAuth._id;
  //! Find the user to follow
  const userToFollowId = req.params.userToFollowId;
  //Avoid user following himself
  if (currentUserId.toString() === userToFollowId.toString()) {
    throw new Error("You cannot follow yourself");
  }
  //Push the usertofolowID into the current user following field
  await User.findByIdAndUpdate(
    currentUserId,
    {
      $addToSet: { following: userToFollowId },
    },
    {
      new: true,
    }
  );
  //Push the currentUserId into the user to follow followers field
  await User.findByIdAndUpdate(
    userToFollowId,
    {
      $addToSet: { followers: currentUserId },
    },
    {
      new: true,
    }
  );
  //send the response
  res.json({
    status: "success",
    message: "You have followed the user successfully",
  });
});
//@desc   UnFollwing user
//@route  PUT /api/v1/users/unfollowing/:userIdToUnFollow
//@access Private

exports.unFollowingUser = asyncHandler(async (req, res) => {
  //Find the current user
  const currentUserId = req.userAuth._id;
  //! Find the user to unfollow
  const userToUnFollowId = req.params.userToUnFollowId;

  //Avoid user unfollowing himself
  if (currentUserId.toString() === userToUnFollowId.toString()) {
    throw new Error("You cannot unfollow yourself");
  }
  //Remove the usertoUnffolowID from the current user following field
  await User.findByIdAndUpdate(
    currentUserId,
    {
      $pull: { following: userToUnFollowId },
    },
    {
      new: true,
    }
  );
  //Remove the currentUserId from the user to unfollow followers field
  await User.findByIdAndUpdate(
    userToUnFollowId,
    {
      $pull: { followers: currentUserId },
    },
    {
      new: true,
    }
  );
  //send the response
  res.json({
    status: "success",
    message: "You have unfollowed the user successfully",
  });
});

// @route   POST /api/v1/users/forgot-password
// @desc   Forgot password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  // find the email in our db
  const userFound = await User.findOne({ email });
  if (!userFound) {
    throw new Error("there is no such email in our system");
  }
  //! Create token
  const resetToken = await userFound.generatePasswordResetToken();
  //resave the user
  await userFound.save();
  // send  email with token
  sendEmail(email, resetToken);
  // send response
  res.status(200).json({
    message: "password reset email sent",
    resetToken: "check your email",
  });
});

// @route   POST /api/v1/users/reset-password/:resetToken
// @desc   Reset password
// @access  Public

exports.resetPassword = asyncHandler(async (req, res) => {
  //Get the id/token from email /params
  const { resetToken } = req.params;
  const { password } = req.body;
  //Convert the token to actual token that has been saved in the db
  const cryptoToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //find the user by the crypto token
  const userFound = await User.findOne({
    passwordResetToken: cryptoToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!userFound) {
    throw new Error("Password reset token is invalid or has expired");
  }
  // update the user password
  const salt = await bcrypt.genSalt(10);
  userFound.password = await bcrypt.hash(password, salt);
  userFound.passwordResetExpires = undefined;
  userFound.passwordResetToken = undefined;
  // re save the user
  await userFound.save();
  res.status(200).json({ message: "Password reset successfully" });
});

// @route   POST /api/v1/users/account-verification-email
// @desc    Send Account verification email
// @access  Private

exports.accountVerificationEmail = asyncHandler(async (req, res) => {
  //Find the login user email
  const user = await User.findById(req?.userAuth?._id);
  if (!user) {
    throw new Error("User not found");
  }
  //send the token
  const token = await user.generateAccVerificationToken();
  //resave
  await user.save();
  //send the email
  sendAccVerificationEmail(user?.email, token);
  res.status(200).json({
    message: `Account verification email sent to ${user?.email}`,
  });
});

// @route   POST /api/v1/users/verify-account/:verifyToken
// @desc    Verify token
// @access  Private

exports.verifyAccount = asyncHandler(async (req, res) => {
  //Get the id/token params
  const { verifyToken } = req.params;
  //Convert the token to actual token that has been saved in the db
  const cryptoToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");
  //find the user by the crypto token
  const userFound = await User.findOne({
    accountVerificationToken: cryptoToken,
    accountVerificationExpires: { $gt: Date.now() },
  });
  if (!userFound) {
    throw new Error("Account verification  token is invalid or has expired");
  }
  //Update user account
  userFound.isVerfied = true;
  userFound.accountVerificationExpires = undefined;
  userFound.accountVerificationToken = undefined;
  //resave the user
  await userFound.save();
  res.status(200).json({ message: "Account  successfully verified" });
});
