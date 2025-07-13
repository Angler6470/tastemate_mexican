import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/hooks/useI18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Promo } from "@shared/schema";

export function PromoCarousel() {
  const { language } = useI18n();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { data: promos = [], isLoading } = useQuery<Promo[]>({
    queryKey: ["/api/promos"],
  });

  // Auto-advance carousel
  useEffect(() => {
    if (promos.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [promos.length]);

  if (isLoading || promos.length === 0) {
    return (
      <div className="carousel-container mb-8 h-64 bg-gradient-to-r from-primary to-primary-dark rounded-2xl animate-pulse">
        <div className="h-full flex items-center justify-center text-white">
          <div className="text-center">
            <div className="w-48 h-8 bg-white/20 rounded mb-2"></div>
            <div className="w-64 h-6 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="carousel-container mb-8 h-64 bg-gradient-to-r from-primary to-primary-dark rounded-2xl overflow-hidden relative">
      <div 
        className="carousel-wrapper flex transition-transform duration-500 h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {promos.map((promo, index) => (
          <div
            key={promo.id}
            className="carousel-slide flex items-center justify-center text-white relative min-w-full"
          >
            <img
              src={promo.imageUrl}
              alt={promo.title[language]}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative z-10 text-center px-4">
              <h2 className="text-3xl font-bold mb-2">
                {promo.title[language]}
              </h2>
              <p className="text-lg">
                {promo.description[language]}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Carousel Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {promos.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className={`w-3 h-3 rounded-full p-0 ${
              index === currentSlide
                ? "bg-white"
                : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </div>
  );
}
