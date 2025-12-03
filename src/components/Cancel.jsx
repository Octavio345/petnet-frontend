import React from 'react';
import { Link } from 'react-router-dom';

const Cancel = () => {
  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h2 style={styles.title}>Pagamento Cancelado</h2>
        
        <p style={styles.message}>
          Seu pagamento foi cancelado. Se isso foi um erro, você pode tentar novamente.
        </p>
        
        <div style={styles.actions}>
          <Link to="/agendar" style={styles.primaryButton}>
            Tentar Novamente
          </Link>
          <Link to="/" style={styles.secondaryButton}>
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  body: {
    fontFamily: "'Poppins', Arial, sans-serif",
    background: 'linear-gradient(135deg, #fff0f0, #ffd0d0)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    margin: 0,
  },
  container: {
    background: '#fff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
    maxWidth: '420px',
    textAlign: 'center',
  },
  title: {
    color: '#ff3b3b',
    marginBottom: '15px',
  },
  message: {
    color: '#333',
    fontSize: '15px',
    lineHeight: '1.6',
    marginBottom: '25px',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  primaryButton: {
    display: 'inline-block',
    background: '#f29e38',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'background 0.3s',
  },
  secondaryButton: {
    display: 'inline-block',
    background: 'transparent',
    color: '#666',
    padding: '12px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    border: '2px solid #ddd',
    transition: 'all 0.3s',
  }
};

export default Cancel;