const mongoose = require("mongoose");
const Post = require("../models/post_model");

const addPost = async (req, res) => {
  try {
    const { message, sender } = req.body;
    if (!message || !sender) {
      return res.status(400).json({ message: "message and sender are required" });
    }

    const post = await Post.create({ message, sender });
    return res.status(201).json(post);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.sender) filter.sender = req.query.sender;

    const posts = await Post.find(filter);
    return res.json(posts);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getPostById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "invalid post id" });
  }

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "post not found" });
    return res.json(post);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const updatePost = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "invalid post id" });
  }

  const { message, sender } = req.body;
  if (!message || !sender) {
    return res.status(400).json({ message: "message and sender are required" });
  }

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "post not found" });

    post.message = message;
    post.sender = sender;
    await post.save();

    return res.json(post);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = { addPost, getPosts, getPostById, updatePost };
