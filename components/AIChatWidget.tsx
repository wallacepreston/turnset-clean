"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

// Parse product handles from AI response
function extractProductHandles(text: string): string[] {
  // Match patterns like [product-handle] or "product-handle"
  const handlePattern = /\[([a-z0-9-]+)\]|"([a-z0-9-]+)"/gi;
  const matches = text.matchAll(handlePattern);
  const handles: string[] = [];
  
  for (const match of matches) {
    const handle = match[1] || match[2];
    if (handle && !handles.includes(handle)) {
      handles.push(handle);
    }
  }
  
  return handles;
}

// Extract text content from message parts
function getMessageText(message: { parts: Array<{ type: string; text?: string }> }): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text || "")
    .join("");
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onFinish: async (options) => {
      // Extract product handles from the AI response
      const messageText = getMessageText(options.message);
      const handles = extractProductHandles(messageText);
      
      if (handles.length > 0) {
        // Fetch product details for suggested handles via API
        try {
          const response = await fetch("/api/products/by-handles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(handles),
          });

          if (response.ok) {
            const data = await response.json();
            setSuggestedProducts(data.products || []);
          } else {
            console.error("Error fetching suggested products:", response.statusText);
          }
        } catch (err) {
          console.error("Error fetching suggested products:", err);
        }
      } else {
        setSuggestedProducts([]);
      }
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage({ text: input });
      setInput("");
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, suggestedProducts]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
          aria-label="Open AI chat assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md h-[600px] max-h-[calc(100vh-3rem)] bg-background border border-border rounded-lg shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">AI Shopping Assistant</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(false);
                setSuggestedProducts([]);
              }}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  Hi! I&apos;m here to help you find the perfect cleaning products.
                  What are you looking for?
                </p>
              </div>
            )}

            {messages.map((message) => {
              const messageText = getMessageText(message);
              const isUser = message.role === "user";
              
              return (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 max-w-[80%]",
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {messageText}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Suggested Products */}
            {suggestedProducts.length > 0 && (
              <div className="space-y-3 mt-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Suggested Products:
                </p>
                <div className="space-y-2">
                  {suggestedProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.handle}`}
                      onClick={() => setIsOpen(false)}
                      className="block"
                    >
                      <div className="border border-border rounded-lg p-3 hover:bg-accent transition-colors">
                        <div className="flex items-start space-x-3">
                          {product.featuredImage && (
                            <Image
                              src={product.featuredImage.url}
                              alt={product.featuredImage.altText || product.title}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {product.title}
                            </h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {product.description || "Premium cleaning product"}
                            </p>
                            <p className="text-sm font-semibold mt-1">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency:
                                  product.priceRange.minVariantPrice
                                    .currencyCode,
                              }).format(
                                parseFloat(
                                  product.priceRange.minVariantPrice.amount
                                )
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="text-sm text-destructive">
                  {error.message || "An error occurred. Please try again."}
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-border p-4"
          >
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tell me what you're looking for..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
