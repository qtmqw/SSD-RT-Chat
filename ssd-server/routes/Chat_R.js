const express = require("express");
const Chat = require('../models/Chat_model');
const User = require('../models/User_model');

module.exports = (io) => {
  const router = express.Router();

  router.post("/message", async (req, res) => {
    try {
      const userId = req.body.userId;
      const { content } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const message = new Chat({
        user: userId,
        message: content,
      });

      await message.save();

      // Emit the new message to all connected clients
      io.emit("chat message", message);

      res.status(201).json(message);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Get all messages
  router.get("/messages", async (req, res) => {
    try {
      const messages = await Chat.find().populate('user');
      res.json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to retrieve messages" });
    }
  });

  return router;
};
