import React from 'react';
import '../styles/ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, carrinho }) => {
  if (!isOpen) return null;

  const getTotalItems = () => {
    return carrinho?.quantidade_itens || 0;
  };

  const getValorTotal = () => {
    return carrinho?.total || 0;
  };

  return (
    <div className="confirmation-modal-overlay">
      <div className="confirmation-modal">
        <div className="confirmation-content">
          
          <div className="confirmation-icon">
            🎉
          </div>

          <h2 className="confirmation-title">
            Quase lá! Confirme sua compra
          </h2>

          <p className="confirmation-message">
            Estamos preparando tudo para você! Sua compra de <strong>{getTotalItems()} itens</strong> no valor total de <strong>R$ {getValorTotal().toFixed(2)}</strong> está quase finalizada.
          </p>

          <div className="confirmation-details">
            <div className="confirmation-benefit">
              <span className="benefit-icon">🚀</span>
              <div>
                <strong>Processamento Rápido</strong>
                <p>Seu pedido será enviado imediatamente</p>
              </div>
            </div>
            
            <div className="confirmation-benefit">
              <span className="benefit-icon">🛡️</span>
              <div>
                <strong>Pagamento Seguro</strong>
                <p>Redirecionaremos para ambiente seguro</p>
              </div>
            </div>
            
            <div className="confirmation-benefit">
              <span className="benefit-icon">📧</span>
              <div>
                <strong>Confirmação por Email</strong>
                <p>Receba todos os detalhes da compra</p>
              </div>
            </div>
          </div>

          <div className="confirmation-actions">
            <button 
              onClick={onConfirm}
              className="confirmation-button primary"
            >
              💳 Sim, Continuar para Pagamento
            </button>
            
            <button 
              onClick={onCancel}
              className="confirmation-button secondary"
            >
              ↩️ Voltar ao Carrinho
            </button>
          </div>

          <div className="confirmation-footer">
            <p>Obrigado por escolher o PetNet! Seu pet vai adorar! 🐾</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;