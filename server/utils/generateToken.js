const jwt = require("jsonwebtoken");
const generateToken = (user) => {
  //create payload for the user
  const payload = {
    user: {
      id: user.id,
    },
  };
  //sign the token with the secret key
  const token = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: "1d" });
};
