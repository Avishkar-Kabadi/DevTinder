const router = require("express").Router();
const auth = require("../middlewares/isLoggedIn");
const chatController = require("../controllers/chatController");
const callController = require("../controllers/callController");

router.get("/conversation/:id", auth, chatController.createOrGetConversation);

router.get("/conversations", auth, chatController.getConversations);

router.post("/message/:conversationId", auth, chatController.sendMessage);

router.get("/message/:conversationId", auth, chatController.getMessages);

// Call history
router.post("/calls", auth, callController.saveCallHistory);
router.get("/calls", auth, callController.getCallHistory);

module.exports = router;

