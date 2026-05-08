const mongoose = require("mongoose");

const mongodbServerUrl = process.env.MONGO_URL;

function createMongodbConnection() {
  return mongoose
    .connect(mongodbServerUrl)
    .then(() => {
      console.log("✅ Connected with MongoDB");
    })
    .catch((err) => {
      console.log("❌ MongoDB Connection Failed:", err.message);
    });
}

module.exports = createMongodbConnection;