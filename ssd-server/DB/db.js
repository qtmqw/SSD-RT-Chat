const mongoose = require("mongoose");

mongoose.set('strictQuery', true);

mongoose.connect(process.env.mongoUrl)
  .then(() => console.log("DB CONNECTED"))
  .catch(error => console.error("connection error:", error));

module.exports = mongoose.connection;