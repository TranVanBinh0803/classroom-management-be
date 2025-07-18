import express from "express";
import { conversationController } from "~/controllers/conversationController";
import { allAuthorization } from "~/middlewares/authMiddleware";
const router = express.Router();

router.post(
  "/createConversation",
  allAuthorization,
  conversationController.createConversation
);
router.post(
  "/:conversationId/sendMessage",
  allAuthorization,
  conversationController.sendMessage
);
router.get(
  "/:conversationId",
  allAuthorization,
  conversationController.getConversationById
);
router.get(
  "/getPersonalConversation/:userId",
  allAuthorization,
  conversationController.getPersonalConversation
);

export const conversationRoute = router;
