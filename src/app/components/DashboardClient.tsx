"use client";

import { useState, useRef, useEffect } from "react";
import {
  ReloadIcon,
  ClipboardIcon,
  ImageIcon,
  ArrowLeftIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const suggestions = [
  {
    title: "Write a to-do list for a personal project or task",
    icon: "👤",
  },
  {
    title: "Generate an email to reply to a job offer",
    icon: "📧",
  },
  {
    title: "Summarise this article or text for me in one paragraph",
    icon: "📝",
  },
  {
    title: "How does AI work in a technical capacity",
    icon: "🤖",
  },
];

type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

interface DashboardClientProps {
  displayName: string;
}

const DashboardClient = ({ displayName }: DashboardClientProps) => {
  const [input, setInput] = useState("");
  const [isChatMode, setIsChatMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when entering chat mode
  useEffect(() => {
    if (isChatMode) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isChatMode]);

  const startChat = (initialPrompt?: string) => {
    if (initialPrompt) {
      setInput(initialPrompt);
    }

    // Add welcome message from assistant
    if (messages.length === 0) {
      setMessages([
        {
          id: "1",
          content:
            "Hello! I'm your email assistant. How can I help you with your emails today?",
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
    }

    setIsChatMode(true);

    // If we have an initial prompt, send it automatically
    if (initialPrompt) {
      setTimeout(() => {
        handleSendMessage(initialPrompt);
      }, 500);
    }
  };

  const handleExitChat = () => {
    setIsChatMode(false);
  };

  const handleSendMessage = async (manualInput?: string) => {
    const messageToSend = manualInput || input;
    if (!messageToSend.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call the assistant API
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          context: {
            previousMessages: messages.slice(-5), // Send last 5 messages for context
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from assistant");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: data.message,
        sender: "assistant",
        timestamp: new Date(data.timestamp || Date.now()),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to get response:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: "Sorry, I encountered an error. Please try again.",
          sender: "assistant",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="relative w-full min-h-screen flex justify-center items-center">
      {/* Main Content */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-8 h-[80vh] flex flex-col">
          {isChatMode ? (
            // Chat Interface
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleExitChat}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/bot-avatar.png" />
                      <AvatarFallback className="bg-blue-600 text-white">
                        EA
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-sm">Email Assistant</h3>
                      <p className="text-xs text-gray-500">Powered by AI</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        message.sender === "user"
                          ? "bg-blue-600 text-white rounded-tr-none"
                          : "bg-gray-100 border border-gray-200 rounded-tl-none"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <span
                        className={`text-xs mt-1 block ${
                          message.sender === "user"
                            ? "text-blue-100"
                            : "text-gray-400"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                      <div className="flex space-x-2">
                        <div
                          className="h-2 w-2 bg-gray-300 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="h-2 w-2 bg-gray-300 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="h-2 w-2 bg-gray-300 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="border-t pt-4">
                <div className="relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message Email Assistant..."
                    className="w-full min-h-[60px] px-4 py-3 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    rows={2}
                  />
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-gray-600"
                      >
                        <ClipboardIcon className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-gray-600"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {input.length}/1000
                      </span>
                      <Button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
                      >
                        {isLoading ? "Thinking..." : "Send"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Initial Dashboard Interface
            <>
              {/* Welcome Section */}
              <div className="space-y-2 mb-8">
                <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Hi there, {displayName}
                </h1>
                <h2 className="text-3xl font-display text-gray-600">
                  What would you like to know?
                </h2>
                <p className="text-sm text-gray-500">
                  Use one of the most common prompts below or use your own to
                  begin
                </p>
              </div>

              {/* Suggestion Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {suggestions.map((suggestion, index) => (
                  <button
                    type="button"
                    key={index}
                    className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors text-left"
                    onClick={() => startChat(suggestion.title)}
                  >
                    <span className="text-2xl">{suggestion.icon}</span>
                    <span className="text-gray-700 font-medium">
                      {suggestion.title}
                    </span>
                  </button>
                ))}
              </div>

              {/* Input Section */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 flex-grow">
                <div className="relative h-full flex flex-col">
                  <textarea
                    placeholder="Ask whatever you want...."
                    className="w-full flex-grow min-h-[100px] px-4 py-3 bg-transparent border-0 resize-none focus:ring-0 text-gray-700 placeholder:text-gray-400"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-gray-600"
                      >
                        <ClipboardIcon className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-gray-600"
                      >
                        <ImageIcon className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {input.length}/1000
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-500 hover:text-gray-600"
                      >
                        <ReloadIcon className="w-5 h-5" />
                      </Button>
                      <Button
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => {
                          if (input.trim()) {
                            startChat(input);
                          }
                        }}
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardClient;
