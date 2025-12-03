import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PaymentModal.css';

const PaymentModalMP = ({ isOpen, onClose, agendamento, carrinho, tipo = 'agendamento' }) => {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const hasCreatedPreference = useRef(false);
  const externalReference = useRef(`pedido_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (isOpen && (agendamento || carrinho) && !hasCreatedPreference.current) {
      hasCreatedPreference.current = true;
      createPaymentPreference();
    }
  }, [isOpen, agendamento, carrinho]);

  useEffect(() => {
    if (!isOpen) {
      hasCreatedPreference.current = false;
      setPaymentUrl('');
      setError('');
    }
  }, [isOpen]);

  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token;
  };

  const getValorTotal = () => {
    if (tipo === 'agendamento' && agendamento?.valor_total) {
      const valor = parseFloat(agendamento.valor_total);
      return isNaN(valor) ? 0 : valor;
    } else if (tipo === 'produtos') {
      const items = getItems();
      const totalProdutos = items.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
      return totalProdutos;
    }
    return 0;
  };

  const getValorTotalComFrete = () => {
    const totalProdutos = getValorTotal();
    const frete = 9.90;
    const totalComFrete = totalProdutos + parseFloat(frete);
    return totalComFrete;
  };

  const getItems = () => {
    if (tipo === 'agendamento' && agendamento) {
      return [{
        id: `agendamento_${agendamento.id || Date.now()}`,
        title: `Agendamento: ${agendamento.servico_nome || 'Serviço Pet'}`,
        description: `Serviço para pet agendado`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: getValorTotal()
      }];
    } 
    
    else if (tipo === 'produtos') {
      let itemsArray = [];

      if (Array.isArray(carrinho)) {
        itemsArray = carrinho;
      } else if (carrinho?.items && Array.isArray(carrinho.items)) {
        itemsArray = carrinho.items;
      } else if (carrinho?.produtos && Array.isArray(carrinho.produtos)) {
        itemsArray = carrinho.produtos;
      } else if (carrinho && typeof carrinho === 'object') {
        itemsArray = [carrinho];
      }

      const produtosFiltrados = itemsArray.filter(item => 
        !item.title?.toLowerCase().includes('frete') && 
        !item.nome?.toLowerCase().includes('frete') &&
        !item.description?.toLowerCase().includes('frete')
      );

      const mpItems = produtosFiltrados.map((item, index) => {
        const productId = item.id || item.produto_id || `prod_${Date.now()}_${index}`;
        const productName = item.nome || item.produto_nome || item.title || item.descricao || `Produto ${index + 1}`;
        const quantity = parseInt(item.quantidade || item.quantity || item.qtd || 1);
        const unitPrice = parseFloat(item.preco || item.price || item.valor || item.unit_price || item.preco_unitario || 0);
        
        return {
          id: productId,
          title: productName.length > 127 ? productName.substring(0, 124) + '...' : productName,
          description: `Produto: ${productName}`,
          quantity: Math.max(1, quantity),
          currency_id: 'BRL',
          unit_price: Math.max(0.01, unitPrice)
        };
      }).filter(item => {
        return item.quantity > 0 && item.unit_price > 0;
      });

      return mpItems;
    }
    
    return [];
  };

  const createPaymentPreference = async () => {
    setLoading(true);
    setError('');
    setPaymentUrl('');

    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Usuário não autenticado. Faça login para continuar.');
      }

      let items = getItems();
      const frete = 9.90;
      if (frete > 0) {
        items.push({
          id: 'frete',
          title: 'Frete',
          description: 'Custo de entrega',
          quantity: 1,
          currency_id: 'BRL',
          unit_price: parseFloat(frete)
        });
      }
      
      if (items.length === 0) {
        throw new Error('Nenhum item válido para pagamento. Verifique seu carrinho.');
      }

      const payload = {
        items: items,
        back_urls: {
          success: `${window.location.origin}/payment-success`,
          failure: `${window.location.origin}/payment-error`, 
          pending: `${window.location.origin}/payment-pending`
        },
        auto_return: 'approved',
        tipo: tipo
      };

      if (tipo === 'agendamento' && agendamento?.id) {
        payload.agendamento_id = agendamento.id;
        payload.external_reference = `ag_${agendamento.id}`;
      } else if (tipo === 'produtos') {
        const carrinhoId = carrinho?.carrinho_id || carrinho?.id || `cart_${Date.now()}`;
        payload.carrinho_id = carrinhoId;
        payload.external_reference = externalReference.current;
      }

      const response = await fetch('http://localhost:3000/api/pagamentos/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ${response.status} ao criar pagamento`);
      }

      const data = await response.json();
      
      setPaymentUrl(data.sandbox_init_point || data.init_point);

    } catch (error) {
      setError(error.message || 'Erro ao processar pagamento. Tente novamente.');
      
      if (error.message.includes('não autenticado') || error.message.includes('Sessão expirada')) {
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const salvarPedidoNoBanco = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        return false;
      }

      if (tipo === 'produtos' && carrinho) {
        const itemsFormatados = getItems().map(item => ({
          id: item.id,
          nome: item.title,
          quantidade: item.quantity,
          preco: item.unit_price,
          total: item.quantity * item.unit_price
        }));

        const pedidoData = {
          items: itemsFormatados,
          total: getValorTotalComFrete(), 
          frete: 9.90,
          metodo_pagamento: 'cartao',
          external_reference: externalReference.current
        };

        const response = await fetch('http://localhost:3000/pedidos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(pedidoData)
        });

        if (response.ok) {
          return true;
        } else {
          const errorText = await response.text();
          throw new Error(`Falha ao salvar pedido. Erro do servidor: ${errorText}`);
        }
      }
      return false;
    } catch (error) {
      setError(`Erro ao salvar pedido no sistema: ${error.message}`);
      return false;
    }
  };

  const handlePayment = async () => {
    const token = getAuthToken();
    if (!token) {
      setError('Usuário não autenticado. Redirecionando para login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    if (paymentUrl) {
      if (tipo === 'produtos') {
        setLoading(true);
        const salvouBanco = await salvarPedidoNoBanco();
        setLoading(false);
        
        if (!salvouBanco) {
          setError('Erro ao salvar pedido no sistema. Tente novamente.');
          return;
        }
      }
      
      const newTab = window.open(paymentUrl, '_blank');
      
      if (newTab) {
        setTimeout(() => {
          onClose(true, paymentUrl, tipo === 'agendamento' ? agendamento : carrinho);
        }, 1000);
        
      } else {
        setError('Não foi possível abrir o Mercado Pago. Verifique se seu navegador permite popups.');
      }
      
    } else {
      setError('URL de pagamento não disponível. Tente novamente.');
    }
  };

  const renderItensCarrinho = () => {
    if (tipo !== 'produtos') return null;
    
    const items = getItems();
    const frete = 9.90;
    const totalProdutos = getValorTotal();
    const totalComFrete = getValorTotalComFrete();
    
    return (
      <div className="carrinho-items-list">
        <h4>Itens do Carrinho ({items.length}):</h4>
        {items.map((item, index) => (
          <div key={index} className="carrinho-item">
            <span className="item-name">{item.title}</span>
            <span className="item-quantity">Qtd: {item.quantity}</span>
            <span className="item-price">R$ {(item.unit_price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="carrinho-frete">
          <span className="item-name">🚚 Frete </span>
          <span className="item-price">R$ {parseFloat(frete).toFixed(2)}</span>
        </div>
        <div className="carrinho-total">
          <strong>Total: R$ {totalComFrete.toFixed(2)}</strong>
        </div>
      </div>
    );
  };

  const getButtonText = () => {
    if (loading) {
      return (
        <>
          <div className="spinner"></div>
          Processando...
        </>
      );
    } else if (paymentUrl) {
      return (
        <>
          <span className="mp-icon">💳</span>
          Abrir Mercado Pago
        </>
      );
    } else {
      return (
        <>
          <span className="mp-icon">⏳</span>
          Preparando pagamento...
        </>
      );
    }
  };

  if (!isOpen) return null;

  const valorTotal = getValorTotalComFrete();
  const itemsCount = tipo === 'produtos' ? getItems().length : 1;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <div className="payment-header">
          <h2>Finalizar Pagamento</h2>
          <button className="close-button" onClick={() => onClose(false)}>×</button>
        </div>
        
        <div className="payment-content">
          <div className="payment-summary">
            <div className="summary-header">
              <h3>Resumo do {tipo === 'agendamento' ? 'Agendamento' : 'Compra'}</h3>
              <span className="items-count">{itemsCount} {itemsCount === 1 ? 'item' : 'itens'}</span>
            </div>
            <div className="summary-details">
              {tipo === 'agendamento' ? (
                <>
                  <div className="detail-item">
                    <span className="label">Serviço:</span>
                    <span className="value">{agendamento?.servico_nome || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Cliente:</span>
                    <span className="value">{agendamento?.nome_cliente || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Data:</span>
                    <span className="value">
                      {agendamento?.data_agendamento 
                        ? new Date(agendamento.data_agendamento).toLocaleDateString('pt-BR')
                        : 'N/A'
                      }
                    </span>
                  </div>
                </>
              ) : (
                renderItensCarrinho()
              )}
              <div className="detail-item total">
                <span className="label">Valor Total:</span>
                <span className="value price">R$ {valorTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="payment-error">
              <span>⚠️</span>
              {error}
              {error.includes('não autenticado') || error.includes('Sessão expirada') ? (
                <div className="login-redirect">
                  <p>Redirecionando para login em 3 segundos...</p>
                </div>
              ) : null}
            </div>
          )}

          <div className="payment-actions">
            <button 
              onClick={handlePayment}
              disabled={!paymentUrl || loading}
              className={`pay-button mp-button ${loading ? 'loading' : ''}`}
            >
              {getButtonText()}
            </button>

            <button 
              onClick={() => onClose(false)}
              className="cancel-button"
              disabled={loading}
            >
              Cancelar
            </button>
          </div>

          <div className="payment-info">
            <div className="info-message">
              <span>🌐</span>
              <span>O Mercado Pago será aberto em uma nova guia do navegador.</span>
            </div>
          </div>

          <div className="payment-security">
            <div className="security-header">
              <span className="lock-icon">🔒</span>
              <span>Pagamento 100% seguro</span>
            </div>
            <div className="security-features">
              <div className="feature">
                <span>💳</span>
                <span>Cartão, PIX e boleto</span>
              </div>
              <div className="feature">
                <span>🛡️</span>
                <span>Ambiente seguro</span>
              </div>
              <div className="feature">
                <span>📱</span>
                <span>Nova guia do navegador</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModalMP;