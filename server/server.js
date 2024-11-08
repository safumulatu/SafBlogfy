const express = require("express");
const userRouter = require("./routes/users/usersRouter");
const connectDb = require("./config/database");
const {
  notFound,
  globalErrHandler,
} = require("./middileware/globalErrorHandler");
const categoryRouter = require("./routes/category/categoryRouter");
const postRouter = require("./routes/posts/PostRoutes");
const commentRoute = require("./routes/comment/commentsRoute");
const sendEmail = require("./utils/sendEmail");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

//? calling the database server
connectDb();
//send mail
// sendEmail("safumulatu9@gmail.com", "ygdvvxjah");
//! api endpoint
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRoute);

//? not found middleware
app.use(notFound);
//? error middleware
app.use(globalErrHandler);

app.listen(PORT, () => {
  console.log("server is up and running on port " + PORT);
});
