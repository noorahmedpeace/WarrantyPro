import React, { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, User as UserIcon } from 'lucide-react';
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
    initialMessage,
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialMessage && messages.length === 0) {
            handleSendMessage(initialMessage);
        }
    }, [initialMessage, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (messageText?: string) => {
        const text = messageText || input.trim();
        if (!text || isLoading) return;

        const userMessage: Message = { role: 'user', content: text, timestamp: new Date() };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/claims/diagnose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('warranty_token')}`,
                },
                body: JSON.stringify({
                    warrantyId: warranty._id,
                    message: text,
                    conversationHistory: updatedMessages.map((message) => ({ role: message.role, content: message.content })),
                }),
            });

            if (!response.ok) {
                let errorMsg = 'Failed to get AI response';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorData.message || errorMsg;
                } catch (error) {
                    errorMsg = `Server Error (${response.status} ${response.statusText})`;
                }
                throw new Error(errorMsg);
            }

            const data = await response.json();
            const aiMessage: Message = { role: 'assistant', content: data.response, timestamp: new Date() };
            const finalMessages = [...updatedMessages, aiMessage];
            setMessages(finalMessages);
            onConversationUpdate(finalMessages);
        } catch (error: any) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: error.message || "I'm sorry, I'm having trouble processing your request. Please try again.",
                timestamp: new Date(),
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
        <div className="flex h-full flex-col bg-white">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-h-[500px]">
                <AnimatePresence initial={false}>
                    {messages.length === 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-sky-200 bg-sky-50">
                                <Bot className="w-10 h-10 text-sky-600" />
                            </div>
                            <h3 className="mb-2 text-xl font-bold tracking-tight text-slate-950">AI Diagnostic Assistant</h3>
                            <p className="mx-auto max-w-sm text-sm font-medium text-slate-600">
                                I&apos;ll help you diagnose the issue with your <span className="font-semibold text-slate-950">{warranty.product_name}</span>.
                            </p>
                        </motion.div>
                    )}

                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className={`flex gap-3 sm:gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'assistant' && (
                                <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50">
                                    <Bot className="w-5 h-5 text-sky-600" />
                                </div>
                            )}

                            <div
                                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-wrap ${
                                    message.role === 'user'
                                        ? 'bg-slate-950 text-white rounded-tr-sm'
                                        : 'border border-slate-200 bg-[#f8fafc] text-slate-700 rounded-tl-sm'
                                }`}
                            >
                                {message.content}
                                {message.timestamp && (
                                    <p className={`mt-1.5 text-[10px] ${message.role === 'user' ? 'text-white/70' : 'text-slate-400'}`}>
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                            </div>

                            {message.role === 'user' && (
                                <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-[#f8fafc]">
                                    <UserIcon className="w-5 h-5 text-slate-600" />
                                </div>
                            )}
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 sm:gap-4">
                            <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50">
                                <Bot className="w-5 h-5 text-sky-600" />
                            </div>
                            <div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-[#f8fafc] px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                                    <span className="text-sm font-medium text-slate-600">Analyzing...</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-200 bg-[#fbfdff] p-4 sm:p-5">
                <div className="flex gap-3 max-w-4xl mx-auto">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe the issue..."
                        disabled={isLoading}
                        className="neu-input flex-1 disabled:opacity-50"
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim() || isLoading}
                        className="flex items-center justify-center rounded-xl border border-slate-950 bg-slate-950 px-4 py-3 text-white transition-all disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
