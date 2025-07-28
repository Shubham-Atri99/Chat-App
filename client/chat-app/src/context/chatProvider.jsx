import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [selectedChat, setselectedChat] = useState()
  const [chats, setchats] = useState([])
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (!userInfo) {
      navigate('/');
    } else {
      setUser(userInfo);
    }
  }, [navigate]);

  return (
    <ChatContext.Provider value={{ user, setUser ,selectedChat,setselectedChat,chats,setchats}}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
