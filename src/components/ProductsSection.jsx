import React, { useState, useEffect } from 'react';
import '../styles/ProductsSection.css';

const ProductCard = ({ product, quantity, onUpdateQuantity, onAddToCart }) => {
  return (
    <div className="produto-card">
      <img src={product.imagem} alt={product.nome} />
      <div className="info-produto">
        <p className="nome-produto">{product.nome}</p>
        <p className="preco-produto">R$ {product.preco?.toFixed(2) || '0.00'}</p>
        
        <div className="quantidade-container">
          <button 
            className="btn-quantidade menos" 
            onClick={() => onUpdateQuantity(product.id, quantity - 1)}
            disabled={quantity === 0}
          >
            -
          </button>
          <span className="quantidade">{quantity}</span>
          <button 
            className="btn-quantidade mais" 
            onClick={() => onUpdateQuantity(product.id, quantity + 1)}
          >
            +
          </button>
        </div>
        
        <button 
          className={`btn-adicionar-carrinho ${quantity === 0 ? 'disabled' : ''}`}
          onClick={() => onAddToCart(product, quantity)}
          disabled={quantity === 0}
        >
          {quantity === 0 ? 'Selecione a quantidade' : `Adicionar (${quantity})`}
        </button>
      </div>
    </div>
  );
};

const ProductsSection = ({ onAddToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState('racoes');
  const [quantities, setQuantities] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const productsData = {
    racoes: [
      { 
        id: 1,
        nome: "Foster 2kg", 
        preco: 49.90, 
        imagem: "/imagens/Racoes/racao_foster.png"
      },
      { 
        id: 2,
        nome: "Magnus 2kg", 
        preco: 45.90, 
        imagem: "/imagens/Racoes/racao_magnus.png"
      },
      { 
        id: 3,
        nome: "Special Cat 1kg", 
        preco: 21.90, 
        imagem: "/imagens/Racoes/racao_special_cat.png"
      }
    ],
    acessorios: [
      { 
        id: 4,
        nome: "Coleira guia", 
        preco: 49.99, 
        imagem: "/imagens/Acessorios/Coleira_guia.png"
      },
      { 
        id: 5,
        nome: "Bebedouro", 
        preco: 9.90, 
        imagem: "/imagens/Acessorios/bebedouro.png"
      },
      { 
        id: 6,
        nome: "Caminha azul", 
        preco: 89.90, 
        imagem: "/imagens/Acessorios/Caminha_3.png"
      }
    ],
    medicamentos: [
      { 
        id: 7,
        nome: "Antipulgas", 
        preco: 249.99, 
        imagem: "/imagens/Medicamentos/antipulgas e carrapatos.png"
      },
      { 
        id: 8,
        nome: "Simparic", 
        preco: 79.99, 
        imagem: "/imagens/Medicamentos/remedio.png"
      },
      { 
        id: 9,
        nome: "Petzi gato", 
        preco: 39.99, 
        imagem: "/imagens/Medicamentos/remedio_gato.png"
      }
    ]
  };

  const categories = [
    { id: 'racoes', label: 'Rações' },
    { id: 'acessorios', label: 'Acessórios' },
    { id: 'medicamentos', label: 'Medicamentos' }
  ];

  useEffect(() => {
    const initialQuantities = {};
    Object.values(productsData).forEach(category => {
      category.forEach(product => {
        initialQuantities[product.id] = 0;
      });
    });
    setQuantities(initialQuantities);
  }, []);

  const updateQuantity = (productId, newQuantity) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, newQuantity)
    }));
  };

  const showFeedbackMessage = (message) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    
    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  };

  const handleAddToCart = (product, quantity) => {
    if (quantity <= 0) {
      showFeedbackMessage('Selecione uma quantidade maior que zero!');
      return;
    }

    if (!onAddToCart) {
      showFeedbackMessage('Erro: função de carrinho não disponível');
      return;
    }

    try {
      const productWithQuantity = {
        ...product,
        quantidade: quantity,
        frete: 9.90
      };
      
      onAddToCart(productWithQuantity);
      
      updateQuantity(product.id, 0);
      
      showFeedbackMessage(`✅ ${quantity}x ${product.nome} adicionado ao carrinho!`);
      
    } catch (error) {
      showFeedbackMessage('Erro ao adicionar produto ao carrinho');
    }
  };

  const currentProducts = productsData[selectedCategory] || [];

  return (
    <section id="link_produtos" className="products-section">
      {showFeedback && (
        <div className="feedback-message">
          <div className="feedback-content">
            <span className="feedback-icon">✅</span>
            <span className="feedback-text">{feedbackMessage}</span>
          </div>
        </div>
      )}
      
      <div className="titulos">PRODUTOS</div>
      <div className="subtitulos">Conheça os tipos de produtos</div>
     
      <div className="categorias-container">
        {categories.map(category => (
          <div key={category.id}>
            <input 
              type="radio" 
              name="tipo" 
              id={category.id}
              className="input-tipo"
              checked={selectedCategory === category.id}
              onChange={() => {
                setSelectedCategory(category.id);
              }}
              hidden
            />
            <label htmlFor={category.id} className="categoria-btn">
              {category.label}
            </label>
          </div>
        ))}
      </div>

      <div className="produtos-grid">
        {currentProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            quantity={quantities[product.id] || 0}
            onUpdateQuantity={updateQuantity}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductsSection;