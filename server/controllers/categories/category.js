const asyncHandler = require("express-async-handler");
const Category = require("../../model/Category/Category");

exports.createCategory = asyncHandler(async (req, res) => {
  const { name, author } = req.body;
  const categoryFound = await Category.findOne({ name });
  if (categoryFound) {
    throw new Error("category already exists");
  }
  const category = await Category.create({
    name,
    author: req.userAuth?._id,
  });
  res.status(201).json({
    status: "success",
    message: "Category created successfully",
    category,
  });
});

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  if (!categories) {
    throw new Error("category not found");
  }

  res.status(201).json({
    status: "success",
    message: "Category fetched",
    categories,
  });
});

exports.deleteCategories = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const categortoDelete = await Category.findByIdAndDelete(id);
  if (!categortoDelete) {
    throw new Error("Category not found");
  }
  res.status(201).json({
    status: "success",
    message: "Category deleted successfully",
  });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const categoryToUpdate = await Category.findByIdAndUpdate(
    id,
    { name: req.body.name },
    {
      new: true,
      runValidators: true,
    }
  );
  if (!categoryToUpdate) {
    throw new Error("Category not found");
  }
  res.status(201).json({
    status: "success",
    message: "Category updated successfully",
    categoryToUpdate,
  });
});
