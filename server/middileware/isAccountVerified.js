const User = require("../model/User/User");

//! check account verification
const checkAccountVerification = async (req, res, next) => {
  try {
    // find the user
    const user = await User.findById(req.userAuth._id);
    //check if user is verified
    if (user?.isVerfied) {
      next();
    } else {
      res.status(401).json({ message: "Account not verified" });
    }
  } catch (error) {
    res.status(500).json({ message: "serever error", error: error });
  }
};

//export

module.exports = checkAccountVerification;
