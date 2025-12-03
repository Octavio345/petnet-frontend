import React, { useState, useEffect } from 'react';
import '../styles/Intro.css';

const Intro = () => {
  const [shouldRender, setShouldRender] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Inicia a animação de saída após 2 segundos
    const startAnimationTimer = setTimeout(() => {
      setIsAnimating(true);
    }, 2000); // Tempo que a intro fica visível

    // Remove completamente após a animação
    const removeTimer = setTimeout(() => {
      setShouldRender(false);
      // Remove a classe que bloqueia o scroll
      document.body.classList.remove('intro-active');
    }, 3000); // 2000ms visível + 1000ms animação

    // Adiciona classe ao body para controle
    document.body.classList.add('intro-active');
    
    return () => {
      clearTimeout(startAnimationTimer);
      clearTimeout(removeTimer);
      document.body.classList.remove('intro-active');
    };
  }, []);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className={`intro ${isAnimating ? 'fade-out' : ''}`}>
      <img src="/imagens/logo.png" alt="Pet.Net" className="img-fluid" width="300" />
    </div>
  );
};

export default Intro;