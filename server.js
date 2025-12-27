const mongoose = require("mongoose");
const app = require("./app");

const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("connected to mongo");
    app.listen(port, () => console.log("server started on port " + port));
  })
  .catch((err) => {
    console.error("mongo connection error:", err);
    process.exit(1);
  });
