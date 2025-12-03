import React from 'react';
import { useLocation } from 'react-router-dom';
import FloatingCart from './FloatingCart';
import FloatingAi from './FloatingAI';

const FloatingComponentsWrapper = ({ cartItemsCount, onCartClick }) => {
  const location = useLocation();
  
  // Rotas onde os componentes flutuantes NÃO devem aparecer
  const hiddenRoutes = ['/login', '/register'];
  
  // Verifica se a rota atual está na lista de rotas escondidas
  const shouldShow = !hiddenRoutes.includes(location.pathname);
  
  if (!shouldShow) {
    return null;
  }
  
  return (
    <>
      <FloatingCart
        itemCount={cartItemsCount}
        onClick={onCartClick}
      />
      <FloatingAi />
    </>
  );
};

export default FloatingComponentsWrapper;
import React from 'react';
import { useLocation } from 'react-router-dom';
import FloatingCart from './FloatingCart';
import FloatingAi from './FloatingAI';

const FloatingComponentsWrapper = ({ cartItemsCount, onCartClick }) => {
  const location = useLocation();
  
  // Rotas onde os componentes flutuantes NÃO devem aparecer
  const hiddenRoutes = ['/login', '/register'];
  
  // Verifica se a rota atual está na lista de rotas escondidas
  const shouldShow = !hiddenRoutes.includes(location.pathname);
  
  if (!shouldShow) {
    return null;
  }
  
  return (
    <>
      <FloatingCart
        itemCount={cartItemsCount}
        onClick={onCartClick}
      />
      <FloatingAi />
    </>
  );
};

export default FloatingComponentsWrapper;