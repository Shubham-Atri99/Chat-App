import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa';
import { useChat } from '../../context/chatProvider';
import GroupChatModal from './GroupChatModel';

const MyChats = () => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { user, chats, setchats,selectedChat,setselectedChat } = useChat();

  const fetchChats = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get('/api/chat', config);
      setchats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChatName = (chat) => {
    if (chat.isGroupchat) return chat.chatName;
    return chat.users
      .filter((u) => u._id !== user._id)
      .map((u) => u.name)
      .join(', ');
  };

  useEffect(() => {
    if (user) fetchChats();
  }, [user]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">My Chats</h2>
        <button
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-700 transition"
          onClick={() => setIsModalOpen(true)}
        >
          <FaPlus />
          Group
        </button>
      </div>

      {/* Group Chat Modal */}
      <GroupChatModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : chats.length === 0 ? (
          <div className="text-center text-gray-500">No chats found.</div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat._id}
              className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 p-3 rounded-lg cursor-pointer transition shadow-sm"
              onClick={() => setselectedChat(chat)}
            >
              <p className="text-gray-900 dark:text-gray-100 font-medium truncate">
                {getChatName(chat)}
              </p>
              {chat.latestMessage && (
  <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
    <strong>{chat.latestMessage?.sender?.name || 'Unknown'}:</strong>{' '}
    {chat.latestMessage.content}
  </p>
)}

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyChats;
