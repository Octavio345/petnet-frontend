import React, { useState } from "react";
import { Link } from "react-router-dom";
import BreedForm from "../../components/breedForm";
import FoodForm from "../../components/foodForm";
import "../../styles/Curiosidades.css";
import FloatingCart from '../../components/FloatingCart';
import FloatingAI from '../../components/FloatingAI';
import CartModal from '../../components/CartModal';

export default function Curiosidades({ 
  darkMode, 
  toggleDarkMode, 
  cartItemsCount, 
  onCartClick,
  onAddToCart 
}) {
  const [cartItems, setCartItems] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);

  React.useEffect(() => {
    const savedCart = localStorage.getItem('carrinho');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const updateCartItem = (productName, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productName);
      return;
    }

    const updatedCart = cartItems.map(item =>
      item.nome === productName
        ? { ...item, quantidade: newQuantity }
        : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('carrinho', JSON.stringify(updatedCart));
  };

  const removeFromCart = (productName) => {
    const updatedCart = cartItems.filter(item => item.nome !== productName);
    setCartItems(updatedCart);
    localStorage.setItem('carrinho', JSON.stringify(updatedCart));
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantidade, 0);
  };

  return (
    <>
      <main className="container curiosidades-wrapper">
        <BreedForm />
        
        <FoodForm />
        
        <FloatingCart 
          itemCount={cartItemsCount || getTotalItems()}
          onClick={() => setShowCartModal(true)}
        />
        <FloatingAI />
        
        <CartModal
          show={showCartModal}
          onHide={() => setShowCartModal(false)}
          cartItems={cartItems}
          onUpdateItem={updateCartItem}
          onRemoveItem={removeFromCart}
        />
      </main>
    </>
  );
}