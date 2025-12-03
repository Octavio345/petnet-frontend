import React, { useState, useEffect, useCallback } from "react";
import { Carousel } from "react-bootstrap";
import "../styles/HeroCarrosel.css";

const HeroCarousel = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkMobile = useCallback(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    checkMobile();
    
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, [checkMobile]);

  const images = {
    mobile: {
      1: "/imagens/Montagem_cell_1.png",
      2: "/imagens/Montagem_cell_3.png",
      3: "/imagens/Montagem_Cell_2.png",
      Racao: "/imagens/Montagem_Racao.png",
    },
    desktop: {
      1: "/imagens/Montagem_cell_1.png",
      2: "/imagens/Montagem_cell_3.png",
      3: "/imagens/Montagem_Cell_2.png",
      Racao: "/imagens/Montagem_Racao.png",
    },
  };

  const carouselItems = [
    { id: 1, alt: "Cuidados profissionais para seu pet" },
    { id: 2, alt: "Produtos de qualidade para animais" },
    { id: 3, alt: "Atendimento veterinário especializado" },
    { id: "Racao", alt: "Rações premium" },
  ];

  const handleSelect = (selectedIndex) => {
    setActiveIndex(selectedIndex);
  };

  const handleImageError = (e) => {
    console.error(`Erro ao carregar imagem: ${e.target.src}`);
    e.target.style.backgroundColor = "#f0f0f0";
    e.target.alt = "Imagem não disponível";
  };

  return (
    <>
      <br />
      <br />
      <br />
      
      <section className="hero-carousel">
        <Carousel
          interval={4000}
          controls
          indicators={false}
          className="carousel-modern"
          fade
          activeIndex={activeIndex}
          onSelect={handleSelect}
          pause="hover"
          touch
        >
          {carouselItems.map((item, index) => {
            const src = isMobile ? images.mobile[item.id] : images.desktop[item.id];
            
            return (
              <Carousel.Item key={item.id}>
                <div className="carousel-image-container">
                  <img
                    className="d-block w-100"
                    src={src}
                    alt={item.alt}
                    loading={index < 2 ? "eager" : "lazy"}
                    onError={handleImageError}
                  />
                </div>
              </Carousel.Item>
            );
          })}
        </Carousel>
      </section>
    </>
  );
};

export default HeroCarousel;