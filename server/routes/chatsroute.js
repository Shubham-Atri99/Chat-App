import express from "express";
import { Router } from "express";

import protect from "../middleware/authMiddle.js";
import { accesschat, fetchchats, groupadd, groupchat, groupremove } from "../cantrollers/chat.js";

const chatrouter=express.Router();

chatrouter.route("/").post(protect,accesschat)  
chatrouter.get("/",protect,fetchchats)
chatrouter.post("/group",protect,groupchat);
chatrouter.put("/groupadd",protect,groupadd);
chatrouter.put("/groupremove",protect,groupremove)



export default chatrouter;
