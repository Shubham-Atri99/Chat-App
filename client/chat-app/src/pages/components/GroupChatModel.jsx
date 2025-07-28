import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useChat } from '../../context/chatProvider';
import { debounce } from 'lodash';

const GroupChatModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, chats, setchats } = useChat();

  // Debounced search
  const debouncedSearch = debounce(async (query) => {
    if (!query) return setSearchResults([]);

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setSearchResults(data);
    } catch (err) {
      toast.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  }, 500);

  useEffect(() => {
    debouncedSearch(searchTerm);
    return debouncedSearch.cancel;
  }, [searchTerm]);

  const handleAddUser = (u) => {
    if (selectedUsers.find((user) => user._id === u._id)) {
      return toast.error('User already added');
    }
    setSelectedUsers([...selectedUsers, u]);
  };

  const handleRemoveUser = (u) => {
    setSelectedUsers(selectedUsers.filter((user) => user._id !== u._id));
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length < 2) {
      return toast.error('Group name & at least 2 users are required');
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        '/api/chat/group',
        {
          name: groupName,
          users: selectedUsers.map((u) => u._id),
        },
        config
      );
      setchats([data, ...chats]);
      toast.success('Group created');
      onClose();
    } catch (err) {
      toast.error('Failed to create group');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="scale-95 opacity-0"
            enterTo="scale-100 opacity-100"
            leave="ease-in duration-200"
            leaveFrom="scale-100 opacity-100"
            leaveTo="scale-95 opacity-0"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 align-middle shadow-xl transition-all">
              <Dialog.Title className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                Create Group Chat
              </Dialog.Title>

              <input
                type="text"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full mb-3 px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
              />

              <input
                type="text"
                placeholder="Search users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white mb-3"
              />

              {/* Selected users */}
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedUsers.map((u) => (
                  <span
                    key={u._id}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm cursor-pointer"
                    onClick={() => handleRemoveUser(u)}
                  >
                    {u.name} ✕
                  </span>
                ))}
              </div>

              {/* Search results */}
              <div className="max-h-40 overflow-y-auto space-y-1">
                {loading ? (
                  <p className="text-sm text-gray-400">Loading...</p>
                ) : (
                  searchResults.map((u) => (
                   <div
  key={u._id}
  onClick={() => handleAddUser(u)}
  className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-white"
>
  {u.name}
</div>
                  ))
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleCreateGroup}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Create
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default GroupChatModal;
