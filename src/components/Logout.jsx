import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiContext } from '../App';

const Logout = ({ onLogout }) => {
  const navigate = useNavigate();
  const apiContext = useContext(ApiContext);

  useEffect(() => {
    const performLogout = async () => {
      try {
        if (onLogout) {
          onLogout();
        } else if (apiContext?.onLogout) {
          apiContext.onLogout();
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('usuario_id');
          localStorage.removeItem('usuario_nome');
          localStorage.removeItem('carrinho');
        }
        
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
        
      } catch (error) {
        localStorage.clear();
        navigate('/', { replace: true });
      }
    };

    performLogout();
  }, [navigate, apiContext, onLogout]);

  return (
    <div className="logout-container" style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '50vh',
      flexDirection: 'column'
    }}>
      <div className="logout-message">
        <h2>Saindo...</h2>
        <p>Você está sendo desconectado.</p>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    </div>
  );
};

export default Logout;