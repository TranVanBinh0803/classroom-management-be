import express from "express";
import { conversationController } from "~/controllers/conversationController";
const router = express.Router();

router.post("/createConversation", conversationController.createConversation);
router.post("/:conversationId/sendMessage", conversationController.sendMessage);
router.get("/:conversationId", conversationController.getConversationById);
router.get("/getPersonalConversation/:userId", conversationController.getPersonalConversation);

export const conversationRoute = router;
