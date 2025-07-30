import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/chatProvider';
import axios from 'axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const ENDPOINT = 'http://localhost:4069';
let socket;

const SingleChat = () => {
  const { selectedChat, user, setSelectedChat, notification, setnotification } = useChat();

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [groupUsers, setGroupUsers] = useState([]);
  const [showAddUserInput, setShowAddUserInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(null);

  const typingTimeout = useRef(null);
  const selectedChatRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit('setup', user);

    socket.on('connected', () => console.log('Socket connected'));

    socket.on('typing', ({ user: typingUser, room }) => {
      if (selectedChatRef.current && selectedChatRef.current._id === room && typingUser !== user.name) {
        setIsTyping(typingUser);
      }
    });

    socket.on('stop typing', (room) => {
      if (selectedChatRef.current && selectedChatRef.current._id === room) {
        setIsTyping(null);
      }
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    selectedChatRef.current = selectedChat;

    const fetchMessages = async () => {
      if (!selectedChat) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
        setMessages(data);
        socket.emit('join chat', selectedChat._id);
      } catch {
        toast.error('Failed to fetch messages');
      }
    };

    const fetchGroupUsers = () => {
      if (selectedChat?.isGroupchat && selectedChat.users) {
        setGroupUsers(selectedChat.users);
      }
    };

    fetchMessages();
    fetchGroupUsers();
  }, [selectedChat, user.token]);

  useEffect(() => {
  selectedChatRef.current = selectedChat; // keep ref updated
}, [selectedChat]);

useEffect(() => {
  if (!socket) return;

  const handleMessageReceived = (newMessage) => {
    const incomingChatId = newMessage.chat._id?.toString();
    const openChatId = selectedChatRef.current?._id?.toString();

    if (!openChatId || openChatId !== incomingChatId) {
      const alreadyExists = notification.some((n) => n._id === newMessage._id);
      if (!alreadyExists) {
        setnotification((prev) => [newMessage, ...prev]);
        toast(`🔔 New message from ${newMessage.sender.name}`);
      }
    } else {
      setMessages((prev) => [...prev, newMessage]);
    }
  };

  socket.on("message received", handleMessageReceived);

  return () => {
    socket.off("message received", handleMessageReceived);
  };
}, [notification]);



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (e) => {
    setNewMsg(e.target.value);
    if (!socket || !selectedChat) return;

    if (!typing) {
      setTyping(true);
      socket.emit('typing', { room: selectedChat._id, user: user.name });
    }

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop typing', selectedChat._id);
      setTyping(false);
    }, 2000);
  };

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
    socket.emit('stop typing', selectedChat._id);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        '/api/message',
        { content: newMsg, chatId: selectedChat._id },
        config
      );
      socket.emit('new message', data);
      setMessages((prev) => [...prev, data]);
      setNewMsg('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  const isAdmin = selectedChat?.groupAdmin?._id === user._id;

  const handleRemoveUser = async (userId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/chat/groupremove`, { chatId: selectedChat._id, userId }, config);
      toast.success('User removed');
      setGroupUsers(data.users);
      if (userId === user._id) setSelectedChat(null);
    } catch {
      toast.error('Failed to remove user');
    }
  };

  const handleUserSearch = async (query) => {
    setSearchTerm(query);
    if (!query.trim()) return setSearchResults([]);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setSearchResults(data);
    } catch {
      toast.error('Search failed');
    }
  };

  const handleAddUser = async (userToAdd) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(
        `/api/chat/groupadd`,
        { chatId: selectedChat._id, userId: userToAdd._id },
        config
      );
      toast.success('User added');
      setGroupUsers(data.users);
      setSearchTerm('');
      setSearchResults([]);
      setShowAddUserInput(false);
    } catch {
      toast.error('Failed to add user');
    }
  };

  const handleLeaveGroup = () => {
    handleRemoveUser(user._id);
    toast.success('You left the group');
  };

  if (!selectedChat) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-300">
        Select a chat to start messaging
      </div>
    );
  }

  const otherUser = !selectedChat.isGroupchat && selectedChat.users
    ? selectedChat.users.find((u) => u._id !== user._id)
    : null;

  return (
    <div className="flex flex-col h-full px-4 sm:px-6 md:px-8 py-4 w-full max-w-5xl mx-auto">
      <div className="pb-2 border-b dark:border-gray-700 text-xl font-semibold text-gray-800 dark:text-white flex justify-between items-center">
        <span>
          {selectedChat.isGroupchat ? selectedChat.chatName : otherUser?.name || ''}
        </span>
        {selectedChat.isGroupchat && (
          <button
            onClick={handleLeaveGroup}
            className="text-sm text-red-600 hover:underline"
          >
            Leave Group
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto mt-4 space-y-2 scrollbar-hide">
        {messages.map((msg) => {
          const isOwnMessage = msg.sender?._id === user._id;
          const senderName = msg.sender?.name || '';

          return (
            <div
              key={msg._id}
              className={`max-w-[70%] px-4 py-2 rounded-lg break-words ${
                isOwnMessage
                  ? 'ml-auto bg-blue-600 text-white'
                  : 'mr-auto bg-gray-300 dark:bg-gray-600 text-black dark:text-white'
              }`}
            >
              {selectedChat.isGroupchat && !isOwnMessage && (
                <div className="text-sm font-semibold mb-1">{senderName}</div>
              )}
              <div>{msg.content}</div>
            </div>
          );
        })}
        {isTyping && (
          <div className="text-gray-500 text-sm italic ml-2">
            {selectedChat.isGroupchat ? `${isTyping} is typing...` : 'Typing...'}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMsg}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default SingleChat;
