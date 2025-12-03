import React from 'react';
import '../styles/SloganSection.css';
import { Navbar, Nav, Container, Offcanvas } from 'react-bootstrap';

const SloganSection = () => {
  return (
    <div className="slogan-section">
      <div className="slogan-content">
        <div id="slogan-petshop" className="animacao">
          Cuidando com amor de quem te faz <span id="slogan-cor">feliz.</span>
        </div>
      
        <div id="subtitulo" className="animacao">
          Aproveite nossos serviços! Escolha o que seu pet merece e garanta cuidado e carinho em cada detalhe.
        </div>

        <div id="btn-ver-servicos" className="animacao delay-btn">
          <button className="btn btn-link text-start m-0 shadow">
            <Nav className="nav-links">  
              <Nav.Link href="#link_servicos">Ver serviços</Nav.Link>
            </Nav>
          </button>
          <div id="numero-telefone" className="shadow">
            <div id="fundo-telefone">
              <img src="/imagens/telefone.png" alt="Telefone" />
            </div>
            (19) 99999-9999
          </div>
        </div>
      </div>
    </div>
  );
};

export default SloganSection;