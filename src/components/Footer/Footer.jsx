import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <img src="/imagens/logo.png" alt="Pet.Net" />
            <h3>Pet.Net</h3>
          </div>
          <p className="footer-description">
            Cuidando do seu pet com amor e tecnologia. Oferecemos os melhores serviços 
            e produtos para garantir o bem-estar do seu animal de estimação.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Instagram">
              <span className="icon">📷</span>
            </a>
            <a href="#" aria-label="Facebook">
              <span className="icon">📘</span>
            </a>
            <a href="#" aria-label="WhatsApp">
              <span className="icon">💬</span>
            </a>
          </div>
        </div>

        <div className="footer-section">
          <h4>Links Rápidos</h4>
          <ul className="footer-links">
            <li><Link to="/">Início</Link></li>
            <li><Link to="/servicos">Serviços</Link></li>
            <li><Link to="/produtos">Produtos</Link></li>
            <li><Link to="/curiosidades">Curiosidades</Link></li>
            <li><Link to="/agendar">Agendar</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Nossos Serviços</h4>
          <ul className="footer-links">
            <li><a href="#link_servicos">Banho e Tosa</a></li>
            <li><a href="#link_servicos">Veterinário</a></li>
            <li><a href="#link_servicos">Hospedagem</a></li>
            <li><a href="#link_servicos">Adestramento</a></li>
            <li><a href="#link_servicos">Transporte</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contato</h4>
          <div className="contact-info">
            <div className="contact-item">
              <span className="icon">📍</span>
              <span>Rua dos Pets, 123 - Petrópolis</span>
            </div>
            <div className="contact-item">
              <span className="icon">📞</span>
              <span>(24) 99999-9999</span>
            </div>
            <div className="contact-item">
              <span className="icon">✉️</span>
              <span>contato@petnet.com</span>
            </div>
            <div className="contact-item">
              <span className="icon">🕒</span>
              <span>Seg - Sex: 8h às 18h</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2024 Pet.Net - Todos os direitos reservados</p>
          <div className="footer-bottom-links">
            <a href="#">Política de Privacidade</a>
            <a href="#">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;