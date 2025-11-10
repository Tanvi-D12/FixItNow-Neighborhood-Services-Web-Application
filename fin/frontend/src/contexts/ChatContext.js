import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/apiService';
import webSocketService from '../services/webSocketService';
import toast from 'react-hot-toast';

const ChatContext = createContext();

// Admin user ID constant
const ADMIN_USER_ID = 1;

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  const roomSubscriptionRef = useRef(null);
  const notificationSubscriptionRef = useRef(null);

  // Initialize WebSocket connection when user is available
  useEffect(() => {
    if (!user) {
      disconnectWebSocket();
      return;
    }

    initializeChat();
    return () => {
      disconnectWebSocket();
    };
  }, [user]);

  // Update total unread count when conversations change
  useEffect(() => {
    const total = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    setTotalUnreadCount(total);
  }, [conversations]);

  const initializeChat = async () => {
    try {
      // Connect to WebSocket
      await webSocketService.connect(
        () => {
          setIsConnected(true);
          console.log('Chat WebSocket connected');

          // Subscribe to user notifications
          notificationSubscriptionRef.current = webSocketService.subscribeToUserNotifications(
            user.id,
            handleNewMessage
          );
        },
        (error) => {
          setIsConnected(false);
          console.error('Chat WebSocket connection error:', error);
        }
      );

      // Load conversations
      await loadConversations();
    } catch (error) {
      console.error('Failed to initialize chat:', error);
    }
  };

  const disconnectWebSocket = () => {
    if (roomSubscriptionRef.current) {
      roomSubscriptionRef.current.unsubscribe();
      roomSubscriptionRef.current = null;
    }
    if (notificationSubscriptionRef.current) {
      notificationSubscriptionRef.current.unsubscribe();
      notificationSubscriptionRef.current = null;
    }
    webSocketService.disconnect();
    setIsConnected(false);
  };

  const loadConversations = async () => {
    if (!user) return;

    try {
      const response = await apiService.getConversations(user.id);
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;

    setLoading(true);
    try {
      const response = await apiService.getMessages(conversationId);
      const normalized = (response.data || []).map(msg => ({
        ...msg,
        text: msg.text || msg.content,
        roomId: msg.roomId || conversationId,
      }));
      setMessages(normalized);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = (message) => {
    console.log('New message received:', message);

    const normalizedMessage = {
      ...message,
      text: message.text || message.content,
      roomId: message.roomId || (() => {
        if (message.senderId && message.receiverId) {
          return `${Math.min(message.senderId, message.receiverId)}-${Math.max(message.senderId, message.receiverId)}`;
        }
        return undefined;
      })(),
    };

    const targetRoomId = normalizedMessage.roomId;

    // Update messages if it's for the current conversation
    if (selectedConversation && targetRoomId === selectedConversation.id) {
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === message.id);
        if (!exists) {
          return [...prev, normalizedMessage];
        }
        return prev;
      });
    }

    // Update conversation list
    setConversations(prev => {
      if (!targetRoomId) {
        return prev;
      }

      const existingConv = prev.find(conv => conv.id === targetRoomId);
      const otherUserId = normalizedMessage.senderId === user.id
        ? normalizedMessage.receiverId
        : normalizedMessage.senderId;
      const otherUserName = normalizedMessage.senderId === user.id
        ? normalizedMessage.receiverName
        : normalizedMessage.senderName;

      if (existingConv) {
        return prev.map(conv => {
          if (conv.id === targetRoomId) {
            return {
              ...conv,
              lastMessageText: normalizedMessage.text,
              lastMessageTime: normalizedMessage.sentAt || new Date().toISOString(),
              lastMessageSender: normalizedMessage.senderName || normalizedMessage.senderId,
              unreadCount: (conv.unreadCount || 0) + (normalizedMessage.senderId !== user.id ? 1 : 0)
            };
          }
          return conv;
        });
      }

      // Create placeholder conversation when a new message arrives for the first time
      if (!otherUserId) {
        return prev;
      }

      const placeholderConversation = {
        id: targetRoomId,
        otherUserId,
        otherUserName: otherUserName || `User ${otherUserId}`,
        lastMessageText: normalizedMessage.text,
        lastMessageTime: normalizedMessage.sentAt || new Date().toISOString(),
        unreadCount: normalizedMessage.senderId !== user.id ? 1 : 0,
        lastMessageSender: normalizedMessage.senderName || normalizedMessage.senderId,
      };

      return [placeholderConversation, ...prev];
    });

    // Show toast notification if chat is not open
    if (!isChatOpen && normalizedMessage.senderId !== user.id) {
      toast.success(`New message from ${normalizedMessage.senderName || 'someone'}`);
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);

    // Subscribe to conversation updates
    if (roomSubscriptionRef.current) {
      roomSubscriptionRef.current.unsubscribe();
    }

    roomSubscriptionRef.current = webSocketService.subscribe(
      `/topic/conversation/${conversation.id}`,
      (message) => {
        const parsedMessage = JSON.parse(message.body);
        handleNewMessage(parsedMessage);
      }
    );

    // Mark messages as read
    if (isConnected) {
      webSocketService.markAsRead(conversation.id, user.id);
      // Update local unread count
      setConversations(prev => prev.map(conv =>
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
      ));
    }
  };

  const sendMessage = async (receiverId, content) => {
    if (!user || !content.trim()) return;

    try {
      const messageData = {
        senderId: user.id,
        receiverId: receiverId,
        text: content.trim(),
      };

      const response = await apiService.sendMessage(messageData);

      // Add message to local state immediately
      const conversationId = `${Math.min(user.id, receiverId)}-${Math.max(user.id, receiverId)}`;
      const newMessage = {
        ...response.data,
        text: response.data?.text || response.data?.content || content.trim(),
        roomId: response.data?.roomId || conversationId,
      };
      setMessages(prev => [...prev, newMessage]);

      // Update conversation
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessageText: newMessage.text,
            lastMessageTime: new Date().toISOString(),
            lastMessageSender: user.name,
          };
        }
        return conv;
      }));

      return newMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  const startConversation = async (otherUserId, initialMessage = null, options = {}) => {
    if (!user) return;

    try {
      // Check if conversation already exists
      const existingConv = conversations.find(conv =>
        conv.otherUserId === otherUserId ||
        conv.id === `${Math.min(user.id, otherUserId)}-${Math.max(user.id, otherUserId)}`
      );

      if (existingConv) {
        await selectConversation(existingConv);
        setIsChatOpen(true);
        return existingConv;
      }

      // Create new conversation
      const conversationId = `${Math.min(user.id, otherUserId)}-${Math.max(user.id, otherUserId)}`;
      const otherUserName = options.otherUserName || options.otherUser?.name || `User ${otherUserId}`;

      const newConversation = {
        id: conversationId,
        otherUserId: otherUserId,
        otherUserName,
        lastMessageText: null,
        lastMessageTime: null,
        unreadCount: 0,
        lastMessageSender: null
      };

    setConversations(prev => [newConversation, ...prev]);
    await selectConversation(newConversation);
      setIsChatOpen(true);

      // Send initial message if provided
      if (initialMessage) {
        await sendMessage(otherUserId, initialMessage);
      }

      return newConversation;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      throw error;
    }
  };

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setSelectedConversation(null);
    setMessages([]);
  };

  // Start conversation with admin
  const startAdminConversation = async (initialMessage = null) => {
    return startConversation(ADMIN_USER_ID, initialMessage, {
      otherUserName: 'Admin Support'
    });
  };

  const value = {
    conversations,
    selectedConversation,
    messages,
    isChatOpen,
    isConnected,
    loading,
    totalUnreadCount,
    selectConversation,
    sendMessage,
    startConversation,
    startAdminConversation,
    toggleChat,
    closeChat,
    loadConversations,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
