import express from "express";
import { allUsers, userLogin, userRegister } from "../cantrollers/user.js";
import protect from "../middleware/authMiddle.js";

const userrouter = express.Router();


userrouter.post("/", userRegister);


userrouter.post("/login", userLogin);


userrouter.get("/", protect, allUsers);

export default userrouter;
