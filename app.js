const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database Connection
const dbUrl =
  process.env.DATABASE_URL || "mongodb://localhost:27017/rest_assignment";
mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

// Routes
// const postRouter = require("./routes/post_routes");
const commentRouter = require("./routes/comment_routes");

app.use("/post", postRouter);
app.use("/comments", commentRouter);

module.exports = app;
