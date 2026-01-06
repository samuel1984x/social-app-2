const express = require("express");
const bodyParser = require("body-parser");

const postRouter = require("./routes/post_routes");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/post", postRouter);

module.exports = app;
