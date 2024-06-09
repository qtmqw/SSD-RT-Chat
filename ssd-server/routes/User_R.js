const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const passwordValidator = require("password-validator");
require("dotenv").config();

// db
require("../models/User_model");
const User = mongoose.model("User");

const schema = new passwordValidator();

schema
  .is()
  .min(6)
  .is()
  .max(100)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits()
  .has()
  .not()
  .spaces();

const SignUp = async (req, res) => {
  const { username, email, password, userType } = req.body;

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (!validator.isLength(username, { min: 2, max: 20 })) {
    return res.status(400).json({ error: "Invalid username" });
  }
  const isValidPassword = schema.validate(password, { list: true });
  if (isValidPassword.length > 0) {
    return res.status(400).json({ error: "Invalid password" });
  }

  try {
    const oldUser = await User.findOne({ email });
    const oldUserUsername = await User.findOne({ username });
    if (oldUser) {
      return res.status(400).json({ error: "User with email already exists" });
    }
    if (oldUserUsername) {
      return res
        .status(400)
        .json({ error: "User with username already exists" });
    }
    await User.create({
      username,
      email,
      password: await bcrypt.hash(password, 10),
      userType,
    });
    return res.status(201).json({ status: "OK" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const SignIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION_TIME || "1h",
    });

    res.status(200).json({ status: "OK", data: token });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const allUser = await User.find();
    res.send({ status: "OK", data: allUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

const getUserData = async (req, res) => {
  const { id } = req.params;
  try {
    const userData = await User.findById(id)
      .populate("friends")
      .populate("friendRequests");
    if (!userData) {
      return res.status(404).send("User not found");
    }
    res.send({ status: "OK", data: userData });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server Error" });
  }
};

const checkAdminStatus = async (req, res) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isAdmin = user.userType === "1";

    res.status(200).json({ status: "OK", isAdmin });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
  }
};

const userEdit = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json("User not found");
    }

    user.set(req.body);

    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json(`Error: ${err}`);
  }
};

const sendFriendRequest = async (req, res) => {
  const { id } = req.params;
  const { friendId } = req.body;

  try {
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: "User not found" });
    }

    if (friend.friendRequests.includes(id)) {
      return res.status(400).json({ error: "Friend request already sent" });
    }

    friend.friendRequests.push(id);
    await friend.save();

    res.status(200).json({ message: "Friend request sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

const acceptFriendRequest = async (req, res) => {
  const { id } = req.params;
  const { friendId } = req.body;

  try {
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.friendRequests.includes(friendId)) {
      return res.status(400).json({ error: "Friend request not found" });
    }

    user.friends.push(friendId);
    friend.friends.push(id);

    user.friendRequests = user.friendRequests.filter(
      (requestId) => requestId.toString() !== friendId
    );

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend request accepted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

const removeFriend = async (req, res) => {
  const { userId, friendId } = req.params;

  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: "User or friend not found" });
    }

    user.friends = user.friends.filter((f) => f.toString() !== friendId);

    friend.friends = friend.friends.filter((f) => f.toString() !== userId);

    await user.save();
    await friend.save();

    res.status(200).json({ message: "Friend removed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};

router.post("/signup", SignUp);
router.post("/signin", SignIn);
router.get("/", getAllUsers);
router.get("/isAdmin", checkAdminStatus);
router.patch("/:id", userEdit);
router.get("/:id", getUserData);
router.post("/sendFriendRequest/:id", sendFriendRequest);
router.post("/acceptFriendRequest/:id", acceptFriendRequest);
router.delete("/removeFriend/:userId/:friendId", removeFriend);

module.exports = router;
