import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router'
import Homepage from './pages/Homepage'
import Chatpage from './pages/Chatpage'
import { Toaster } from 'react-hot-toast'
import {ChatProvider} from './context/chatProvider'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <BrowserRouter>
     <ChatProvider>
   <Toaster />
    
    <Routes>
      <Route path='/'  element={<Homepage/>}/>
       <Route path='/chats'  element={<Chatpage/>}/>
     </Routes>
    
    </ChatProvider>
    </BrowserRouter>
   
   
     
   
    </>
  )
}

export default App
