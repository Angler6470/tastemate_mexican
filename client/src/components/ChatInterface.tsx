import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { ChatRequest, ChatResponse } from "@shared/schema";

type ChatMessage = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

type ChatInterfaceProps = {
  spiceLevel: number;
  selectedFlavors: string[];
  onRecommendations: (recommendations: string[]) => void;
};

export function ChatInterface({ spiceLevel, selectedFlavors, onRecommendations }: ChatInterfaceProps) {
  const { language, t } = useI18n();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (chatRequest: ChatRequest) => {
      const response = await apiRequest("POST", "/api/chat", chatRequest);
      return response.json() as Promise<ChatResponse>;
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: data.message,
        isUser: false,
        timestamp: new Date(),
      }]);
      
      if (data.recommendations.length > 0) {
        onRecommendations(data.recommendations);
      }
    },
    onError: (error) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: language === "es" 
          ? "Lo siento, no pude procesar tu solicitud. Por favor, intenta de nuevo." 
          : "Sorry, I couldn't process your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }]);
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    }]);

    // Send to AI
    chatMutation.mutate({
      message: message.trim(),
      spiceLevel,
      flavors: selectedFlavors,
      language: language as "en" | "es",
    });

    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="mb-6">
      <div className="ocean-card rounded-xl p-4 mb-4 h-48 overflow-y-auto transition-colors duration-300">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat-bubble mb-3 max-w-xs ${
              msg.isUser 
                ? "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white ml-auto" 
                : "bg-primary text-white"
            } p-3 rounded-lg`}
          >
            <p className="text-sm">{msg.content}</p>
          </div>
        ))}
        
        {chatMutation.isPending && (
          <div className="chat-bubble bg-gray-200 dark:bg-gray-600 p-3 rounded-lg mb-3 max-w-xs">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t("home.aiCooking")}
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-3">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t("home.chatPlaceholder")}
          className="flex-1"
          disabled={chatMutation.isPending}
        />
        <Button
          onClick={handleSend}
          disabled={chatMutation.isPending || !message.trim()}
          className="send-button px-6"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
