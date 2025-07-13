import { useState, useRef, useEffect, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Loader2, Sparkles } from "lucide-react";
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
  autoSubmitMessage?: string;
};

export function ChatInterface({ spiceLevel, selectedFlavors, onRecommendations, autoSubmitMessage }: ChatInterfaceProps) {
  const { language, t } = useLanguage();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
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
      
      setIsAutoSubmitting(false);
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
      
      setIsAutoSubmitting(false);
    },
  });

  const handleSend = (messageToSend?: string) => {
    const textToSend = messageToSend || message;
    if (!textToSend || !textToSend.trim()) return;

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: textToSend,
      isUser: true,
      timestamp: new Date(),
    }]);

    // Send to AI
    chatMutation.mutate({
      message: textToSend.trim(),
      spiceLevel,
      flavors: selectedFlavors,
      language: language as "en" | "es",
    });

    setMessage("");
  };

  // Auto-submit when message is provided
  useEffect(() => {
    if (autoSubmitMessage) {
      setMessage(autoSubmitMessage);
      setIsAutoSubmitting(true);
      handleSend(autoSubmitMessage);
    }
  }, [autoSubmitMessage]);

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
              {isAutoSubmitting ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse text-purple-500" />
                  <span className="text-sm text-purple-600 dark:text-purple-400 animate-bounce">
                    {language === "es" ? "Saboreando..." : "Tasting..."}
                  </span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse"></div>
                    <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse delay-100"></div>
                    <div className="w-1 h-1 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                  </div>
                </>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t("home.aiCooking")}
                  </span>
                </>
              )}
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
