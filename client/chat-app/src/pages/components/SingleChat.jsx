import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/chatProvider';
import axios from 'axios';
import toast from 'react-hot-toast';

const SingleChat = () => {
  const { selectedChat, user, setSelectedChat } = useChat();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [groupUsers, setGroupUsers] = useState([]);
  const [showAddUserInput, setShowAddUserInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
        setMessages(data);
      } catch {
        toast.error('Failed to fetch messages');
      }
    };

    const fetchGroupUsers = () => {
      if (selectedChat?.isGroupchat) {
        setGroupUsers(selectedChat.users);
      }
    };

    fetchMessages();
    fetchGroupUsers();
  }, [selectedChat]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
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
      setMessages([...messages, data]);
      setNewMsg('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  const isAdmin = selectedChat?.groupAdmin?._id === user._id;

  const handleRemoveUser = async (userId) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.put(
        `/api/chat/groupremove`,
        { chatId: selectedChat._id, userId },
        config
      );
      toast.success('User removed');
      setGroupUsers(data.users);
      if (userId === user._id) {
        setSelectedChat(null); // If current user removed
      }
    } catch {
      toast.error('Failed to remove user');
    }
  };

  const handleUserSearch = async (query) => {
    setSearchTerm(query);
    if (!query.trim()) return setSearchResults([]);

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setSearchResults(data);
    } catch {
      toast.error('Search failed');
    }
  };

  const handleAddUser = async (userToAdd) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
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

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="pb-2 border-b dark:border-gray-700 text-xl font-semibold text-gray-800 dark:text-white flex justify-between items-center">
        <span>
          {selectedChat.isGroupchat
            ? selectedChat.chatName
            : selectedChat.users.find(u => u._id !== user._id).name}
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mt-4 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`p-2 rounded-lg w-fit ${
              msg.sender._id === user._id
                ? 'ml-auto bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
            }`}
          >
            <strong>{msg.sender.name}:</strong> {msg.content}
          </div>
        ))}
      </div>

      {/* Group Controls */}
      {selectedChat.isGroupchat && (
        <div className="mt-4">
          <p className="font-semibold text-sm text-gray-600 dark:text-gray-300 mb-2">Group Members</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {groupUsers.map((u) => (
              <span
                key={u._id}
                className="text-sm bg-gray-300 dark:bg-gray-600 px-2 py-1 rounded text-black dark:text-white cursor-pointer"
                onClick={() => isAdmin && u._id !== user._id && handleRemoveUser(u._id)}
              >
                {u.name} {isAdmin && u._id !== user._id ? '✕' : ''}
              </span>
            ))}
          </div>

          {isAdmin && (
            <>
              <button
                onClick={() => setShowAddUserInput(!showAddUserInput)}
                className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
              >
                + Add User
              </button>

              {showAddUserInput && (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleUserSearch(e.target.value)}
                    placeholder="Search user..."
                    className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {searchResults.map((result) => (
                      <div
                        key={result._id}
                        className="p-2 bg-gray-200 dark:bg-gray-600 text-sm rounded-md cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-500 text-black dark:text-white"
                        onClick={() => handleAddUser(result)}
                      >
                        {result.name} ({result.email})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
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
