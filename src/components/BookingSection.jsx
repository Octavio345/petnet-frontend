import React from 'react';
import { Link } from 'react-router-dom';
import iconeReserva from '../../public/imagens/icone-reserva.svg';
import '../styles/BookingSection.css';

const BookingSection = () => {
  return (
    <section id="link_reservas" className="booking-section">
      <div className="animacao delay-reserva">
        <div id="fundo-reservar-horario">
          
          <div className="booking-left">
            <p className="titulos reserva" id="ajustar-reserva">RESERVA</p>

            <p className="subtitulos reserva" id="ajustar-titulo-reserva">
              Quer reservar um horário?
            </p>

            <p id="texto">
              Mande uma mensagem clicando no botão abaixo.  
              Reserve sua data e horário de forma simples e rápida.
            </p>

            <div id="link-reserva">
              <Link to="/agendar" className="reserva-link">
                Fazer reserva
              </Link>
            </div>
          </div>

          <div className="booking-right">
            <img src={iconeReserva} alt="ícone de reserva" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default BookingSection;