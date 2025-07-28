import React from 'react';
import { useChat } from '../../context/chatProvider';
import SingleChat from './SingleChat';


const ChatBox = () => {
  const { selectedChat } = useChat();

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      {selectedChat ? (
        <SingleChat />
      ) : (
        <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-300">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
};

export default ChatBox;
