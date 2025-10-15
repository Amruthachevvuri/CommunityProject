import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  Search,
  CheckCircle
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Messages() {
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const initialConversation = urlParams.get("conversation");
  const itemIdParam = urlParams.get("item");
  
  const [user, setUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(initialConversation);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };
    fetchUser();
  }, []);

  const { data: allMessages = [], isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: () => base44.entities.Message.list("-created_date"),
    enabled: !!user,
    refetchInterval: 5000
  });

  const { data: users = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => base44.entities.Message.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageText("");
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ messageId }) => base44.entities.Message.update(messageId, { read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    }
  });

  const conversations = React.useMemo(() => {
    if (!user) return [];

    const convMap = new Map();

    allMessages.forEach(msg => {
      if (msg.sender_email === user.email || msg.receiver_email === user.email) {
        const otherUser = msg.sender_email === user.email ? msg.receiver_email : msg.sender_email;
        const convId = msg.conversation_id;

        if (!convMap.has(convId)) {
          convMap.set(convId, {
            id: convId,
            otherUserEmail: otherUser,
            lastMessage: msg,
            unreadCount: 0,
            messages: []
          });
        }

        const conv = convMap.get(convId);
        conv.messages.push(msg);

        if (msg.receiver_email === user.email && !msg.read) {
          conv.unreadCount++;
        }

        if (new Date(msg.created_date) > new Date(conv.lastMessage.created_date)) {
          conv.lastMessage = msg;
        }
      }
    });

    return Array.from(convMap.values()).sort((a, b) => 
      new Date(b.lastMessage.created_date) - new Date(a.lastMessage.created_date)
    );
  }, [allMessages, user]);

  const filteredConversations = conversations.filter(conv => {
    const otherUser = users.find(u => u.email === conv.otherUserEmail);
    return !searchQuery || 
      otherUser?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.message?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const currentConversation = conversations.find(c => c.id === selectedConversation);
  const currentMessages = currentConversation?.messages.sort((a, b) => 
    new Date(a.created_date) - new Date(b.created_date)
  ) || [];

  useEffect(() => {
    if (selectedConversation && user) {
      const unreadMessages = currentMessages.filter(
        msg => msg.receiver_email === user.email && !msg.read
      );
      unreadMessages.forEach(msg => {
        markAsReadMutation.mutate({ messageId: msg.id });
      });
    }
  }, [selectedConversation, currentMessages.length]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    const otherUserEmail = currentConversation.otherUserEmail;

    sendMessageMutation.mutate({
      conversation_id: selectedConversation,
      sender_email: user.email,
      receiver_email: otherUserEmail,
      message: messageText,
      item_id: itemIdParam || null
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-96 w-full max-w-6xl" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col">
      <div className="p-6 border-b bg-white">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Connect with donors and receivers</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-full md:w-96 border-r bg-white flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No conversations yet</p>
                <p className="text-sm text-gray-500 mt-1">Start chatting with donors!</p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conv) => {
                  const otherUser = users.find(u => u.email === conv.otherUserEmail);
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={`w-full p-4 text-left hover:bg-gray-50 smooth-transition ${
                        selectedConversation === conv.id ? "bg-emerald-50" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500">
                          <AvatarFallback className="text-white font-bold">
                            {otherUser?.full_name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900 truncate">
                              {otherUser?.full_name || "User"}
                            </p>
                            {conv.unreadCount > 0 && (
                              <Badge className="bg-red-500 text-white">{conv.unreadCount}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{conv.lastMessage.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(conv.lastMessage.created_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-blue-500">
                    <AvatarFallback className="text-white font-bold">
                      {users.find(u => u.email === currentConversation?.otherUserEmail)?.full_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {users.find(u => u.email === currentConversation?.otherUserEmail)?.full_name || "User"}
                    </p>
                    {users.find(u => u.email === currentConversation?.otherUserEmail)?.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {currentMessages.map((msg) => {
                    const isOwnMessage = msg.sender_email === user.email;
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                            isOwnMessage
                              ? "bg-gradient-to-r from-emerald-500 to-blue-500 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? "text-white/70" : "text-gray-500"}`}>
                            {new Date(msg.created_date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="p-4 border-t bg-gray-50">
                <div className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="gradient-primary text-white"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <MessageCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}