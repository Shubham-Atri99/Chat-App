import Chat from "../models/Chatmodel.js";
import Message from "../models/Messagemodel.js";
import User from "../models/Usermodel.js";

export const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.sendStatus(400);
  }

  const newMessage = {
    sender: req.user._id, // corrected line
    content,
    chat: chatId,
  };

  try {
    let message = await Message.create(newMessage);

    message = await Message.findById(message._id)
      .populate("sender", "name pic")
      .populate({
        path: "chat",
        populate: { path: "users", select: "name pic email" }
      });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    console.error("Message send error:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
};


export const allMessages=async(req,res)=>{
    try {
        const messages=await Message.find({chat:req.params.chatId})
        .populate("sender","name pic email")
        .populate("chat")

        res.json(messages)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
}