import mongoose from "mongoose";
const { Schema } = mongoose;

const chatSchema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    messages: [
      {
        message: { type: String, required: true },
        senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
