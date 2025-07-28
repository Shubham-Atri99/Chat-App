import React, { useState } from 'react';
import { Drawer } from '@mui/material';
import axios from 'axios';
import { useChat } from '../../../context/chatProvider';
import toast from 'react-hot-toast';

const SearchDrawer = ({ open, onClose }) => {
  const { user, setselectedChat } = useChat();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!search) return;
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setResults(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error(`Failed to load search results: ${err.message}`);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoading(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post("/api/chat", { userId }, config);
      setselectedChat(data);
      setLoading(false);
      onClose();
    } catch (error) {
      setLoading(false);
      toast.error(`Failed to access chat: ${error.message}`);
    }
  };

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <div className="w-80 p-4 bg-white h-full">
        <h2 className="text-lg font-bold mb-2">Search Users</h2>
        <input
          type="text"
          placeholder="Enter name"
          className="w-full px-3 py-2 border rounded-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="w-full mt-2 bg-blue-600 text-white py-2 rounded-md"
        >
          Search
        </button>

        <div className="mt-4 space-y-2">
          {loading && <p className="text-sm text-gray-500">Loading...</p>}
          {!loading && results.map((user) => (
            <div
              key={user._id}
              className="p-2 border rounded-md hover:bg-gray-100 cursor-pointer"
              onClick={() => accessChat(user._id)}
            >
              {user.name}
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
};

export default SearchDrawer;
