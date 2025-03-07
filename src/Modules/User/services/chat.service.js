import { Chat } from "../../../DB/models/chat.model.js";
import { Company } from "../../../DB/models/company.model.js";
import { authenticationMiddleware } from "../../../Middleware/index.middleware.js";
import { socketConnection } from "../../../utils/socket.utils.js";

/* get chat history 'couldn't test' */
export const getChatHistoryService = async (req, res) => {
  const { _id } = req.loggedInUser;
  const { receiverId } = req.params;

  const chat = await Chat.findOne({
    $or: [
      { senderId: _id, receiverId },
      { receiverId: _id, senderId: receiverId },
    ],
  }).populate([
    {
      path: "senderId",
    },
    {
      path: "receiverId",
    },
    {
      path: "messages.senderId",
    },
  ]);
  if (!chat) {
    return res.status(404).json({
      message: "Chat not found",
    });
  }
  return res.status(200).json({
    message: "Chat history found successfully",
    chat,
  });
};

/* send message between hr and user 'couldn't test'*/
export const sendMessageService = async (socket) => {
  return socket.on("sendMessage", async (message) => {
    const loggedInUser = await authenticationMiddleware(
      socket.handshake.auth.accesstoken
    );

    /* check if user is hr */
    const company = await Company.findOne({ HRs: loggedInUser._id });
    if (!company) {
      return socket.emit("errorMessage", {
        message: "Only HR or company owner can start the conversation.",
      });
    }
    const { body, receiverId } = message;
    let chat = await Chat.findOneAndUpdate(
      {
        $or: [
          { senderId: loggedInUser._id, receiverId },
          { receiverId: loggedInUser._id, senderId: receiverId },
        ],
      },
      {
        $addToSet: {
          messages: {
            message: body,
            senderId: loggedInUser._id,
          },
        },
      },
      {
        new: true,
      }
    );

    if (!chat) {
      chat = new Chat({
        senderId: loggedInUser._id,
        receiverId,
        messages: [
          {
            message: body,
            senderId: loggedInUser._id,
          },
        ],
      });
      await chat.save();
    }

    socket.emit("successMessage", {
      message: body,
      chat,
    });

    const receiverSocket = socketConnection.get(receiverId.toString());
    socket.to(receiverSocket).emit("receiveMessage", { body });
  });
};
