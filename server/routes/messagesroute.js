import express from "express"
import protect from "../middleware/authMiddle.js";
import { allMessages, sendMessage } from "../cantrollers/message.js";

const messageRouter=express.Router();

messageRouter.post("/",protect,sendMessage)
messageRouter.get("/:chatId",protect,allMessages)

export default messageRouter;