import React from "react";
import SloganSection from "./SloganSection";
import HeroCarousel from "./HeroCarousel";
import "../styles/SloganWithCarousel.css";

const SloganWithCarousel = () => {
  return (
    <div className="slogan-carousel-container">
      <div className="slogan-carousel-wrapper">

        <div className="slogan-side">
          <SloganSection />
        </div>

        <div className="carousel-side">
          <HeroCarousel />
        </div>

      </div>
    </div>
  );
};

export default SloganWithCarousel;
