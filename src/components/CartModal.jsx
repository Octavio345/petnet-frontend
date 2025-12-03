import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentModalMP from './PaymentModalMP';
import AddressModal from './AddressModal';
import { HistoryManager } from '../services/api';
import '../styles/Cart.css';

const CartModal = ({ 
  show, 
  onHide, 
  cartItems, 
  onUpdateItem, 
  onRemoveItem,
  onLimparCarrinho,
  user
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [carrinhoParaPagamento, setCarrinhoParaPagamento] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantidade, 0);
  };

  const salvarPedidoNoBackend = async (compraData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return false;
      }

      const response = await fetch('http://localhost:3000/pedidos/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          produtos: compraData.produtos,
          total: compraData.valor_total,
          frete: compraData.frete || 9.90,
          metodo_pagamento: 'cartao'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return false;
      }

      const data = await response.json();

      if (data.success) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const handleFinalizarCompra = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Você precisa estar logado para finalizar a compra!');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) return;

    const subtotal = getSubtotal();
    const carrinhoData = {
      items: cartItems.map(item => ({
        id: item.id || `prod_${Date.now()}`,
        title: item.nome || 'Produto não especificado',
        quantity: Number(item.quantidade),
        unit_price: Number(item.preco),
        picture_url: item.imagem || '',
        currency_id: 'BRL'
      })),
      subtotal,
      total: subtotal,
      quantidade_itens: getTotalItems(),
      carrinho_id: `cart_${Date.now()}`
    };

    setCarrinhoParaPagamento(carrinhoData);
    setShowAddressModal(true);
    onHide();
  };

  const handleEnderecoConfirmado = ({ cep, complemento, frete }) => {
    const total = carrinhoParaPagamento.subtotal + frete;

    const carrinhoComFrete = {
      ...carrinhoParaPagamento,
      items: [
        ...carrinhoParaPagamento.items,
        {
          id: 'frete',
          title: 'Frete',
          quantity: 1,
          unit_price: frete,
          currency_id: 'BRL'
        }
      ],
      total: total,
      frete: frete,
      endereco: { cep, complemento }
    };

    const compraData = {
      tipo: 'compra_produtos',
      numero_pedido: `CMP${Date.now()}`,
      data_compra: new Date().toISOString(),
      valor_total: carrinhoComFrete.total,
      quantidade_itens: carrinhoComFrete.quantidade_itens,
      itens: carrinhoComFrete.items.filter(item => item.title !== 'Frete' && item.id !== 'frete'),
      produtos: carrinhoComFrete.items.filter(item => item.title !== 'Frete' && item.id !== 'frete').map(item => ({
        id: item.id,
        nome: item.title || 'Produto não especificado',
        quantidade: Number(item.quantity),
        preco: Number(item.unit_price),
        total: Number(item.quantity) * Number(item.unit_price),
        imagem: item.picture_url || ''
      })),
      frete: carrinhoComFrete.frete || 0,
      subtotal: carrinhoComFrete.subtotal,
      endereco: carrinhoComFrete.endereco
    };

    localStorage.setItem('ultima_compra', JSON.stringify(compraData));

    setCarrinhoParaPagamento(carrinhoComFrete);
    setShowAddressModal(false);
    setShowPayment(true);
  };

  const handlePaymentClose = async (success, url, dados) => {
    if (success && url) {
      setLoading(true);
      
      try {
        if (carrinhoParaPagamento) {
          const compraData = {
            numero_pedido: `CMP${Date.now()}`,
            data_compra: new Date().toISOString(),
            valor_total: carrinhoParaPagamento.total,
            quantidade_itens: carrinhoParaPagamento.quantidade_itens,
            produtos: carrinhoParaPagamento.items
              .filter(item => item.title !== 'Frete' && item.id !== 'frete')
              .map(item => ({
                id: item.id,
                nome: item.title || 'Produto não especificado',
                quantidade: Number(item.quantity),
                preco: Number(item.unit_price),
                total: Number(item.quantity) * Number(item.unit_price),
                imagem: item.picture_url || ''
              })),
            frete: carrinhoParaPagamento.frete || 0,
            subtotal: carrinhoParaPagamento.subtotal,
            endereco: carrinhoParaPagamento.endereco || {}
          };

          HistoryManager.salvarCompraUnica(compraData);

          const salvouNoBackend = await salvarPedidoNoBackend(compraData);
        }

        if (onLimparCarrinho) {
          onLimparCarrinho();
        }

        setTimeout(() => {
          const mpWindow = window.open(url, '_blank');

          if (mpWindow) {
            const checkWindowClosed = setInterval(() => {
              if (mpWindow.closed) {
                clearInterval(checkWindowClosed);
                navigate('/payment-success');
              }
            }, 500);
          } else {
            setTimeout(() => {
              navigate('/payment-success');
            }, 3000);
          }
        }, 1000);

        setTimeout(() => {
          setShowPayment(false);
          onHide();
        }, 500);

      } catch (error) {
        console.error('❌ Erro no processamento:', error);
      } finally {
        setLoading(false);
      }

    } else {
      setShowPayment(false);
      onHide();
    }
  };

  const handleAddressModalClose = () => {
    setShowAddressModal(false);
    if (cartItems.length > 0) {
      setTimeout(() => {
        onHide();
      }, 100);
    }
  };

  return (
    <>
      {show && (
        <div className="modal-carrinho" onClick={onHide}>
          <div className="modal-conteudo" onClick={(e) => e.stopPropagation()}>
            <span className="fechar" onClick={onHide}>&times;</span>
            <h2>Seu carrinho ({getTotalItems()} itens)</h2>

            <div id="itens-carrinho">
              {cartItems.length === 0 ? (
                <div className="carrinho-vazio">
                  <p>🛒 Seu carrinho está vazio</p>
                  <p className="texto-pequeno">Adicione produtos para ver aqui</p>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div key={`${item.nome}-${index}`} className="item-carrinho">
                    <div className="item-info">
                      <img src={item.imagem} alt={item.nome} />
                      <div className="item-detalhes">
                        <p className="item-nome">{item.nome}</p>
                        <p className="item-preco">R$ {item.preco.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="item-controles">
                      <button 
                        onClick={() => onUpdateItem(item.nome, item.quantidade - 1)}
                        className="btn-controle"
                        disabled={item.quantidade <= 1}
                      >
                        -
                      </button>
                      <span className="item-quantidade">{item.quantidade}</span>
                      <button 
                        onClick={() => onUpdateItem(item.nome, item.quantidade + 1)}
                        className="btn-controle"
                      >
                        +
                      </button>
                      <button 
                        className="btn-remover"
                        onClick={() => onRemoveItem(item.nome)}
                        title="Remover item"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <>
                <div className="resumo-pedido">
                  <div className="linha-resumo">
                    <span>Subtotal:</span>
                    <span>R$ {getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="linha-resumo">
                    <span>Frete:</span>
                    <span>Calculado no próximo passo</span>
                  </div>
                  <div className="linha-resumo total">
                    <span>Total estimado:</span>
                    <span>R$ {getSubtotal().toFixed(2)}</span>
                  </div>
                </div>

                <div className="botoes-acoes">
                  <button 
                    className="btn-limpar-carrinho"
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja limpar todo o carrinho?')) {
                        onLimparCarrinho();
                      }
                    }}
                  >
                    🗑️ Limpar Carrinho
                  </button>
                  
                  <button 
                    id="btn-finalizar"
                    onClick={handleFinalizarCompra}
                    className="btn-pagamento"
                    disabled={loading}
                  >
                    {loading ? '🔄 Processando...' : '🛒 Finalizar Compra'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <AddressModal
        isOpen={showAddressModal}
        subtotal={getSubtotal()}
        onCancel={handleAddressModalClose}
        onConfirm={handleEnderecoConfirmado}
      />

      {showPayment && carrinhoParaPagamento && (
        <PaymentModalMP
          isOpen={showPayment}
          onClose={handlePaymentClose}
          carrinho={carrinhoParaPagamento}
          tipo="produtos"
          user={user}
        />
      )}
    </>
  );
};

export default CartModal;