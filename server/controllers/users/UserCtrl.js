const User = require("../../model/User/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//! @route - api/v1/users/register
//!@access - Public

exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    //! check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    //? Hash the password before saving it to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //! create new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({
      msg: "User created successfully",
      _id: newUser?._id,
      username: newUser?.username,
      email: newUser?.email,
      role: newUser?.role,
      lastLogin: newUser?.lastLogin,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};
//! @desc - log in to your account

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.user);

    //? check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "Invalid log in credentials" });
    }
    //? check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid log in credentials" });
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
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

//! user prifile
exports.getProfile = async (req, res) => {
  console.log(req.userAuth);
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    const { password: hashedPassword, ...userInfo } = user._doc;
    res.json({ userInfo });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};
