import React from 'react';
import Header from '../pages/components/header/Header';
import MyChats from './components/Mychats';
import ChatBox from './components/ChatBox';

const Chatpage = () => {
  return (
    <div className="h-screen w-full flex flex-col bg-gray-100 dark:bg-gray-900">
      <Header />

      {/* Main chat layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: MyChats */}
        <div className="w-full md:w-1/3 lg:w-1/4 p-4 border-r border-gray-300 dark:border-gray-700 overflow-y-auto">
          <MyChats />
        </div>

        {/* Right: Chat Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            <ChatBox/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatpage;
