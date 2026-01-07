const Comment = require("../models/comment_model");

const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCommentsByPostId = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createComment = async (req, res) => {
  const comment = new Comment({
    postId: req.body.postId,
    sender: req.body.sender,
    content: req.body.content,
  });

  try {
    const savedComment = await comment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedComment)
      return res.status(404).json({ message: "Comment not found" });
    res.json(updatedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const deletedComment = await Comment.findByIdAndDelete(req.params.id);
    if (!deletedComment)
      return res.status(404).json({ message: "Comment not found" });
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllComments,
  getCommentsByPostId,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
};
