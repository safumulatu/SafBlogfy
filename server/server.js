const express = require("express");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server is up and running on port " + PORT);
});
