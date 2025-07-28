import Chat from "../models/Chatmodel.js";
import User from "../models/Usermodel.js";

// Create or fetch one-to-one chat
export const accesschat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("userId param not sent with request");
    return res.status(400).send({ message: "UserId param not sent" });
  }

  try {
    let isChat = await Chat.find({
      isGroupchat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      return res.status(200).send(isChat[0]);
    }

    // No existing chat found, create a new one
    const chatData = {
      chatName: "sender",
      isGroupchat: false,
      users: [req.user._id, userId],
    };

    const createdChat = await Chat.create(chatData);
    const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");

    res.status(200).send(fullChat);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server Error", error: error.message });
  }
};

// Fetch all chats for a logged-in user
export const fetchchats = async (req, res) => {
  try {
    const results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const populatedResults = await User.populate(results, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(200).json(populatedResults);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a group chat
export const groupchat = async (req, res) => {
  const { users, name } = req.body;

  if (!users || !name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  if (!Array.isArray(users) || users.length < 2) {
    return res.status(400).send("At least 2 users are required to form a group");
  }

  users.push(req.user._id); // Add current user to group

  try {
    const groupChat = await Chat.create({
      chatName: name,
      users: users,
      isGroupchat: true,
      groupAdmin: req.user._id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Add a user to group chat
export const groupadd = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(added);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove a user from group chat
export const groupremove = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.json(removed);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
