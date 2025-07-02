import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    room: { type: String, required: true },
    from: { type: String, ref: "User", required: true },
    to:   { type: String, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

export { Message };          // 👈 named export
export default Message;      // 👈 default export
