import { StatusCodes } from "http-status-codes";
import "dotenv/config";
import { ApiError, ApiResponse } from "~/utils/types";
import { db } from "~/config/firebase";
import { v4 as uuidv4 } from "uuid";

const conversationsRef = db.ref("conversations");

const createConversation = async (req, res, next) => {
  try {
    const { participants } = req.body;
    if (!participants) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Missing required fields");
    }
    const id = uuidv4();
    const conversationData = {
      id,
      participants,
    };
    await conversationsRef.child(id).set(conversationData);
    res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          "Create conversation successfully",
          conversationData
        )
      );
  } catch (error) {
    next(error);
  }
};

const getPersonalConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Missing userId");
    }

    const snapshot = await conversationsRef.once("value");
    const data = snapshot.val();
    const result = [];
    if (data) {
      for (const id in data) {
        const conversation = data[id];
        const isParticipant = conversation.participants.some(
          (p) => p.id === userId
        );

        if (isParticipant) {
          result.push(conversation);
        }
      }
    }

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          "Get personal conversations successfully",
          result
        )
      );
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { senderId, text } = req.body;

    if (!conversationId || !senderId || !text) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Missing required fields");
    }

    const conversationSnapshot = await conversationsRef.child(conversationId).once("value");
    if (!conversationSnapshot.exists()) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");
    }

    const conversationData = conversationSnapshot.val();
    const messages = conversationData.messages || [];

    const newMessage = {
      senderId,
      text,
    };

    messages.push(newMessage);

    await conversationsRef.child(conversationId).update({
      messages,
      lastMessage: text,
    });

    return res.status(StatusCodes.OK).json(
      new ApiResponse(
        StatusCodes.OK,
        "Message sent successfully",
        newMessage
      )
    );
  } catch (error) {
    next(error);
  }
};

const getConversationById = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Missing conversationId");
    }

    const conversationSnapshot = await conversationsRef.child(conversationId).once("value");

    if (!conversationSnapshot.exists()) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");
    }

    const conversationData = conversationSnapshot.val();

    return res.status(StatusCodes.OK).json(
      new ApiResponse(
        StatusCodes.OK,
        "Get conversation successfully",
        conversationData
      )
    );
  } catch (error) {
    next(error);
  }
};

export const conversationController = {
  createConversation,
  getPersonalConversation,
  sendMessage,
  getConversationById
};
