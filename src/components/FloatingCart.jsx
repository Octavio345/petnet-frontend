import React from 'react';
import '../styles/Cart.css';

const FloatingCart = ({ itemCount, onClick }) => {
  return (
    <div id="btn-compra" onClick={onClick}>
      <img src="/imagens/sacola.png" alt="Carrinho de compras" />
      {itemCount > 0 && <span id="contador-carrinho">{itemCount}</span>}
    </div>
  );
};

export default FloatingCart;