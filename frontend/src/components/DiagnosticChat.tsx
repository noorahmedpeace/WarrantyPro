import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

interface DiagnosticChatProps {
    warranty: any;
    onConversationUpdate: (conversation: Message[]) => void;
    initialMessage?: string;
}

export const DiagnosticChat: React.FC<DiagnosticChatProps> = ({
    warranty,
    onConversationUpdate,
    initialMessage
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Send initial message if provided
        if (initialMessage && messages.length === 0) {
            handleSendMessage(initialMessage);
        }
    }, [initialMessage]);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (messageText?: string) => {
        const text = messageText || input.trim();
        if (!text || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: text,
            timestamp: new Date()
        };

        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/claims/diagnose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    warrantyId: warranty._id,
                    message: text,
                    conversationHistory: updatedMessages.map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                })
            });

            if (!response.ok) {
                let errorMsg = 'Failed to get AI response';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorData.message || errorMsg;
                } catch (e) {
                    // If JSON parse fails, it's likely a Vercel 504 Timeout or 500 Crash (HTML response)
                    errorMsg = `Server Error (${response.status} ${response.statusText})`;
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();

            const aiMessage: Message = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date()
            };

            const finalMessages = [...updatedMessages, aiMessage];
            setMessages(finalMessages);
            onConversationUpdate(finalMessages);
        } catch (error: any) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: error.message || "I'm sorry, I'm having trouble processing your request. Please try again.",
                timestamp: new Date()
            };
            setMessages([...updatedMessages, errorMessage]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
                <AnimatePresence initial={false}>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12"
                        >
                            <div className="inline-flex p-4 rounded-full bg-blue-500/10 mb-4">
                                <Bot className="w-12 h-12 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">AI Diagnostic Assistant</h3>
                            <p className="text-slate-400 text-sm max-w-md mx-auto">
                                I'll help you diagnose the issue with your {warranty.product_name}.
                                Describe the problem you're experiencing.
                            </p>
                        </motion.div>
                    )}

                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'assistant' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-blue-400" />
                                </div>
                            )}

                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/5 border border-white/10 text-slate-200'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {message.content}
                                </p>
                                {message.timestamp && (
                                    <p className={`text-[10px] mt-2 ${message.role === 'user' ? 'text-blue-200' : 'text-slate-500'
                                        }`}>
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                )}
                            </div>

                            {message.role === 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <UserIcon className="w-5 h-5 text-purple-400" />
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3"
                        >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-blue-400" />
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                    <span className="text-sm text-slate-400">Analyzing...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 p-4 bg-black/20">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe the issue..."
                        disabled={isLoading}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim() || isLoading}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
