import React, { useState, useEffect, useRef } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { FaUserCircle } from 'react-icons/fa';
import ProfileModal from './ProfileModal';
import SearchDrawer from './SearchDrawer';
import { useChat } from '../../../context/chatProvider';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

const ENDPOINT = 'http://localhost:4069';
let socket;

const Header = () => {
  const { user, notification, setnotification, setSelectedChat, selectedChat } = useChat();

  const [anchorEl, setAnchorEl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Setup socket connection
  useEffect(() => {
  socket = io(ENDPOINT);
  socket.emit('setup', user);

  socket.on('notification', (notifData) => {
    const openChatId = selectedChat?._id?.toString();
    const incomingChatId = notifData.chat?._id?.toString();

    // ✅ Only for group chats AND chat is NOT open
    if (notifData.chat?.isGroupchat && openChatId !== incomingChatId) {
      setnotification((prev) => {
        const exists = prev.find((n) => n._id === notifData._id);
        if (!exists) {
          toast.success(`🔔 ${notifData.chat.chatName}: ${notifData.sender.name}`);
          return [notifData, ...prev];
        }
        return prev;
      });
    }
  });

  return () => {
    socket.disconnect();
  };
}, [user, selectedChat]);



  // Close notification dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleNotificationClick = () => {
    setNotifOpen((prev) => !prev);
  };

  const handleNotifSelect = (notif) => {
    setSelectedChat(notif.chat);
    setnotification((prev) => prev.filter((n) => n._id !== notif._id));
    setNotifOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/';
  };

  return (
    <header className="w-full flex justify-between items-center px-4 py-3 bg-blue-600 text-white shadow-md relative z-50">
      {/* Search Button */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="bg-white text-blue-600 px-4 py-1 rounded-md font-semibold"
      >
        Search People
      </button>

      {/* App Title */}
      <h1 className="text-2xl font-bold">ChatAlike</h1>

      {/* Right-side Icons */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button onClick={handleNotificationClick} className="relative focus:outline-none">
            🔔
            {notification.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {notification.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white text-black rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              {notification.length === 0 ? (
                <div className="p-4 text-center text-gray-600">No new messages</div>
              ) : (
                notification.map((notif) => (
                  <div
                    key={notif._id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b"
                    onClick={() => handleNotifSelect(notif)}
                  >
                    <div className="font-semibold">
                      {notif.chat.isGroupchat ? notif.chat.chatName : notif.sender.name}
                    </div>
                    <div className="text-sm text-gray-600 truncate">
                      {notif.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button onClick={handleMenuClick} className="focus:outline-none">
            <FaUserCircle size={28} />
          </button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem
              onClick={() => {
                setIsModalOpen(true);
                handleMenuClose();
              }}
            >
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </div>
      </div>

      {/* Modals */}
      <ProfileModal open={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} />
      <SearchDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </header>
  );
};

export default Header;
