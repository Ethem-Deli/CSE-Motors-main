const express = require("express");
const router = new express.Router();
const messageController = require("../controllers/messageController");
const messageValidation = require("../utilities/message-validation");
const utilities = require("../utilities");

// Protect all message routes
router.use(utilities.checkLogin);

// Inbox
router.get("/", utilities.handleErrors(messageController.buildInbox));

// View message
router.get("/view/:messageId", utilities.handleErrors(messageController.buildMessageView));

// Compose messages
router.get("/compose", utilities.handleErrors(messageController.buildCompose));
router.get("/compose/:messageId", utilities.handleErrors(messageController.buildCompose));

// Send message
router.post(
  "/send",
  messageValidation.sendMessageRules(),
  messageValidation.checkMessageData,
  utilities.handleErrors(messageController.sendMessage)
);

// Archived messages
router.get("/archive", utilities.handleErrors(messageController.buildArchive));

// Delete message pages
router.get("/view/:messageId/delete", utilities.handleErrors(messageController.buildDelete));
router.post("/delete", utilities.handleErrors(messageController.deleteMessage));

// API toggle routes
router.get("/view/:messageId/toggle-read", utilities.handleErrors(messageController.toggleRead));
router.get("/view/:messageId/toggle-archived", utilities.handleErrors(messageController.toggleArchived));

module.exports = router;
