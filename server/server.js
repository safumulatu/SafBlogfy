const express = require("express");
const userRouter = require("./routes/users/usersRouter");
const connectDb = require("./config/database");
const {
  notFound,
  globalErrHandler,
} = require("./middileware/globalErrorHandler");
const categoryRouter = require("./routes/category/categoryRouter");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 3000;

//? calling the database server
connectDb();
//! api endpoint
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);

//? not found middleware
app.use(notFound);
//? error middleware
app.use(globalErrHandler);

app.listen(PORT, () => {
  console.log("server is up and running on port " + PORT);
});
