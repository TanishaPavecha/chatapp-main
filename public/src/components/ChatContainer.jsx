import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";

export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);


  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChat) return;
      
      setIsLoading(true);
      try {
        const userData = JSON.parse(
          localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
        );
        
        const response = await axios.post(recieveMessageRoute, {
          from: userData._id,
          to: currentChat._id,
        });
        
        
        const formattedMessages = response.data.map(msg => ({
          ...msg,
          fromSelf: msg.from === userData._id,
        
          createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date()
        }));
        
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    return () => {
      setMessages([]);
    };
  }, [currentChat]);

  useEffect(() => {
    if (!socket.current) return;

    const handleReceiveMessage = (msg) => {
      setMessages(prev => [...prev, { 
        message: msg, 
        fromSelf: false,
        createdAt: new Date() 
      }]);
    };

    socket.current.on("msg-receive", handleReceiveMessage);

    return () => {
      socket.current.off("msg-receive", handleReceiveMessage);
    };
  }, [socket, currentChat]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMsg = async (msg) => {
    if (!msg.trim() || isSending) return;

    const userData = JSON.parse(
      localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY)
    );

   
    const newMessage = {
      message: msg,
      fromSelf: true,
      createdAt: new Date(),
      tempId: Date.now() 
    };

    try {
      setIsSending(true);
      
      
      setMessages(prev => [...prev, newMessage]);

      
      socket.current.emit("send-msg", {
        to: currentChat._id,
        from: userData._id,
        msg,
      });

  
      await axios.post(sendMessageRoute, {
        from: userData._id,
        to: currentChat._id,
        message: msg,
      });

    } catch (error) {
      console.error("Error sending message:", error);
   
      setMessages(prev => prev.filter(m => m.tempId !== newMessage.tempId));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat?.avatarImage}`}
              alt={currentChat?.username || "User"}
            />
          </div>
          <div className="username">
            <h3>{currentChat?.username}</h3>
          </div>
        </div>
        <Logout />
      </div>
      
      <div className="chat-messages">
        {isLoading ? (
          <div className="loading-messages">Loading messages...</div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message._id || message.tempId || message.createdAt.getTime()}
                className={`message ${message.fromSelf ? "sended" : "recieved"}`}
              >
                <div className="content">
                  <p>{message.message}</p>
                  <span className="timestamp">
                    {message.createdAt.toLocaleTimeString([], {
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <ChatInput 
        handleSendMsg={handleSendMsg} 
        isSending={isSending}
      />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 78% 12%;
  gap: 0.1rem;
  overflow: hidden;
  height: 100vh;
  
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    background-color: #080420;
    
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      
      .avatar img {
        height: 3rem;
        border-radius: 50%;
      }
      
      .username h3 {
        color: white;
        margin: 0;
      }
    }
  }

  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    background-color: #0d0d30;
    
    .loading-messages {
      color: white;
      text-align: center;
      margin-top: 2rem;
    }
    
    &::-webkit-scrollbar {
      width: 0.4rem;
      &-thumb {
        background-color: #ffffff39;
        border-radius: 1rem;
      }
    }

    .message {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
      
      .content {
        max-width: 70%;
        overflow-wrap: break-word;
        padding: 0.8rem 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: white;
        position: relative;
        
        .timestamp {
          font-size: 0.7rem;
          opacity: 0.7;
          display: block;
          text-align: right;
          margin-top: 0.3rem;
        }
      }
    }

    .sended {
      justify-content: flex-end;
      
      .content {
        background-color: #4f04ff;
        border-bottom-right-radius: 0.2rem;
      }
    }

    .recieved {
      justify-content: flex-start;
      
      .content {
        background-color: #9900ff;
        border-bottom-left-radius: 0.2rem;
      }
    }
  }
`;