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
                    'Authorization': `Bearer ${localStorage.getItem('warranty_token')}`
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
        <div className="flex flex-col h-full bg-slate-50">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-h-[500px]">
                <AnimatePresence initial={false}>
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12"
                        >
                            <div className="inline-flex p-4 border-4 border-dark bg-secondary mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <Bot className="w-12 h-12 text-dark" strokeWidth={2} />
                            </div>
                            <h3 className="text-2xl font-black text-dark mb-2 uppercase tracking-tighter">AI Diagnostic Assistant</h3>
                            <p className="text-dark font-bold text-sm max-w-md mx-auto">
                                I'll help you diagnose the issue with your <span className="underline decoration-2">{warranty.product_name}</span>.
                                Describe the problem you're experiencing in detail.
                            </p>
                        </motion.div>
                    )}

                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex gap-3 sm:gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'assistant' && (
                                <div className="flex-shrink-0 w-10 h-10 border-4 border-dark bg-secondary flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-1">
                                    <Bot className="w-6 h-6 text-dark" strokeWidth={2} />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] px-5 py-4 border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${message.role === 'user'
                                    ? 'bg-primary text-dark ml-auto'
                                    : 'bg-white text-dark'
                                    }`}
                            >
                                <p className="text-sm sm:text-base font-bold leading-relaxed whitespace-pre-wrap">
                                    {message.content}
                                </p>
                                {message.timestamp && (
                                    <p className={`text-[10px] mt-2 font-black uppercase tracking-wider ${message.role === 'user' ? 'text-dark/70' : 'text-slate-500'
                                        }`}>
                                        {message.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                )}
                            </div>

                            {message.role === 'user' && (
                                <div className="flex-shrink-0 w-10 h-10 border-4 border-dark bg-accent flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-1">
                                    <UserIcon className="w-6 h-6 text-dark" strokeWidth={2} />
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3 sm:gap-4"
                        >
                            <div className="flex-shrink-0 w-10 h-10 border-4 border-dark bg-secondary flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mt-1">
                                <Bot className="w-6 h-6 text-dark" strokeWidth={2} />
                            </div>
                            <div className="bg-white border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-5 py-4">
                                <div className="flex items-center gap-3">
                                    <Loader2 className="w-5 h-5 animate-spin text-dark" strokeWidth={3} />
                                    <span className="text-sm font-black uppercase tracking-wider text-dark">Analyzing...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t-4 border-dark p-4 sm:p-6 bg-slate-200">
                <div className="flex gap-3 max-w-4xl mx-auto">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe the issue..."
                        disabled={isLoading}
                        className="flex-1 neu-input disabled:opacity-50"
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim() || isLoading}
                        className="px-6 py-3 bg-primary border-4 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:bg-slate-300 disabled:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] disabled:cursor-not-allowed text-dark font-black transition-all flex items-center justify-center gap-2"
                    >
                        <Send className="w-5 h-5" strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
};
