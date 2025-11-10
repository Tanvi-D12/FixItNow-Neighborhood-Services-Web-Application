import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';

const ChatMessageModal = () => {
  const { user } = useAuth();
  const {
    conversations,
    selectedConversation,
    messages,
    isChatOpen,
    isConnected,
    loading,
    selectConversation,
    sendMessage,
    closeChat,
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const content = newMessage.trim();
    setNewMessage('');

    try {
      const [userId1, userId2] = selectedConversation.id.split('-').map(id => parseInt(id));
      const receiverId = userId1 === user.id ? userId2 : userId1;
      await sendMessage(receiverId, content);
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(content); // Restore message on error
    }
  };

  const handleConversationClick = (conversation) => {
    selectConversation(conversation);
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-96 h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <h3 className="font-semibold">Messages</h3>
          </div>
          <button
            onClick={closeChat}
            className="text-white hover:text-gray-200 text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-2">
              {conversations.length === 0 ? (
                <div className="text-center text-gray-500 text-sm py-4">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleConversationClick(conv)}
                    className={`p-2 mb-1 rounded cursor-pointer transition-colors ${
                      selectedConversation?.id === conv.id
                        ? 'bg-blue-100 border-l-4 border-blue-500'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {conv.otherUserName}
                    </div>
                    {conv.lastMessageText && (
                      <div className="text-xs text-gray-600 truncate">
                        {conv.lastMessageText}
                      </div>
                    )}
                    {conv.unreadCount > 0 && (
                      <div className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 mt-1 inline-block">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <h4 className="font-medium text-gray-900">
                    {selectedConversation.otherUserName}
                  </h4>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {loading ? (
                    <div className="text-center text-gray-500">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwnMessage = msg.senderId === user.id;
                      const messageText = msg.text || msg.content || '';
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              isOwnMessage
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-900'
                            }`}
                          >
                            <div>{messageText}</div>
                            <div
                              className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                              }`}
                            >
                              {msg.sentAt && new Date(msg.sentAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={isConnected ? "Type a message..." : "Connecting... You can still compose."}
                      className={`flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !isConnected ? 'bg-gray-50' : ''
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !newMessage.trim()}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        loading || !newMessage.trim()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">💬</div>
                  <p>Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessageModal;
