import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ApiContext } from '../App';
import '../styles/RegisterForm.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiContext = useContext(ApiContext);
  const { onRegister, API_BASE_URL } = apiContext || {};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setLoading(true);

    if (formData.senha !== formData.confirmarSenha) {
      setErro('As senhas não coincidem!');
      setLoading(false);
      return;
    }

    if (formData.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres!');
      setLoading(false);
      return;
    }

    try {
      if (onRegister) {
        const result = await onRegister(formData.nome, formData.email, formData.senha);
        
        if (result.success) {
          setSucesso('Cadastro realizado com sucesso! Redirecionando...');
          
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          setErro(result.message || 'Erro no cadastro');
        }
      } else {
        const backendUrl = API_BASE_URL || 'http://localhost:3000';
        
        const response = await fetch(`${backendUrl}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome: formData.nome,
            email: formData.email,
            senha: formData.senha
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          setSucesso('Cadastro realizado com sucesso!');
          
          localStorage.setItem('token', result.token);
          localStorage.setItem('usuario_id', result.usuario.id);
          localStorage.setItem('usuario_nome', result.usuario.nome);
          
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          setErro(result.message || 'Erro no cadastro');
        }
      }
    } catch (error) {
      setErro(error.message || 'Erro de conexão. Verifique se o backend está rodando.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';

    return () => {
      if (header) header.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  return (
    <div className="register-container">
      <div className="register-form-wrapper">
        <div className="form-column">
          <Link to="/" className="back-link">
            ← Voltar para Home
          </Link>
          
          <img src="/imagens/logo.png" className="logo" alt="PetNet" />
          
          <h1 className="register-title">Criar Conta</h1>

          <form onSubmit={handleSubmit} className="register-form">
            <div className="input-group">
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Nome completo"
                className="register-input"
                required
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="register-input"
                required
                disabled={loading}
              />
            </div>
            
            <div className="input-group">
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="Senha (mínimo 6 caracteres)"
                className="register-input"
                required
                minLength="6"
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                placeholder="Confirmar Senha"
                className="register-input"
                required
                disabled={loading}
              />
            </div>

            {erro && (
              <div className="error-message">
                ❌ {erro}
                {erro.includes('backend') && (
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                    Certifique-se de que o backend está rodando na porta 3000
                  </div>
                )}
              </div>
            )}
            {sucesso && <div className="success-message">✅ {sucesso}</div>}

            <button 
              type="submit" 
              className={`register-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Cadastrando...
                </>
              ) : (
                'Cadastrar'
              )}
            </button>
          </form>

          <p className="login-link">
            Já tem conta?
            <Link to="/login" className="login-btn-link">Faça login aqui</Link>
          </p>
        </div>

        <div className="info-column" id="desktop">
          <div className="info-content">
            <h2>Junte-se à <span className="highlight">PetNet</span></h2>
            <p className="info-subtitle">Sua comunidade de cuidados com pets</p>
            <ul className="features-list">
              <li className="feature-item">
                <span className="check-icon">✓</span>
                Acesso a todos os serviços PetNet
              </li>
              <li className="feature-item">
                <span className="check-icon">✓</span>
                Histórico de reservas e compras
              </li>
              <li className="feature-item">
                <span className="check-icon">✓</span>
                Ofertas exclusivas para membros
              </li>
              <li className="feature-item">
                <span className="check-icon">✓</span>
                Suporte prioritário
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;