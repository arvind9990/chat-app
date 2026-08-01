const User = require("../model/authModel.js");
const cloudinary = require('../routes/cloudinary.js');
const bcrypt = require('bcryptjs');

async function createUser(req, res) {
  const data = req.body;
  const file = req.body.file;

  if (!data.email || !data.email.endsWith("@gmail.com")) {
    return res.send({ ok: false, error: "Only Gmail address allowed (@gmail.com)" });
  }

  if (!data.username || data.username.trim() === "") {
    return res.send({ ok: false, error: "Username is required" });
  }

  if (!data.password || data.password.length < 6) {
    return res.send({ ok: false, error: "Password must be at least 6 characters" });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res.send({ ok: false, error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    let uploadedFile = file;
    if (file) {
      try {
        const imageData = await cloudinary.uploader.upload(file, {
          folder: "chat-app-local",
        });
        uploadedFile = imageData.secure_url;
      } catch (uploadError) {
        console.log("Cloudinary upload failed, using base64 fallback:", uploadError.message);
      }
    }

    const user = new User({
      ...data,
      password: hashedPassword,
      file: uploadedFile,
    });

    await user.save();
    res.send({ ok: true, result: "User Account Created Successfully" });
  } catch (error) {
    console.log(error);
    res.send({ ok: false, error: "Failed to Create Account" });
  }
}

async function signin(req, res) {
  const { email, password } = req.body;

  if (!email || !email.endsWith("@gmail.com")) {
    return res.send({ ok: false, error: "Only Gmail address allowed" });
  }

  try {
    const userdata = await User.findOne({ email });
    if (!userdata) {
      return res.send({ ok: false, error: "User does not exist" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, userdata.password);
    if (!isMatch) {
      return res.send({ ok: false, error: "Password is Incorrect" });
    }

    res.send({ ok: true, result: "Valid User", user: userdata });
  } catch (error) {
    res.send({ ok: false, error: error.message });
  }
}

module.exports = { createUser, signin };