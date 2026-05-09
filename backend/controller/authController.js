const User = require("../model/authModel.js");
const cloudinary = require('../routes/cloudinary.js');

function createUser(req, res) {
  const data = req.body;
  const file = req.body.file;

  // Gmail validation
  if (!data.email || !data.email.endsWith("@gmail.com")) {
    return res.send({ ok: false, error: "Only Gmail address allowed (@gmail.com)" });
  }

  cloudinary.uploader.upload(file).then((imageData) => {
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
}

function signin(req, res) {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((userdata) => {
      if (userdata) {
        if (userdata.password === password) {
          res.send({ ok: true, result: "Valid User", user: userdata });
        } else {
          throw Error("Password is Incorrect");
        }
      } else {
        throw Error("User Does not exist");
      }
    })
    .catch((error) => {
      res.send({ ok: false, error: error.message });
    });
}

module.exports = { createUser, signin };