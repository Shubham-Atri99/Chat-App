import React from 'react';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';

const ProfileModal = ({ open, onClose, user }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>User Profile</DialogTitle>
      <DialogContent className="flex flex-col items-center space-y-4 mt-2">
        <img
          src={user?.pic || '/default.jpg'}
          alt="profile"
          className="w-24 h-24 rounded-full object-cover"
        />
        <p className="text-lg font-semibold">{user?.name}</p>
        <p className="text-sm text-gray-500">{user?.email}</p>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
