const express = require("express");
const isLoggin = require("../../middileware/isLoggedIn");
const {
  createCategory,
  getCategories,
  deleteCategories,
  updateCategory,
} = require("../../controllers/categories/category");

const categoryRouter = express.Router();

categoryRouter.post("/create", isLoggin, createCategory);
categoryRouter.get("/", getCategories);
categoryRouter.delete("/:id", isLoggin, deleteCategories);
categoryRouter.put("/:id", isLoggin, updateCategory);

module.exports = categoryRouter;
