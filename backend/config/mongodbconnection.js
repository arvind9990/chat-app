const mongoose = require("mongoose");
const mongodbServerUrl = "mongodb://localhost:27017/chatappDB";
function createMongodbConnection() {
  //Connect with Mongodb Server and Database
  mongoose
    .connect(mongodbServerUrl)
    .then(() => {
      console.log(" Connected with Mongodb Server & chatappDB Database");
    })
    .catch(() => {
      console.log("Failed to Connect with Mongodb Server");
    });
}

module.exports = createMongodbConnection;