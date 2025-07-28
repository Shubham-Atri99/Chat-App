import React, { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { FaUserCircle } from 'react-icons/fa';
import ProfileModal from './ProfileModal';
import SearchDrawer from './SearchDrawer';
import { useChat } from '../../../context/chatProvider';


const Header = () => {
  const { user } = useChat(); 
  const [anchorEl, setAnchorEl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <header className="w-full flex justify-between items-center px-4 py-3 bg-blue-600 text-white shadow-md">
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="bg-white text-blue-600 px-4 py-1 rounded-md font-semibold"
      >
        Search People
      </button>
      <h1 className="text-2xl font-bold">ChatAlike</h1>
      <div className="relative">
        <button onClick={handleMenuClick}>
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
          <MenuItem
            onClick={() => {
              handleMenuClose();
              localStorage.removeItem('userInfo');
              window.location.href = '/'; // simple logout
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </div>

      <ProfileModal open={isModalOpen} onClose={() => setIsModalOpen(false)} user={user} />
      <SearchDrawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </header>
  );
};

export default Header;
