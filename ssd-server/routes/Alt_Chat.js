const express = require("express");
const AltChat = require("../models/Alternative_Chat");
const User = require("../models/User_model");

module.exports = (io) => {
  const router = express.Router();

  // Get all chats
  router.get("/", async (req, res) => {
    try {
      const chats = await AltChat.find().populate(
        "participants messages.user messages.replyTo messages.forwardedFrom"
      );
      res.json(chats);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Get a specific chat
  router.get("/:id", async (req, res) => {
    try {
      const chat = await AltChat.findById(req.params.id).populate(
        "participants messages.user messages.replyTo messages.forwardedFrom"
      );
      if (chat == null) {
        return res.status(404).json({ message: "Chat not found" });
      }
      res.json(chat);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  // Create a new chat
  router.post("/", async (req, res) => {
    const chat = new AltChat({
      chatName: req.body.chatName,
      participants: req.body.participants,
      messages: req.body.messages,
      isArchived: req.body.isArchived,
    });

    try {
      const newChat = await chat.save();
      res.status(201).json(newChat);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // Update a chat
  router.put("/:id", async (req, res) => {
    try {
      const chat = await AltChat.findById(req.params.id);
      if (chat == null) {
        return res.status(404).json({ message: "Chat not found" });
      }

      if (req.body.chatName != null) {
        chat.chatName = req.body.chatName;
      }
      if (req.body.participants != null) {
        chat.participants = req.body.participants;
      }
      if (req.body.messages != null) {
        chat.messages = req.body.messages;
      }
      if (req.body.isArchived != null) {
        chat.isArchived = req.body.isArchived;
      }

      const updatedChat = await chat.save();
      res.json(updatedChat);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  // Delete a chat
  router.delete("/:id", async (req, res) => {
    try {
      const chat = await AltChat.findById(req.params.id);
      if (chat == null) {
        return res.status(404).json({ message: "Chat not found" });
      }

      await chat.remove();
      res.json({ message: "Deleted chat" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  router.post("/:id/messages", async (req, res) => {
    try {
      const chat = await AltChat.findById(req.params.id);
      if (chat == null) {
        return res.status(404).json({ message: "Chat not found" });
      }

      const message = {
        user: req.body.user,
        content: req.body.content,
        timestamp: new Date(),
        status: req.body.status,
        type: req.body.type,
        replyTo: req.body.replyTo,
        forwardedFrom: req.body.forwardedFrom,
        editedAt: req.body.editedAt,
      };

      chat.messages.push(message);
      await chat.save();

      // Emit the new message event to all clients
      io.emit("new message", message);

      res.status(201).json(message);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });

  return router;
};