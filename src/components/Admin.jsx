import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Admin = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:3000/agendamentos/todos');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar agendamentos');
      }
      
      const data = await response.json();
      console.log('📊 Agendamentos carregados do backend:', data);
      setAppointments(data);
      
    } catch (error) {
      console.log('❌ Erro no backend, usando fallback:', error);
      
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const responseWithAuth = await fetch('http://localhost:3000/agendamentos/todos', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (responseWithAuth.ok) {
            const dataWithAuth = await responseWithAuth.json();
            console.log('📊 Agendamentos com auth:', dataWithAuth);
            setAppointments(dataWithAuth);
            return;
          }
        }
      } catch (authError) {
        console.log('❌ Erro com auth também:', authError);
      }
      
      try {
        const reservas = JSON.parse(localStorage.getItem('reservas_reais') || '[]');
        const agendamentosFormatados = reservas.map(reserva => ({
          id: reserva.id,
          customer_name: reserva.nome_cliente,
          customer_email: reserva.email_cliente,
          service_name: reserva.servico_nome,
          start_at: reserva.data_agendamento,
          status: reserva.status || 'pending',
          price: `R$ ${parseFloat(reserva.valor_total || 0).toFixed(2)}`,
          created_at: reserva.data_criacao
        }));
        
        setAppointments(agendamentosFormatados);
        console.log('📊 Agendamentos do localStorage:', agendamentosFormatados);
      } catch (localError) {
        console.error('❌ Erro ao carregar do localStorage:', localError);
        setError('Não foi possível carregar os agendamentos');
      }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments();
    
    const interval = setInterval(loadAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return '--/--/----';
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return '--:--';
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      confirmado: 'bg-green-100 text-green-800',
      pendente: 'bg-yellow-100 text-yellow-800',
      cancelado: 'bg-red-100 text-red-800',
      concluido: 'bg-blue-100 text-blue-800'
    };
    
    const labels = {
      confirmado: 'Confirmado',
      pendente: 'Pendente',
      cancelado: 'Cancelado',
      concluido: 'Concluído'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${styles[status] || styles.pendente}`}>
        {labels[status] || 'Pendente'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#fffdf7] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-center text-[#212121] mb-2">
            Painel Administrativo PetNet
          </h1>
          <p className="text-center text-[#90908e] mb-6">
            Gerencie todos os agendamentos do sistema
          </p>
          
          <div className="text-center mb-6">
            <Link 
              to="/" 
              className="bg-[#f29e38] hover:bg-[#d4851f] text-white font-semibold px-6 py-2 rounded-lg transition inline-block"
            >
              ← Voltar para Home
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#212121]">
              Lista de Agendamentos ({appointments.length})
            </h2>
            <button 
              onClick={loadAppointments}
              className="bg-[#f9c375] hover:bg-[#e6b15a] text-[#212121] font-semibold px-4 py-2 rounded-lg transition"
            >
              🔄 Atualizar
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#f29e38]"></div>
              <p className="mt-2 text-[#90908e]">Carregando agendamentos...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-600">
              <p className="font-semibold">Erro ao carregar agendamentos</p>
              <p className="text-sm mt-2">{error}</p>
              <button 
                onClick={loadAppointments}
                className="mt-4 bg-[#f29e38] hover:bg-[#d4851f] text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {!loading && !error && appointments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[#90908e] text-lg">Nenhum agendamento encontrado.</p>
              <p className="text-[#90908e]">Todos os agendamentos aparecerão aqui.</p>
            </div>
          )}

          {!loading && !error && appointments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="py-3 px-4 text-left">Cliente</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Serviço</th>
                    <th className="py-3 px-4 text-left">Data/Hora</th>
                    <th className="py-3 px-4 text-left">Valor</th>
                    <th className="py-3 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appt) => (
                    <tr key={appt.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{appt.customer_name || appt.nome_cliente}</td>
                      <td className="py-3 px-4">{appt.customer_email || appt.email_cliente}</td>
                      <td className="py-3 px-4">{appt.service_name || appt.servico_nome}</td>
                      <td className="py-3 px-4">
                        <div>{formatDate(appt.start_at || appt.data_agendamento)}</div>
                        <div className="text-sm text-gray-500">
                          {formatTime(appt.start_at || appt.data_agendamento)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {appt.price || `R$ ${parseFloat(appt.valor_total || 0).toFixed(2)}`}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(appt.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;