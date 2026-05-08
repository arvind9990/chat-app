const User = require("../model/authModel.js");
const cloudinary = require('../routes/cloudinary.js');  // ✅ correct path

function createUser(req, res) {
  //receive the data of request
  const data = req.body;
  const file = req.body.file;

  //Cloudinary
  cloudinary.uploader.upload(file).then((imageData) => {
    //Create a object for Model Class
    const user = new User({ ...data, file: imageData.secure_url });
    user
      .save()
      .then(() => {
        res.send({ ok: true, result: "User Account Created Successfully" });
      })
      .catch((error) => {
        res.send({ ok: false, error: "Failed to Create Account For User" });
        console.log(error);
      });
  });

  //save the user data
}

function signin(req, res) {
  //Access the data from request
  const { email, password } = req.body;

  //Validate the data

  //access the collection / User Model Class
  User.findOne({ email })
    .then((userdata) => {
      if (userdata) {
        if (userdata.password === password) {
          // JWT Token
          res.send({ ok: true, result: "Valid User", user: userdata });
        } else {
          throw Error("Password is Incorrect");
        }
      } else {
        throw Error("User Does not exit");
      }
    })
    .catch((error) => {
      res.send({ ok: false, error: error.message });
    });
}

module.exports = { createUser, signin };