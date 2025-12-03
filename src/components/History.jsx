import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/History.css';

const History = ({ user }) => {
  const [activeTab, setActiveTab] = useState('reservas');
  const [reservas, setReservas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({});
  const navigate = useNavigate();
  
  const hasLoaded = useRef(false);
  const API_BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    if (!user || !user.id) {
      setError('Você precisa estar logado para ver seu histórico');
      setLoading(false);
      return;
    }

    if (!hasLoaded.current) {
      loadHistorico();
      hasLoaded.current = true;
    }
  }, [user]);

  const loadHistorico = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        setLoading(false);
        return;
      }

      try {
        const reservasResponse = await fetch(`${API_BASE_URL}/agendamentos/meus-agendamentos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (reservasResponse.ok) {
          const reservasBackend = await reservasResponse.json();
          const reservasAtivas = reservasBackend.filter(reserva => 
            reserva.status !== 'cancelado'
          );
          
          setReservas(reservasAtivas);
        } else {
          setReservas([]);
        }
      } catch (backendError) {
        setReservas([]);
      }

      try {
        const pedidosResponse = await fetch(`${API_BASE_URL}/pedidos/meus-pedidos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (pedidosResponse.ok) {
          const pedidosBackend = await pedidosResponse.json();
          
          const pedidosFormatados = pedidosBackend.map(pedido => ({
            id: pedido.id,
            usuario_id: pedido.usuario_id,
            produtos: pedido.items || pedido.produtos || [],
            total: parseFloat(pedido.total || 0),
            frete: parseFloat(pedido.frete || 0),
            subtotal: parseFloat(pedido.subtotal || 0),
            status: pedido.status || 'pendente',
            metodo_pagamento: pedido.metodo_pagamento || 'cartao',
            data_criacao: pedido.created_at || pedido.data_criacao,
            external_reference: pedido.external_reference
          }));
          
          setCompras(pedidosFormatados);
        } else {
          setCompras([]);
        }
      } catch (pedidosError) {
        setCompras([]);
      }
      
    } catch (error) {
      setError('Erro ao carregar seu histórico');
    } finally {
      setLoading(false);
    }
  };

  const apagarReserva = async (reservaId) => {
    showConfirm({
      title: 'Cancelar Reserva',
      message: `Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita.`,
      type: 'delete',
      onConfirm: async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');

          try {
            const response = await fetch(`${API_BASE_URL}/agendamentos/${reservaId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                status: 'cancelado'
              })
            });

            if (!response.ok) {
              throw new Error('Erro ao cancelar reserva no servidor');
            }

          } catch (backendError) {
            showMessage('Erro ao cancelar reserva no servidor', 'error');
            return;
          }
          
          setReservas(prevReservas => 
            prevReservas.filter(reserva => reserva.id !== reservaId)
          );

          showMessage('Reserva cancelada com sucesso!');
          
        } catch (error) {
          showMessage('Erro ao cancelar reserva', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const cancelarPedido = async (pedidoId) => {
    showConfirm({
      title: 'Excluir Pedido',
      message: `Tem certeza que deseja excluir permanentemente este pedido?`,
      type: 'delete',
      onConfirm: async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');

          const response = await fetch(`${API_BASE_URL}/pedidos/${pedidoId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            setCompras(prevCompras => 
              prevCompras.filter(compra => compra.id !== pedidoId)
            );
            
            showMessage('Pedido excluído permanentemente com sucesso!');
          } else {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao excluir pedido');
          }
          
        } catch (error) {
          showMessage('Erro ao excluir pedido: ' + error.message, 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const cancelarTodosPedidos = () => {
    if (compras.length === 0) return;
    
    showConfirm({
      title: 'Excluir Todas as Compras',
      message: `Tem certeza que deseja excluir permanentemente suas ${compras.length} compras?`,
      type: 'delete',
      onConfirm: async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');

          const excluirPromises = compras.map(async (compra) => {
            try {
              const response = await fetch(`${API_BASE_URL}/pedidos/${compra.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              });
              
              return response.ok;
            } catch (error) {
              return false;
            }
          });

          await Promise.all(excluirPromises);
          
          setCompras([]);
          
          showMessage(`${compras.length} compras excluídas permanentemente!`);
          
        } catch (error) {
          showMessage('Erro ao excluir compras', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const showConfirm = (config) => {
    setConfirmConfig(config);
    setShowConfirmModal(true);
  };

  const hideConfirm = () => {
    setShowConfirmModal(false);
    setConfirmConfig({});
  };

  const showMessage = (msg, type = 'success') => {
    setMessage({ text: msg, type });
    setTimeout(() => setMessage({}), 5000);
  };

  const apagarTodasReservas = () => {
    if (reservas.length === 0) return;
    
    showConfirm({
      title: 'Cancelar Todas as Reservas',
      message: `Tem certeza que deseja cancelar suas ${reservas.length} reservas?`,
      type: 'delete',
      onConfirm: async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          
          if (!token) {
            showMessage('Erro: Token não encontrado', 'error');
            return;
          }

          const cancelarPromises = reservas.map(async (reserva) => {
            try {
              const response = await fetch(`${API_BASE_URL}/agendamentos/${reserva.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                  status: 'cancelado'
                })
              });
              
              if (!response.ok) {
                return false;
              }
              
              return true;
            } catch (error) {
              return false;
            }
          });

          const resultados = await Promise.all(cancelarPromises);
          const sucessos = resultados.filter(Boolean).length;

          setReservas([]);

          showMessage(`${sucessos} reservas canceladas com sucesso!`);
          
        } catch (error) {
          showMessage('Erro ao cancelar reservas', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const apagarTodoHistorico = () => {
    const totalItens = reservas.length + compras.length;
    if (totalItens === 0) return;
    
    showConfirm({
      title: 'Limpar Todo o Histórico',
      message: `Tem certeza? Isso cancelará ${reservas.length} reservas e excluirá ${compras.length} compras permanentemente.`,
      type: 'delete',
      onConfirm: async () => {
        try {
          setLoading(true);
          
          if (reservas.length > 0) {
            const token = localStorage.getItem('token');
            if (token) {
              const cancelarPromises = reservas.map(async (reserva) => {
                try {
                  await fetch(`${API_BASE_URL}/agendamentos/${reserva.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: 'cancelado' })
                  });
                } catch (error) {
                }
              });
              
              await Promise.all(cancelarPromises);
            }
          }

          if (compras.length > 0) {
            const token = localStorage.getItem('token');
            if (token) {
              const excluirPromises = compras.map(async (compra) => {
                try {
                  await fetch(`${API_BASE_URL}/pedidos/${compra.id}`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${token}`
                    }
                  });
                } catch (error) {
                }
              });
              
              await Promise.all(excluirPromises);
            }
          }

          setReservas([]);
          setCompras([]);
          
          showMessage('Seu histórico foi limpo completamente!');
          
        } catch (error) {
          showMessage('Erro ao limpar histórico', 'error');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const ConfirmModal = () => {
    if (!showConfirmModal) return null;

    return (
      <div className="modal-overlay" onClick={hideConfirm}>
        <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{confirmConfig.title}</h3>
          </div>
          <div className="modal-body">
            <p>{confirmConfig.message}</p>
          </div>
          <div className="modal-actions">
            <button 
              onClick={hideConfirm}
              className="btn-cancel with-transition"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                confirmConfig.onConfirm();
                hideConfirm();
              }}
              className={`btn-confirm with-transition ${
                confirmConfig.type === 'delete' ? 'btn-delete' : ''
              }`}
            >
              {confirmConfig.type === 'delete' ? 'Confirmar' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ReservasList = () => {
    if (reservas.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>Nenhuma reserva encontrada</h3>
          <p>Você ainda não fez nenhuma reserva de serviço.</p>
          <button 
            onClick={() => navigate('/agendar')}
            className="btn-primary with-transition"
          >
            Fazer Primeira Reserva
          </button>
        </div>
      );
    }

    return (
      <div className="history-list">
        <div className="list-header">
          <h3>Minhas Reservas ({reservas.length})</h3>
          {reservas.length > 0 && (
            <button 
              onClick={apagarTodasReservas}
              className="btn-delete-all with-transition"
              disabled={loading}
            >
              🗑️ Cancelar Todas
            </button>
          )}
        </div>
        
        <div className="items-grid">
          {reservas.map((reserva) => (
            <div key={reserva.id} className="history-item">
              <div className="item-header">
                <h4>{reserva.servico_nome || 'Serviço Pet'}</h4>
                <span className={`status-badge status-${reserva.status || 'pendente'}`}>
                  {reserva.status || 'pendente'}
                </span>
              </div>
              
              <div className="item-details">
                <p><strong>Data:</strong> {new Date(reserva.data_agendamento).toLocaleString('pt-BR')}</p>
                <p><strong>Valor:</strong> R$ {parseFloat(reserva.valor_total || 0).toFixed(2)}</p>
                <p><strong>Cliente:</strong> {reserva.nome_cliente}</p>
                {reserva.pet_nome && <p><strong>Pet:</strong> {reserva.pet_nome}</p>}
                {reserva.observacoes && <p><strong>Observações:</strong> {reserva.observacoes}</p>}
              </div>
              
              <div className="item-actions">
                <button 
                  onClick={() => apagarReserva(reserva.id)}
                  className="btn-delete with-transition"
                  disabled={loading}
                >
                  ❌ Cancelar Reserva
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ComprasList = () => {
    if (compras.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">🛍️</div>
          <h3>Nenhuma compra encontrada</h3>
          <p>Você ainda não fez nenhuma compra de produtos.</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary with-transition"
          >
            Ver Produtos
          </button>
        </div>
      );
    }

    return (
      <div className="history-list">
        <div className="list-header">
          <h3>Minhas Compras ({compras.length})</h3>
          {compras.length > 0 && (
            <button 
              onClick={cancelarTodosPedidos}
              className="btn-delete-all with-transition"
              disabled={loading}
            >
              🗑️ Excluir Todas
            </button>
          )}
        </div>
        
        <div className="items-grid">
          {compras.map((compra) => (
            <div key={compra.id} className="history-item compra-item">
              <div className="item-header">
                <h4>Pedido #{compra.id}</h4>
                <span className={`status-badge status-${compra.status || 'pendente'}`}>
                  {compra.status || 'pendente'}
                </span>
              </div>
              
              <div className="item-details">
                <p><strong>Data:</strong> {new Date(compra.data_criacao).toLocaleString('pt-BR')}</p>
                <p><strong>Subtotal:</strong> R$ {parseFloat(compra.subtotal || 0).toFixed(2)}</p>
                <p><strong>Frete:</strong> R$ {parseFloat(compra.frete || 0).toFixed(2)}</p>
                <p><strong>Total:</strong> R$ {parseFloat(compra.total || 0).toFixed(2)}</p>
                
                <div className="produtos-lista">
                  <strong>Produtos:</strong>
                  {(Array.isArray(compra.produtos) ? compra.produtos : []).map((produto, index) => (
                    <div key={index} className="produto-item">
                      <span>{produto.quantidade || 1}x {produto.nome || 'Produto'}</span>
                      <span>R$ {parseFloat(produto.preco || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="item-actions">
                <button 
                  onClick={() => cancelarPedido(compra.id)}
                  className="btn-delete with-transition"
                  disabled={loading}
                >
                  ❌ Excluir Pedido
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="history-container">
      <ConfirmModal />

      {message.text && (
        <div className={`message-banner ${message.type === 'error' ? 'error' : 'success'}`}>
          {message.type === 'error' ? '❌ ' : '✅ '}{message.text}
        </div>
      )}

      <div className="history-header">
        <h1>Meu Histórico</h1>
        <p>Acompanhe suas reservas e compras</p>
        
        <div className="header-actions">
          <button onClick={loadHistorico} className="refresh-btn with-transition" disabled={loading}>
            {loading ? '🔄 Atualizando...' : '🔄 Atualizar Histórico'}
          </button>
          
          {(reservas.length > 0 || compras.length > 0) && (
            <button 
              onClick={apagarTodoHistorico} 
              className="btn-delete-all-main with-transition"
              disabled={loading}
            >
              🗑️ Limpar Todo o Histórico
            </button>
          )}
        </div>
      </div>

      <div className="history-tabs">
        <button
          className={`tab with-transition ${activeTab === 'reservas' ? 'active' : ''}`}
          onClick={() => setActiveTab('reservas')}
          disabled={loading}
        >
          📅 Reservas
          <span className="tab-badge">{reservas.length}</span>
        </button>

        <button
          className={`tab with-transition ${activeTab === 'compras' ? 'active' : ''}`}
          onClick={() => setActiveTab('compras')}
          disabled={loading}
        >
          🛍️ Compras
          <span className="tab-badge">{compras.length}</span>
        </button>
      </div>

      <div className="tab-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando seu histórico...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <h3>Erro ao carregar</h3>
            <p>{error}</p>
            <button onClick={loadHistorico} className="btn-primary with-transition">Tentar Novamente</button>
          </div>
        ) : !user ? (
          <div className="error-state">
            <h3>Acesso Restrito</h3>
            <p>Você precisa estar logado para ver seu histórico.</p>
            <button onClick={() => navigate('/login')} className="btn-primary with-transition">Fazer Login</button>
          </div>
        ) : (
          <>
            {activeTab === 'reservas' && <ReservasList />}
            {activeTab === 'compras' && <ComprasList />}
          </>
        )}
      </div>
    </div>
  );
};

export default History;