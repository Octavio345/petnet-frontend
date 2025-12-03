import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useLocation } from 'react-router-dom';
import emailjs from 'emailjs-com';
import '../styles/Success.css';

const Success = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [customerData, setCustomerData] = useState({
    email: '',
    name: 'Cliente',
    service: 'Serviço',
    amount: '0,00',
    date: '',
    appointment_id: ''
  });

  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');

  const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_id4oiie',
    TEMPLATE_ID: 'template_w20uj85',
    USER_ID: 'VPzqmJ8n5DdUYvCU0'
  };

  useEffect(() => {
    processPaymentSuccess();
  }, [location]);

  const sendConfirmationEmail = async (data) => {
    try {
      setSendingEmail(true);
      setEmailError('');

      const templateParams = {
        name: data.name,
        email: data.email,
        service: data.service,
        amount: data.amount,
        date: data.date,
        appointment_id: data.appointment_id,
        to_email: data.email,
        from_name: 'PetNet',
        reply_to: 'noreply@petnet.com'
      };

      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.USER_ID
      );

      setEmailSent(true);
      
    } catch (error) {
      setEmailError('Falha no envio do email. Mas seu agendamento foi confirmado!');
    } finally {
      setSendingEmail(false);
    }
  };

  const processPaymentSuccess = async () => {
    try {
      let agendamentoData = null;

      if (location.state?.agendamento) {
        agendamentoData = location.state.agendamento;
      } else {
        const reservas = JSON.parse(localStorage.getItem('reservas_reais') || '[]');
        
        if (reservas.length > 0) {
          agendamentoData = reservas[reservas.length - 1];
        }
      }

      if (agendamentoData) {
        const customerData = {
          email: agendamentoData.email_cliente || agendamentoData.email || 'cliente@exemplo.com',
          name: agendamentoData.nome_cliente || agendamentoData.name || 'Cliente PetLovers',
          service: agendamentoData.servico_nome || agendamentoData.service || 'Serviço Pet',
          amount: agendamentoData.valor_total ? `R$ ${agendamentoData.valor_total.toFixed(2)}` : 'R$ 0,00',
          date: agendamentoData.data_agendamento ? 
            new Date(agendamentoData.data_agendamento).toLocaleString('pt-BR') : 'A definir',
          appointment_id: agendamentoData.id || agendamentoData.numero_pedido || `AG${Date.now()}`
        };

        setCustomerData(customerData);
        await sendConfirmationEmail(customerData);
        
      } else {
        const mockData = {
          email: 'cliente@exemplo.com',
          name: 'Cliente PetLovers',
          service: 'Banho e Tosa',
          amount: 'R$ 80,00',
          date: new Date().toLocaleString('pt-BR'),
          appointment_id: `MOCK${Date.now()}`
        };
        
        setCustomerData(mockData);
        await sendConfirmationEmail(mockData);
      }
      
    } catch (error) {
      setEmailError('Erro ao carregar informações do pedido');
      setSendingEmail(false);
    }
  };

  const formatCurrency = (value) => {
    if (typeof value === 'number') {
      return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    }
    return value;
  };

  const handleResendEmail = async () => {
    await sendConfirmationEmail(customerData);
  };

  return (
    <div className="success-page">
      <div className="success-container">

        <div className="success-icon">
          <div className="checkmark">✓</div>
        </div>

        <h2 className="success-title">
          {location.state?.agendamento ? '🎉 Agendamento Confirmado!' : '🎉 Compra Realizada com Sucesso!'}
        </h2>

        <p className="success-subtitle">
          {location.state?.agendamento 
            ? 'Seu agendamento foi confirmado com sucesso!'
            : 'Obrigado por comprar conosco! Sua compra foi processada e confirmada.'
          }
        </p>

        <div className="details-card">
          <div className="detail-item">
            <span className="detail-label">Cliente:</span>
            <span className="detail-value">{customerData.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">
              {location.state?.agendamento ? 'Serviço:' : 'Produto:'}
            </span>
            <span className="detail-value">{customerData.service}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Valor Total:</span>
            <span className="detail-value">{customerData.amount}</span>
          </div>

          {location.state?.agendamento && (
            <div className="detail-item">
              <span className="detail-label">Data e Horário:</span>
              <span className="detail-value">{customerData.date}</span>
            </div>
          )}

          <div className="detail-item">
            <span className="detail-label">Nº do Pedido:</span>
            <span className="detail-value">{customerData.appointment_id}</span>
          </div>
        </div>

        <div className="email-status">
          {emailSent ? (
            <div className="email-success">
              <span className="email-icon">📧</span>
              <div>
                <strong>E-mail enviado com sucesso!</strong>
                <p className="email-text">
                  A confirmação foi enviada para <strong>{customerData.email}</strong>
                </p>
                <button 
                  onClick={handleResendEmail}
                  className="resend-button"
                  disabled={sendingEmail}
                >
                  {sendingEmail ? 'Enviando...' : '📨 Reenviar E-mail'}
                </button>
              </div>
            </div>
          ) : emailError ? (
            <div className="email-error">
              <span className="error-icon">⚠️</span>
              <div>
                <strong>Não foi possível enviar o e-mail</strong>
                <p className="error-text">{emailError}</p>
                <button 
                  onClick={handleResendEmail}
                  className="resend-button"
                  disabled={sendingEmail}
                >
                  {sendingEmail ? 'Tentando...' : '🔄 Tentar Novamente'}
                </button>
              </div>
            </div>
          ) : (
            <div className="email-loading">
              <div className="loading-spinner"></div>
              <p>Enviando confirmação para {customerData.email}...</p>
            </div>
          )}
        </div>

        <div className="additional-info">
          <div className="info-item">
            <span className="info-icon">🛡️</span>
            <span>Pagamento 100% seguro</span>
          </div>
          {location.state?.agendamento ? (
            <div className="info-item">
              <span className="info-icon">🐾</span>
              <span>Seu pet vai adorar o serviço!</span>
            </div>
          ) : (
            <div className="info-item">
              <span className="info-icon">🚚</span>
              <span>Entrega em até 5 dias úteis</span>
            </div>
          )}
          <div className="info-item">
            <span className="info-icon">📞</span>
            <span>Dúvidas? (19) 9999-9999</span>
          </div>
        </div>

        <div className="actions">
          <Link to="/" className="primary-button">
            🏠 {location.state?.agendamento ? 'Voltar para Home' : 'Continuar Comprando'}
          </Link>
          <Link to="/historico" className="secondary-button">
            📅 Meus Agendamentos
          </Link>
        </div>

        <div className="footer">
          <p className="footer-text">
            Obrigado por escolher nossa loja! Seu pet agradece! 🐾
          </p>
          {(sessionId || paymentId) && (
            <p className="reference-id">
              ID da transação: {sessionId || paymentId}
            </p>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default Success;
