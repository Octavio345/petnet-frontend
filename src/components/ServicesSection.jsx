import React from 'react';
import '../styles/ServicesSection.css';

const ServicesSection = () => {
  const services = [
    {
      id: 1,
      image: '/imagens/facil-de-pedir.png',
      title: 'Fácil de pedir',
      description: 'Só é preciso alguns passos para pedir seus produtos.',
      delay: 'delay-servicos'
    },
    {
      id: 2,
      image: '/imagens/entrega_rapida.png',
      title: 'Entrega rápida',
      description: 'Nossa entrega é sempre pontual, rápida e segura.',
      delay: 'delay-entrega-rapida'
    },
    {
      id: 3,
      image: '/imagens/melhor-qualidade.png',
      title: 'Melhor qualidade',
      description: 'Não só a rapidez na entrega, a qualidade também é o nosso forte.',
      delay: 'delay-melhor-qualidade'
    }
  ];

  return (
    <section id="link_servicos" className="services-section">
      <div className="titulos">SERVIÇOS</div>
      <div className="subtitulos">Como são nossos serviços</div>
      
      <div id="servicos-container">
        {services.map(service => (
          <div key={service.id} className={`servico-item animacao ${service.delay}`}>
            <div className="img-servicos">
              <img src={service.image} alt={service.title} />
            </div>
            <p className="titulo-descricao">{service.title}</p>
            <p className="texto-descricao">{service.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;