const router = require("express").Router();
const auth = require("../middlewares/isLoggedIn");
const chatController = require("../controllers/chatController");

router.get("/conversation/:id", auth, chatController.createOrGetConversation);

router.get("/conversations", auth, chatController.getConversations);

router.post("/message/:conversationId", auth, chatController.sendMessage);

router.get("/message/:conversationId", auth, chatController.getMessages);

module.exports = router;
