import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    mode: {
      type: String,
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "", 
    },
    imageURL: {
      type: String,
      default: "",
    },
    unread: {
      type: Boolean,
      default: false,
    },
    msgDate: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
