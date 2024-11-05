const express = require("express");
const isLoggin = require("../../middileware/isLoggedIn");
const {
  createCategory,
  getCategories,
  deleteCategories,
  updateCategory,
} = require("../../controllers/categories/category");

const categoryRouter = express.Router();

categoryRouter.post("/", isLoggin, createCategory);
categoryRouter.get("/", getCategories);
categoryRouter.delete("/:id", deleteCategories);
categoryRouter.put("/:id", updateCategory);

module.exports = categoryRouter;
