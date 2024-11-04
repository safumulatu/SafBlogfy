const mongoose = require("mongoose");
//inside try catch create function to connect to database

const connectDb = async () => {
  try {
   const connected= await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};
// export the function

module.exports = connectDb;
