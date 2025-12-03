import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [compraInfo, setCompraInfo] = useState(null);
  const [itensCompra, setItensCompra] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processarCompra = async () => {
      try {
        setLoading(true);
        
        const jaProcessado = localStorage.getItem('compra_processada');
        if (jaProcessado) {
          const compraExistente = JSON.parse(localStorage.getItem('ultima_compra_sucesso') || 'null');
          if (compraExistente) {
            setCompraInfo(compraExistente.compraInfo);
            setItensCompra(compraExistente.itensCompra);
            setLoading(false);
            return;
          }
        }

        const ultimaCompra = JSON.parse(localStorage.getItem('ultima_compra') || 'null');

        let compraData;
        let itensData = [];

        if (ultimaCompra && ultimaCompra.itens && ultimaCompra.itens.length > 0) {
          const itensProdutos = ultimaCompra.itens.filter(item => 
            item.title !== 'Frete' && item.id !== 'frete'
          );
          
          const subtotal = itensProdutos.reduce((total, item) => 
            total + (item.unit_price * item.quantity), 0
          );
          
          const frete = 9.90;
          const valor_total = subtotal + frete;

          compraData = {
            tipo: 'compra_real',
            numero_pedido: ultimaCompra.numero_pedido || `CMP${Date.now()}`,
            data_compra: ultimaCompra.data_compra || new Date().toISOString(),
            valor_total: valor_total,
            quantidade_itens: itensProdutos.reduce((total, item) => total + item.quantity, 0),
            frete: frete,
            subtotal: subtotal,
            endereco: ultimaCompra.endereco || {}
          };

          itensData = itensProdutos.map(item => ({
            nome: item.title,
            preco: item.unit_price,
            quantidade: item.quantity,
            total: item.unit_price * item.quantity
          }));

        } else {
          setCompraInfo(null);
          setItensCompra([]);
          setLoading(false);
          return;
        }

        if (itensData.length === 0) {
          setCompraInfo(null);
          setItensCompra([]);
          setLoading(false);
          return;
        }

        const historicoCompras = JSON.parse(localStorage.getItem('historico_compras') || '[]');
        
        const compraJaExiste = historicoCompras.some(compra => 
          compra.numero_pedido === compraData.numero_pedido
        );

        if (!compraJaExiste) {
          const compraHistorico = {
            ...compraData,
            produtos: itensData,
            status: 'nao_confirmado',
            data_pagamento: new Date().toISOString(),
            metodo_pagamento: 'Mercado Pago',
            id: compraData.numero_pedido
          };

          historicoCompras.push(compraHistorico);
          localStorage.setItem('historico_compras', JSON.stringify(historicoCompras));
          
          localStorage.setItem('compra_processada', 'true');
          
          localStorage.setItem('ultima_compra_sucesso', JSON.stringify({
            compraInfo: compraData,
            itensCompra: itensData
          }));
        }

        localStorage.removeItem('ultima_compra');

        setCompraInfo(compraData);
        setItensCompra(itensData);
        setLoading(false);

      } catch (error) {
        setCompraInfo({
          tipo: 'erro',
          numero_pedido: `ERR${Date.now()}`,
          data_compra: new Date().toISOString(),
          valor_total: 0,
          quantidade_itens: 0,
          frete: 9.90,
          subtotal: 0
        });
        setItensCompra([]);
        setLoading(false);
      }
    };

    setTimeout(processarCompra, 800);
  }, []);

  const handleNavegacao = (path) => {
    localStorage.removeItem('compra_processada');
    localStorage.removeItem('ultima_compra_sucesso');
    navigate(path);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data não disponível';
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loadingIcon}>
            <div style={styles.spinner}></div>
          </div>
          <h2 style={styles.loadingTitle}>Processando sua compra...</h2>
          <p style={styles.loadingText}>Aguarde enquanto confirmamos o pagamento.</p>
        </div>
      </div>
    );
  }

  if (!compraInfo || itensCompra.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>⚠️</div>
          <h1 style={styles.title}>Compra Não Encontrada</h1>
          <p style={styles.subtitle}>Não foi possível encontrar os dados da sua compra.</p>
          
          <div style={styles.buttons}>
            <button 
              onClick={() => navigate('/')}
              style={styles.homeButton}
            >
              🏠 Voltar às Compras
            </button>
            
            <button 
              onClick={() => navigate('/historico')}
              style={styles.historyButton}
            >
              📦 Ver Meus Pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <div style={styles.card}>
        <div style={{...styles.icon, animation: 'bounce 1s ease-in-out'}}>🎉</div>
        <h1 style={styles.title}>Compra Aprovada!</h1>
        <p style={styles.subtitle}>Seu pagamento foi processado com sucesso. Obrigado pela preferência!</p>

        {compraInfo && (
          <div style={styles.details}>
            <h3 style={styles.detailsTitle}>📦 Resumo da Compra</h3>
            
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Número do Pedido:</span>
              <span style={styles.detailValue}>{compraInfo.numero_pedido}</span>
            </div>
            
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Data da Compra:</span>
              <span style={styles.detailValue}>{formatDate(compraInfo.data_compra)}</span>
            </div>
            
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}>Itens no Pedido:</span>
              <span style={styles.detailValue}>{compraInfo.quantidade_itens} {compraInfo.quantidade_itens === 1 ? 'item' : 'itens'}</span>
            </div>

            {compraInfo.endereco && compraInfo.endereco.cep && (
              <div style={styles.addressSection}>
                <h4 style={styles.addressTitle}>🏠 Endereço de Entrega</h4>
                <div style={styles.addressText}>
                  <p>📮 CEP: {compraInfo.endereco.cep}</p>
                  {compraInfo.endereco.complemento && (
                    <p>📍 {compraInfo.endereco.complemento}</p>
                  )}
                </div>
              </div>
            )}

            <div style={styles.financialSummary}>
              <h4 style={styles.summaryTitle}>💰 Resumo Financeiro</h4>
              
              <div style={styles.summaryRow}>
                <span>Subtotal ({itensCompra.length} {itensCompra.length === 1 ? 'produto' : 'produtos'}):</span>
                <span>{formatPrice(compraInfo.subtotal)}</span>
              </div>
              
              <div style={styles.summaryRow}>
                <span>Frete:</span>
                <span>{formatPrice(compraInfo.frete)}</span>
              </div>
              
              <div style={styles.totalRow}>
                <span><strong>Total:</strong></span>
                <span><strong>{formatPrice(compraInfo.valor_total)}</strong></span>
              </div>
            </div>

            <div style={styles.statusRow}>
              <span style={styles.detailLabel}>Status do Pagamento:</span>
              <span style={styles.statusSuccess}>✅ Processado com sucesso</span>
            </div>
          </div>
        )}

        {itensCompra.length > 0 && (
          <div style={styles.produtosSection}>
            <h3 style={styles.produtosTitle}>🛍️ Produtos Comprados</h3>
            <div style={styles.produtosList}>
              {itensCompra.map((item, index) => (
                <div key={index} style={styles.produtoItem}>
                  <div style={styles.produtoImage}>
                    <div style={styles.imagePlaceholder}>
                      {item.nome.charAt(0)}
                    </div>
                  </div>
                  <div style={styles.produtoInfo}>
                    <span style={styles.produtoNome}>{item.nome}</span>
                    <span style={styles.produtoDetails}>
                      {item.quantidade} × {formatPrice(item.preco)}
                    </span>
                  </div>
                  <span style={styles.produtoTotal}>
                    {formatPrice(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={styles.buttons}>
          <button 
            onClick={() => handleNavegacao('/')}
            style={styles.homeButton}
          >
            🏠 Continuar Comprando
          </button>
          
          <button 
            onClick={() => handleNavegacao('/historico')}
            style={styles.historyButton}
          >
            📦 Ver Meus Pedidos
          </button>
        </div>

        <div style={styles.infoSection}>
          <div style={styles.infoCard}>
            <h4 style={styles.infoTitle}>📧 O que acontece agora?</h4>
            <ul style={styles.infoList}>
              <li>🚚 Seus produtos serão preparados para envio</li>
              <li>📞 Entraremos em contato sobre o prazo de entrega</li>
              <li>💬 Dúvidas? Fale conosco pelo WhatsApp</li>
            </ul>
          </div>
          
          <div style={styles.demoNotice}>
            <p>
              💡 <strong>Projeto Educacional:</strong> Esta é uma simulação de compra para fins de demonstração. 
              Nenhum pagamento real foi processado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #FFF9F0 0%, #FFEBCD 100%)',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(242, 158, 56, 0.2)',
    textAlign: 'center',
    maxWidth: '700px',
    width: '100%',
    border: `3px solid #f29e38`
  },
  icon: {
    fontSize: '80px',
    marginBottom: '20px'
  },
  title: {
    color: '#f29e38',
    marginBottom: '10px',
    fontSize: '2.5rem',
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#666',
    marginBottom: '30px',
    lineHeight: '1.5'
  },
  details: {
    background: '#FFF9F0',
    padding: '25px',
    borderRadius: '12px',
    margin: '25px 0',
    textAlign: 'left',
    borderLeft: `4px solid #f29e38`
  },
  detailsTitle: {
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '1.3rem',
    fontWeight: '600'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #E8D7BC'
  },
  detailLabel: {
    fontWeight: '600',
    color: '#333'
  },
  detailValue: {
    color: '#666',
    fontWeight: '500'
  },
  addressSection: {
    margin: '20px 0',
    padding: '15px',
    background: '#FFF5E6',
    borderRadius: '8px',
    border: '1px solid #f29e38'
  },
  addressTitle: {
    color: '#f29e38',
    marginBottom: '10px',
    fontSize: '1.1rem'
  },
  financialSummary: {
    margin: '20px 0',
    padding: '15px',
    background: '#FFF5E6',
    borderRadius: '8px',
    border: '1px solid #f29e38'
  },
  summaryTitle: {
    color: '#f29e38',
    marginBottom: '15px',
    fontSize: '1.1rem'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    color: '#333'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderTop: '2px solid #f29e38',
    marginTop: '8px',
    fontSize: '1.1rem'
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    marginTop: '10px'
  },
  statusSuccess: {
    color: '#27ae60',
    fontWeight: 'bold',
    fontSize: '1.1rem'
  },
  produtosSection: {
    margin: '30px 0'
  },
  produtosTitle: {
    color: '#333',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '1.3rem',
    fontWeight: '600'
  },
  produtosList: {
    background: '#FFF9F0',
    borderRadius: '12px',
    padding: '20px',
    maxHeight: '300px',
    overflowY: 'auto'
  },
  produtoItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid #E8D7BC',
    gap: '15px'
  },
  produtoImage: {
    flexShrink: 0
  },
  imagePlaceholder: {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #f29e38 0%, #e67e22 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.2rem'
  },
  produtoInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  produtoNome: {
    fontWeight: '600',
    color: '#333',
    fontSize: '1rem'
  },
  produtoDetails: {
    fontSize: '0.9rem',
    color: '#666'
  },
  produtoTotal: {
    fontWeight: 'bold',
    color: '#f29e38',
    fontSize: '1.1rem'
  },
  buttons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    margin: '30px 0'
  },
  homeButton: {
    padding: '15px 25px',
    backgroundColor: '#f29e38',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '200px'
  },
  historyButton: {
    padding: '15px 25px',
    backgroundColor: '#e67e22',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '200px'
  },
  infoSection: {
    marginTop: '30px'
  },
  infoCard: {
    background: '#FFF5E6',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '1px solid #f29e38'
  },
  infoTitle: {
    color: '#f29e38',
    marginBottom: '15px',
    fontSize: '1.1rem'
  },
  infoList: {
    textAlign: 'left',
    color: '#333',
    lineHeight: '1.6',
    paddingLeft: '20px'
  },
  demoNotice: {
    background: '#FFF9F0',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #E8D7BC',
    color: '#666',
    fontSize: '0.9rem'
  },
  loadingIcon: {
    marginBottom: '20px'
  },
  spinner: {
    width: '60px',
    height: '60px',
    border: '6px solid #FFF9F0',
    borderTop: '6px solid #f29e38',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  },
  loadingTitle: {
    color: '#333',
    marginBottom: '10px',
    fontSize: '1.5rem'
  },
  loadingText: {
    color: '#666',
    fontSize: '1rem'
  }
};

export default PaymentSuccess;