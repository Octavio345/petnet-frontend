import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ApiContext } from '../App';
import '../styles/LoginForm.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiContext = useContext(ApiContext);
  const { onLogin, API_BASE_URL } = apiContext || {};

  useEffect(() => {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';

    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: '281090273699-d4cq3tuaorj7ds5sudmqkl9rmq4m946p.apps.googleusercontent.com',
        callback: handleGoogleLogin
      });
    }

    return () => {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setLoading(true);

    try {
      if (!onLogin) {
        throw new Error('Sistema de login não disponível');
      }

      const result = await onLogin(email, senha);
      
      if (result.success) {
        setSucesso('Login realizado com sucesso!');
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setErro(result.message || 'Erro no login');
      }
    } catch (error) {
      setErro(error.message || 'Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (response) => {
    setLoading(true);
    setErro('');
    setSucesso('');

    try {
      const loginResponse = await fetch(`${API_BASE_URL || 'http://localhost:3000'}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: response.credential
        })
      });

      const data = await loginResponse.json();

      if (data.success) {
        setSucesso('Login com Google realizado com sucesso!');
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario_id', data.usuario.id);
        localStorage.setItem('usuario_nome', data.usuario.nome);
        
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        setErro(data.message || 'Erro no login com Google');
      }
    } catch (error) {
      setErro('Erro de conexão com Google');
    } finally {
      setLoading(false);
    }
  };

  const triggerGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setErro('Google Sign-In não carregado. Recarregue a página.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <div className="form-column">
          <Link to="/" className="back-link">
            ← Voltar para Home
          </Link>
          
          <img src="/imagens/logo.png" className="logo" alt="PetNet" />
          
          <div className="google-btn-container">
            <button onClick={triggerGoogleLogin} className="google-btn" disabled={loading}>
              <svg className="google-icon" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Conectando...' : 'Entrar com Google'}
            </button>
          </div>

          <div className="divider">
            <span>ou</span>
          </div>

          <h1 className="login-title">Entrar no PetNet</h1>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="login-input"
                required
                disabled={loading}
              />
            </div>
            
            <div className="input-group">
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Senha"
                className="login-input"
                required
                disabled={loading}
              />
            </div>

            {erro && <div className="error-message">{erro}</div>}
            {sucesso && <div className="success-message">{sucesso}</div>}

            <button 
              type="submit" 
              className={`login-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="register-link">
            Não tem conta?
            <Link to="/register" className="register-btn">Cadastre-se aqui</Link>
          </p>
        </div>

        <div className="info-column" id='desktop'>
          <div className="info-content">
            <h2>Pet<span className="highlight">Net</span></h2>
            <p className="info-subtitle">Protegendo vidas, fortalecendo laços</p>
            <ul className="features-list">
              <li className="feature-item">
                <span className="check-icon">✓</span>
                Profissionais qualificados e dedicados
              </li>
              <li className="feature-item">
                <span className="check-icon">✓</span>
                Tratamentos preventivos e emergenciais
              </li>
              <li className="feature-item">
                <span className="check-icon">✓</span>
                Conforto e bem-estar para seu pet
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;