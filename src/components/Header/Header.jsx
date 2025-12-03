import React, { useState, useEffect, useContext } from 'react';
import { Navbar, Nav, Container, Offcanvas, Modal, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ApiContext } from '../../App';
import '../../styles/Header.css';

const Header = ({ darkMode, toggleDarkMode, cartItemsCount, onCartClick, onLogout }) => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [localDarkMode, setLocalDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });
  const location = useLocation();
  const navigate = useNavigate();

  const apiContext = useContext(ApiContext);
  const { user } = apiContext || {};

  const handleClose = () => setShowOffcanvas(false);
  const handleShow = () => setShowOffcanvas(true);
  const handleUserModalClose = () => setShowUserModal(false);
  const handleUserModalShow = () => setShowUserModal(true);

  const handleLogout = () => {
    console.log('🚪 Iniciando logout pelo Header...');
    
    handleUserModalClose();
    
    if (onLogout) {
      console.log('✅ Usando onLogout da prop');
      onLogout();
    } else if (apiContext?.onLogout) {
      console.log('✅ Usando onLogout do contexto');
      apiContext.onLogout();
    } else {
      console.log('⚠️ Usando fallback do logout');
      localStorage.removeItem('token');
      localStorage.removeItem('usuario_id');
      localStorage.removeItem('usuario_nome');
      localStorage.removeItem('carrinho');
    }
    
    navigate('/');
    
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const handleToggleDarkMode = () => {
    const newMode = !(darkMode !== undefined ? darkMode : localDarkMode);
    
    if (toggleDarkMode) {
      toggleDarkMode();
    } else {
      setLocalDarkMode(newMode);
      localStorage.setItem("darkMode", newMode.toString());
      document.body.classList.toggle("dark-mode", newMode);
    }
  };

  const handleAnchorClick = (anchorId) => {
    handleClose();
    
    if (location.pathname !== '/') {
      navigate(`/#${anchorId}`);
    } else {
      setTimeout(() => {
        const element = document.getElementById(anchorId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      setTimeout(() => {
        const element = document.getElementById(location.hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [location]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const desktopNav = document.querySelector('.desktop-nav');
      if (desktopNav) {
        const rect = desktopNav.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        desktopNav.style.setProperty('--mouse-x', `${x}px`);
        desktopNav.style.setProperty('--mouse-y', `${y}px`);
      }
    };

    const desktopNav = document.querySelector('.desktop-nav');
    if (desktopNav) {
      desktopNav.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (desktopNav) {
        desktopNav.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const usuarioLogado = user || {
    id: localStorage.getItem('usuario_id'),
    nome: localStorage.getItem('usuario_nome')
  };

  const currentDarkMode = darkMode !== undefined ? darkMode : localDarkMode;

  const UserSection = () => {
    if (usuarioLogado && usuarioLogado.id) {
      return (
        <div className="user-section">
          <div className="user-info-line">
            <span className="user-name" onClick={handleUserModalShow}>
              Olá, {usuarioLogado.nome}
            </span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="user-section">
          <p id="user-info">
            <Link to="/login" onClick={handleClose} className="header-login-btn-icon">
              Fazer login
            </Link>
          </p>
        </div>
      );
    }
  };

  return (
    <header>
      <Navbar expand="lg" className="desktop-nav">
        <Container fluid>
          <Navbar.Brand as={Link} to="/">
            <img src="/imagens/logo.png" className="logo-img" alt="Pet.Net" />
          </Navbar.Brand>

          <div className="desktop-menu">
            <Nav className="nav-links">
              <Nav.Link as="button" onClick={() => handleAnchorClick('link_reservas')}>
                Reservas
              </Nav.Link>
              <Nav.Link as="button" onClick={() => handleAnchorClick('link_servicos')}>
                Serviços
              </Nav.Link>
              <Nav.Link as="button" onClick={() => handleAnchorClick('link_produtos')}>
                Produtos
              </Nav.Link>
              <Nav.Link as={Link} to="/curiosidades" onClick={handleClose}>
                Curiosidades
              </Nav.Link>
            </Nav>

            <div className="nav-controls">
              <div className="carrinho-btn">
                <button className="btn" onClick={onCartClick}>
                  Meu carrinho ({cartItemsCount})
                </button>
              </div>

              <UserSection />
            </div>
          </div>

          <Navbar.Toggle 
            aria-controls="offcanvasNavbar"
            onClick={handleShow}
            className="mobile-only"
          />
        </Container>
      </Navbar>

      <Modal 
        show={showUserModal} 
        onHide={handleUserModalClose}
        centered
        className="user-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Configurações</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="user-modal-content">
            <div className="user-info">
              <div className="user-avatar">
                {usuarioLogado?.nome?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <h6>{usuarioLogado?.nome || 'Usuário'}</h6>
                <p>Bem-vindo de volta!</p>
              </div>
            </div>
            
            <div className="modal-options">
              <div className="modal-option">
                <div className="option-content">
                  <span className="option-icon">🌙</span>
                  <span className="option-text">Modo Escuro</span>
                </div>
                <div className="switch__container">
                  <input 
                    id="switch-modal" 
                    className="switch switch--shadow" 
                    type="checkbox"
                    checked={currentDarkMode}
                    onChange={handleToggleDarkMode}
                  />
                  <label htmlFor="switch-modal"></label>
                </div>
              </div>

              <div className="modal-option">
                <div className="option-content">
                  <span className="option-icon">📊</span>
                  <span className="option-text">Meu Histórico</span>
                </div>
                <Link 
                  to="/historico" 
                  className="option-link"
                  onClick={handleUserModalClose}
                >
                  Ver
                </Link>
              </div>

              <div className="modal-option">
                <div className="option-content">
                  <span className="option-icon">🚪</span>
                  <span className="option-text">Sair</span>
                </div>
                <Button 
                  variant="link" 
                  className="option-link logout"
                  onClick={handleLogout}
                >
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Offcanvas 
        show={showOffcanvas} 
        onHide={handleClose}
        placement="end"
        className="mobile-only"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="fundo_laranja_claro_menu">
            <Nav className="flex-column">
              <Nav.Link as="button" onClick={() => handleAnchorClick('link_reservas')}>
                Reservas
              </Nav.Link>
              <Nav.Link as="button" onClick={() => handleAnchorClick('link_servicos')}>
                Serviços
              </Nav.Link>
              <Nav.Link as="button" onClick={() => handleAnchorClick('link_produtos')}>
                Produtos
              </Nav.Link>
              <Nav.Link as={Link} to="/curiosidades" onClick={handleClose}>
                Curiosidades
              </Nav.Link>
              
              <div className="carrinho-btn mt-3">
                <button className="btn btn-link w-100 text-center m-0" onClick={() => { onCartClick(); handleClose(); }}>
                  Meu carrinho ({cartItemsCount})
                </button>
              </div>

              <div className="theme-control mt-3">
                <div className="switch__container">
                  <input 
                    id="switch-shadow-mobile" 
                    className="switch switch--shadow" 
                    type="checkbox"
                    checked={currentDarkMode}
                    onChange={handleToggleDarkMode}
                  />
                  <label htmlFor="switch-shadow-mobile"></label>
                </div>
                <span id="modo_alternancia">
                  {currentDarkMode ? 'Modo claro' : 'Modo escuro'}
                </span>
              </div>

              <div className="user-section mt-3">
                <UserSection />
              </div>
            </Nav>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </header>
  );
};

export default Header;