import React from 'react';
import HeroCarousel from '../../components/HeroCarousel';
import SloganSection from '../../components/SloganSection';
import ServicesSection from '../../components/ServicesSection';
import ProductsSection from '../../components/ProductsSection';
import BookingSection from '../../components/BookingSection';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import FloatingCart from '../../components/FloatingCart';
import FloatingAi from '../../components/FloatingAi'; 
import SloganWithCarousel from '../../components/SloganWithCarousel';

const Home = ({ 
  onAddToCart, 
  darkMode, 
  toggleDarkMode, 
  cartItems, 
  onUpdateItem, 
  onRemoveItem, 
  onLimparCarrinho,
  onCartClick,
  cartItemsCount,
  user,
  onLogout
}) => {
  return (
    <>
      <Header 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        cartItemsCount={cartItemsCount}
        onCartClick={onCartClick}
        user={user}
        onLogout={onLogout}
      />
      <main>
        <SloganWithCarousel />
        <ServicesSection />
        <ProductsSection 
          onAddToCart={onAddToCart}
          cartItems={cartItems} 
        />
        <BookingSection user={user} />
      </main>
      <Footer />
      
      <FloatingCart 
        itemCount={cartItemsCount}
        onClick={onCartClick}
      />
      <FloatingAi /> 
    </>
  );
};

export default Home;