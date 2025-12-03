import React, { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';

const PetGPT = () => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFirstMessage, setIsFirstMessage] = useState(true);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const optionButtons = [
        { question: "Quais rações vocês recomendam?" },
        { question: "Preciso de ajuda com meu pet doente" },
        { question: "Quais serviços de banho e tosa oferecem?" },
        { question: "Como agendar uma consulta veterinária?" }
    ];

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    const formatMessage = (text) => {
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    };

    const getAIResponse = async (message) => {
        const endpoint = isFirstMessage 
            ? 'http://localhost:3000/start-chat' 
            : 'http://localhost:3000/chat';
        
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                isFirstMessage: isFirstMessage
            })
        });

        if (!response.ok) {
            throw new Error('Erro na resposta da API');
        }

        const data = await response.json();
        setIsFirstMessage(false);
        return data.reply;
    };

    const sendMessage = async (messageText = null) => {
        const message = messageText || inputValue.trim();
        if (!message) return;

        const userMessage = { content: message, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        setIsTyping(true);

        try {
            const response = await getAIResponse(message);
            setIsTyping(false);
            
            addBotMessageWithTypewriter(response);
            
        } catch (error) {
            setIsTyping(false);
            const errorMessage = { 
                content: '🐾 Oops! Estou com alguns probleminhas técnicos. Pode tentar novamente?', 
                sender: 'bot' 
            };
            setMessages(prev => [...prev, errorMessage]);
            console.error('Erro:', error);
        }
    };

    const addBotMessageWithTypewriter = (content) => {
        const messageDiv = {
            id: Date.now(),
            content: '',
            sender: 'bot',
            isTyping: true
        };
        
        setMessages(prev => [...prev, messageDiv]);
        
        let i = 0;
        const timer = setInterval(() => {
            if (i < content.length) {
                const currentText = content.substring(0, i + 1);
                const formattedText = formatMessage(currentText);
                
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === messageDiv.id 
                            ? { ...msg, content: formattedText }
                            : msg
                    )
                );
                i++;
                scrollToBottom();
            } else {
                clearInterval(timer);
                setMessages(prev => 
                    prev.map(msg => 
                        msg.id === messageDiv.id 
                            ? { ...msg, isTyping: false }
                            : msg
                    )
                );
            }
        }, 20);
    };

    const handleOptionClick = (question) => {
        sendMessage(question);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = (e.target.scrollHeight) + 'px';
    };

    if (isMinimized) {
        return (
            <div className="chat-widget minimized" onClick={toggleMinimize}>
                <div className="chat-header">
                    <div className="chat-title">
                        <i className="fas fa-paw"></i>
                        Pet Assistente
                    </div>
                    <button className="minimize-btn" onClick={(e) => { e.stopPropagation(); toggleMinimize(); }}>
                        <i className="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-widget">
            <div className="chat-header">
                <div className="chat-title">
                    <i className="fas fa-paw"></i>
                    Pet Assistente
                </div>
                <button className="minimize-btn" onClick={toggleMinimize}>
                    <i className="fas fa-minus"></i>
                </button>
            </div>

            <div className="chat-messages" ref={messagesContainerRef}>
                {messages.length === 0 && (
                    <div className="welcome-container">
                        <h3>🐾 Olá! Sou seu assistente virtual!</h3>
                        <p>Como posso ajudar você e seu pet hoje?</p>
                        <div className="option-buttons">
                            {optionButtons.map((button, index) => (
                                <button
                                    key={index}
                                    className="option-button"
                                    onClick={() => handleOptionClick(button.question)}
                                >
                                    {button.question}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.sender}-message`}>
                        <div className="message-avatar">
                            <i className={`fas ${message.sender === 'bot' ? 'fa-paw' : 'fa-user'}`}></i>
                        </div>
                        <div 
                            className="message-content"
                            dangerouslySetInnerHTML={{ __html: message.content }}
                        />
                    </div>
                ))}

                {isTyping && (
                    <div className="message bot-message typing-indicator">
                        <div className="message-avatar">
                            <i className="fas fa-paw"></i>
                        </div>
                        <div className="message-content">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
                <textarea
                    className="chat-input"
                    placeholder="Digite sua mensagem..."
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    rows="1"
                />
                <button className="send-btn" onClick={() => sendMessage()}>
                    <i className="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    );
};

export default PetGPT;