'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Shield, Truck, RotateCcw } from 'lucide-react';

// Predefined positions to avoid random values during SSR
const predefinedPositions = [
  { left: 10, top: 20, size: 60 },
  { left: 80, top: 10, size: 80 },
  { left: 30, top: 70, size: 70 },
  { left: 90, top: 50, size: 50 },
  { left: 15, top: 40, size: 90 },
  { left: 70, top: 80, size: 65 },
  { left: 40, top: 15, size: 75 },
  { left: 85, top: 25, size: 55 },
  { left: 25, top: 85, size: 85 },
  { left: 60, top: 35, size: 45 },
  { left: 5, top: 60, size: 70 },
  { left: 75, top: 5, size: 80 },
  { left: 45, top: 90, size: 60 },
  { left: 95, top: 75, size: 75 },
  { left: 20, top: 30, size: 85 },
  { left: 65, top: 65, size: 55 },
  { left: 35, top: 45, size: 65 },
  { left: 85, top: 85, size: 45 },
  { left: 10, top: 5, size: 75 },
  { left: 50, top: 55, size: 85 }
];

const Hero: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-100" />
      
      {/* Animated Background Elements - Only render on client */}
      {isMounted && (
        <div className="absolute inset-0">
          {predefinedPositions.map((pos, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-r from-purple-200 to-pink-200 opacity-20"
              style={{
                width: pos.size,
                height: pos.size,
                left: `${pos.left}%`,
                top: `${pos.top}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 leading-tight"
          >
            Fashion That{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Speaks
            </span>{' '}
            Your Style
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
          >
            Discover the latest trends and exclusive collections. Quality meets affordability in every piece.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transition-all duration-300"
            >
              <span>Shop Collection</span>
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group flex items-center space-x-3 bg-white text-gray-900 border-2 border-gray-200 px-8 py-4 rounded-full text-lg font-semibold hover:border-purple-300 hover:shadow-lg transition-all duration-300"
            >
              <Play className="text-purple-600" size={20} />
              <span>Watch Story</span>
            </motion.button>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 mb-20"
          >
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over $50" },
              { icon: Shield, title: "Secure Payment", desc: "256-bit encryption" },
              { icon: RotateCcw, title: "Easy Returns", desc: "30-day policy" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl mb-4">
                  <feature.icon className="text-purple-600" size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Products Preview - Only render on client */}
      {isMounted && (
        <motion.div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="flex space-x-4">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-20 h-20 bg-white rounded-2xl shadow-2xl border-2 border-purple-200"
              />
            ))}
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default Hero;