class PetGPT {
    constructor() {
        this.isMinimized = false;
        this.isFirstMessage = true;
        this.messagesContainer = document.querySelector('.chat-messages');
        this.chatInput = document.querySelector('.chat-input');
        this.sendButton = document.querySelector('.send-btn');
        this.minimizeButton = document.querySelector('.minimize-btn');
        this.chatWidget = document.querySelector('.chat-widget');
        this.chatHeader = document.querySelector('.chat-header');
        this.optionButtons = document.querySelectorAll('.option-button');
        this.welcomeContainer = document.querySelector('.welcome-container');
        
        // ✅ CORREÇÃO CRÍTICA: URL do backend
        this.API_URL = window.API_URL || import.meta.env?.VITE_API_URL || 'https://pet-net-backend.onrender.com';
        
        // Debug para verificar a URL
        console.log('🔧 PetGPT inicializado com API_URL:', this.API_URL);
        
        this.init();
    }

    init() { 
        this.setupEventListeners(); 
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.chatInput.addEventListener('input', () => {
            this.chatInput.style.height = 'auto';
            this.chatInput.style.height = (this.chatInput.scrollHeight) + 'px';
        });
        
        this.minimizeButton.addEventListener('click', (e) => {
            e.stopPropagation(); 
            this.toggleMinimize();
        });
        
        this.chatHeader.addEventListener('click', () => {
            if (this.isMinimized) this.toggleMinimize();
        });
        
        // Adiciona eventos aos botões de opção
        this.optionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const question = button.getAttribute('data-question');
                this.chatInput.value = question;
                this.sendMessage();
            });
        });
    }

    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        this.chatWidget.classList.toggle('minimized', this.isMinimized);
        const icon = this.minimizeButton.querySelector('i');
        icon.className = this.isMinimized ? 'fas fa-plus' : 'fas fa-minus';
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        if (this.welcomeContainer) {
            this.welcomeContainer.style.display = 'none';
            this.welcomeContainer = null;
        }
        
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        this.chatInput.style.height = 'auto';
        this.showTypingIndicator();
        
        try {
            // Chama a API do backend
            const response = await this.getAIResponse(message);
            this.removeTypingIndicator();
            
            // Adiciona a resposta da IA com efeito de digitação
            this.addBotMessageWithTypewriter(response);
            
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('🐾 Oops! Estou com alguns probleminhas técnicos. Pode tentar novamente em um minutinho?', 'bot');
            console.error('❌ Erro no envio:', error);
        }
    }

    async getAIResponse(message) {
        const endpoint = this.isFirstMessage ? '/start-chat' : '/chat';
        const url = `${this.API_URL}${endpoint}`;
        
        console.log('🌐 Enviando para:', url);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    isFirstMessage: this.isFirstMessage
                })
            });

            console.log('📡 Status da resposta:', response.status);
            
            if (!response.ok) {
                let errorMessage = `Erro HTTP ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage += `: ${errorData.message || 'Erro desconhecido'}`;
                } catch (e) {
                    errorMessage += `: ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('✅ Resposta recebida:', data);
            
            this.isFirstMessage = false;
            return data.reply || "🐕 Não consegui entender direito. Pode reformular sua pergunta?";
            
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            
            // Mensagens de erro amigáveis
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
            } else if (error.message.includes('404')) {
                throw new Error('Serviço temporariamente indisponível.');
            } else {
                throw error;
            }
        }
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-paw"></i>' : '<i class="fas fa-user"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        // Formata melhor a mensagem
        const formattedContent = this.formatMessage(content);
        messageContent.innerHTML = formattedContent;
        
        if (sender === 'bot') {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContent);
        } else {
            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(avatar);
        }
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    // Método específico para mensagens do bot com digitação
    addBotMessageWithTypewriter(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-paw"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        
        // Adiciona a mensagem vazia primeiro
        this.messagesContainer.appendChild(messageDiv);
        
        // Faz scroll para mostrar o início da nova mensagem
        this.scrollToMessageStart(messageDiv);
        
        // Inicia o efeito de digitação
        this.typeWriter(messageContent, content, 20);
    }

    // Método para efeito de digitação
    typeWriter(element, text, speed) {
        let i = 0;
        element.innerHTML = '';
        
        const timer = setInterval(() => {
            if (i < text.length) {
                // Formata o texto enquanto digita
                const currentText = text.substring(0, i + 1);
                const formattedText = this.formatMessage(currentText);
                element.innerHTML = formattedText;
                i++;
                
                // Mantém o scroll mostrando o topo da mensagem
                this.scrollToMessageStart(element.parentElement);
            } else {
                clearInterval(timer);
                // Scroll final após terminar de digitar
                setTimeout(() => this.scrollToBottom(), 100);
            }
        }, speed);
    }

    // Método para scroll que mantém o início da mensagem visível
    scrollToMessageStart(messageElement) {
        if (messageElement) {
            // Calcula a posição para mostrar o início da mensagem
            const container = this.messagesContainer;
            const messageTop = messageElement.offsetTop - container.offsetTop;
            
            // Se a mensagem não estiver visível no topo, faz scroll
            if (container.scrollTop > messageTop || 
                container.scrollTop + container.clientHeight < messageTop + 100) {
                container.scrollTop = messageTop - 10; // Pequeno offset
            }
        }
    }

    formatMessage(text) {
        if (!text) return '';
        
        return text
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/# (.*?)(?:\n|$)/g, '<h4>$1</h4>')
            .replace(/- (.*?)(?:\n|$)/g, '<li>$1</li>')
            .replace(/(?:🐾|🐕|🐈|💚|🛁|🏥|🛒)/g, '<span class="emoji">$&</span>');
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-paw"></i>';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'message-content';
        typingContent.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>`;
        
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(typingContent);
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) typingIndicator.remove();
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
}

// ✅ CONFIGURAÇÃO GLOBAL - Garante que a URL esteja disponível
window.initializePetGPT = function() {
    // Define a URL do backend globalmente
    window.API_URL = window.API_URL || 
                     import.meta.env?.VITE_API_URL || 
                     'https://pet-net-backend.onrender.com';
    
    console.log('🚀 Inicializando PetGPT com URL:', window.API_URL);
    
    // Teste de conexão
    fetch(`${window.API_URL}/health`)
        .then(res => res.json())
        .then(data => console.log('✅ Backend conectado:', data.message))
        .catch(err => console.error('❌ Backend offline:', err));
    
    // Inicializa o chat
    return new PetGPT();
};

// Inicializa automaticamente quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    window.petGPT = window.initializePetGPT();
    
    // Teste rápido no console
    console.log('🐾 PetGPT pronto! Use window.petGPT para acessar.');
    
    // Adiciona função de teste global
    window.testPetGPT = function(message = 'Olá') {
        console.log('🧪 Testando PetGPT com:', message);
        window.petGPT.chatInput.value = message;
        window.petGPT.sendMessage();
    };
});