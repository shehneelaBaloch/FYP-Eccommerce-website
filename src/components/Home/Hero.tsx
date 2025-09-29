'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Shield, Truck, RotateCcw, Star, Clock, Tag, Zap } from 'lucide-react';

// Mock data - in real app this would come from your CMS/API
const heroSlides = [
  {
    id: 1,
    title: "Summer Collection 2024",
    subtitle: "Up to 60% OFF",
    description: "Fresh styles for the sunny days ahead. Limited time offer!",
    image: "/summer-collection.jpg",
    cta: "Shop Now",
    cta2: "View Lookbook",
    badge: "HOT DEAL",
    bgGradient: "from-cyan-50 via-blue-50 to-emerald-100",
    textColor: "text-blue-900",
    buttonStyle: "bg-blue-600 hover:bg-blue-700"
  },
  {
    id: 2,
    title: "New Arrivals",
    subtitle: "Just Dropped",
    description: "Be the first to rock the latest trends. Exclusive early access!",
    image: "/new-arrivals.jpg",
    cta: "Explore New",
    cta2: "Get Notified",
    badge: "NEW",
    bgGradient: "from-pink-50 via-rose-50 to-red-100",
    textColor: "text-rose-900",
    buttonStyle: "bg-rose-600 hover:bg-rose-700"
  },
  {
    id: 3,
    title: "Flash Sale",
    subtitle: "24 Hours Only",
    description: "Don't miss out! Massive discounts on premium brands.",
    image: "/flash-sale.jpg",
    cta: "Shop Sale",
    cta2: "See Deals",
    badge: "FLASH",
    bgGradient: "from-amber-50 via-orange-50 to-red-100",
    textColor: "text-orange-900",
    buttonStyle: "bg-orange-600 hover:bg-orange-700"
  }
];

const trendingProducts = [
  { id: 1, name: "Urban Jacket", price: "$89.99", image: "/trending-1.jpg", rating: 4.8 },
  { id: 2, name: "Classic Sneakers", price: "$129.99", image: "/trending-2.jpg", rating: 4.9 },
  { id: 3, name: "Designer Dress", price: "$149.99", image: "/trending-3.jpg", rating: 4.7 },
  { id: 4, name: "Smart Watch", price: "$199.99", image: "/trending-4.jpg", rating: 4.6 }
];

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds

  useEffect(() => {
    setIsMounted(true);
    
    // Auto-rotate slides
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    // Countdown timer for flash sale
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const currentSlideData = heroSlides[currentSlide];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background with dynamic gradient based on current slide */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.bgGradient}`} />
      
      {/* Animated Background Elements */}
      {isMounted && (
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/10"
              style={{
                width: Math.random() * 100 + 50,
                height: Math.random() * 100 + 50,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                rotate: [0, 180],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Main Hero Carousel */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
                >
                  <Zap className="text-yellow-500" size={16} />
                  <span className="font-semibold text-gray-900">{currentSlideData.badge}</span>
                </motion.div>

                {/* Main Heading */}
                <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-tight ${currentSlideData.textColor}`}>
                  {currentSlideData.title}
                  <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {currentSlideData.subtitle}
                  </span>
                </h1>

                {/* Description */}
                <p className="text-xl text-gray-700 leading-relaxed">
                  {currentSlideData.description}
                </p>

                {/* Flash Sale Countdown */}
                {currentSlideData.badge === "FLASH" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Clock className="text-red-500" size={24} />
                      <span className="font-bold text-gray-900">Sale Ends In:</span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-red-600">
                      {formatTime(timeLeft)}
                    </div>
                  </motion.div>
                )}

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`group flex items-center justify-center space-x-3 ${currentSlideData.buttonStyle} text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300`}
                  >
                    <span>{currentSlideData.cta}</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group flex items-center justify-center space-x-3 bg-white/90 backdrop-blur-sm text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-full text-lg font-semibold hover:border-purple-300 hover:shadow-lg transition-all duration-300"
                  >
                    <Play className="text-purple-600" size={20} />
                    <span>{currentSlideData.cta2}</span>
                  </motion.button>
                </motion.div>

                {/* Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center space-x-6 text-sm text-gray-600"
                >
                  <div className="flex items-center space-x-1">
                    <Star className="text-yellow-400" size={16} />
                    <span>4.9/5 (2K+ Reviews)</span>
                  </div>
                  <div>•</div>
                  <div>1000+ Happy Customers</div>
                  <div>•</div>
                  <div>Free Returns</div>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={prevSlide}
                className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              >
                <ArrowRight className="rotate-180" size={20} />
              </button>
              
              {/* Slide Indicators */}
              <div className="flex space-x-2">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-purple-600 w-8' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

        
          </div>

             
      
        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16"
        >
          {[
            { icon: Truck, title: "Free Shipping", desc: "On orders over $50", highlight: "WORLDWIDE" },
            { icon: Shield, title: "Secure Payment", desc: "256-bit encryption", highlight: "SAFE" },
            { icon: RotateCcw, title: "Easy Returns", desc: "30-day policy", highlight: "HASSLE-FREE" },
            { icon: Tag, title: "Best Prices", desc: "Price match guarantee", highlight: "GUARANTEED" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
                  <feature.icon className="text-purple-600" size={24} />
                </div>
                <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {feature.highlight}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;