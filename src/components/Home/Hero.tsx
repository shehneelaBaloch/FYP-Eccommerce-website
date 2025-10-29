'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Star,
  ShoppingBag,
  Zap,
  TrendingUp,
  Tag,
  Truck,
  Sparkles,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------
interface FloatingElement {
  color: string;
  position: string;
  size: string;
}

interface TransparentImageProps {
  imageUrl: string;
  borderGradient: string;
  objectPosition: string;
  floatingElements: FloatingElement[];
}

// -----------------------------------------------------------------------------
// Slides
// -----------------------------------------------------------------------------
const heroSlides = [
  {
    id: 1,
    title: 'Summer Collection',
    subtitle: 'Up to 60% OFF',
    description: 'Fresh styles for the sunny days ahead. Limited time offer!',
    cta: 'Shop Now',
    badge: 'HOT DEAL',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-100',
    animation: 'summer',
    image: '/shopping.jpg',
    objectPosition: 'center 30%',
    borderGradient: 'from-blue-400 via-cyan-400 to-emerald-400',
    floatingElements: [
      {
        color: 'from-yellow-400 to-amber-400',
        position: 'top-4 left-8',
        size: 'w-6 h-6',
      },
      {
        color: 'from-blue-400 to-cyan-400',
        position: 'bottom-8 right-6',
        size: 'w-5 h-5',
      },
    ],
  },
  {
    id: 2,
    title: 'New Arrivals',
    subtitle: 'Just Dropped',
    description: 'Be the first to rock the latest trends',
    cta: 'Shop New',
    badge: 'NEW',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-100',
    animation: 'new',
    image: '/shopping1.jpg',
    objectPosition: 'center 25%',
    borderGradient: 'from-purple-400 via-pink-400 to-rose-400',
    floatingElements: [
      {
        color: 'from-green-400 to-emerald-400',
        position: 'top-6 right-8',
        size: 'w-7 h-7',
      },
      {
        color: 'from-pink-400 to-rose-400',
        position: 'bottom-6 left-8',
        size: 'w-4 h-4',
      },
    ],
  },
  {
    id: 3,
    title: 'Flash Sale',
    subtitle: '24 Hours Only',
    description: 'Massive discounts on premium brands',
    cta: 'Shop Sale',
    badge: 'SALE',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100',
    animation: 'flash',
    image: '/shopping3.jpg',
    objectPosition: 'center 35%',
    borderGradient: 'from-orange-400 via-red-400 to-amber-400',
    floatingElements: [
      {
        color: 'from-red-400 to-orange-400',
        position: 'top-8 right-12',
        size: 'w-6 h-6',
      },
      {
        color: 'from-amber-400 to-yellow-400',
        position: 'bottom-4 left-12',
        size: 'w-5 h-5',
      },
    ],
  },
];

// -----------------------------------------------------------------------------
// SVG Animations
// -----------------------------------------------------------------------------
const SummerAnimation = () => (
  <motion.div
    className="relative w-28 h-28 flex items-center justify-center"
    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
  >
    <div className="relative">
      <motion.div
        className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full shadow-lg"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(
        (rotation: number, index: number) => (
          <motion.div
            key={index}
            className="absolute w-4 h-4 bg-yellow-300 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${rotation}deg) translateX(30px)`,
            }}
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.1,
            }}
          />
        )
      )}
    </div>
  </motion.div>
);

const NewArrivalsAnimation = () => (
  <motion.div
    className="relative w-28 h-28 flex items-center justify-center"
    animate={{ y: [0, -10, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  >
    <div className="relative">
      <div className="w-20 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg shadow-lg">
        <div className="absolute -top-2 left-4 w-12 h-4 bg-purple-300 rounded-t-full" />
        <motion.div
          className="absolute -top-1 -right-1"
          animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="text-yellow-400" size={16} />
        </motion.div>
      </div>
    </div>
  </motion.div>
);

const FlashSaleAnimation = () => (
  <motion.div
    className="relative w-28 h-28 flex items-center justify-center"
    animate={{ scale: [1, 1.1, 1] }}
    transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
  >
    <div className="relative">
      <motion.div
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Zap className="text-yellow-500" size={48} fill="currentColor" />
      </motion.div>
      {[1, 2, 3].map((spark: number) => (
        <motion.div
          key={spark}
          className="absolute w-2 h-2 bg-blue-400 rounded-full"
          style={{ left: `${spark * 8}px`, top: `${spark * 6}px` }}
          animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: spark * 0.2,
          }}
        />
      ))}
    </div>
  </motion.div>
);

const DiscountAnimation = () => (
  <motion.div
    className="relative w-20 h-20 flex items-center justify-center"
    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  >
    <div className="relative">
      <Tag className="text-green-500" size={40} fill="currentColor" />
      <motion.span
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      >
        %
      </motion.span>
    </div>
  </motion.div>
);

const ShippingAnimation = () => (
  <motion.div
    className="relative w-16 h-16 flex items-center justify-center"
    animate={{ x: [0, 10, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
  >
    <div className="relative">
      <Truck className="text-blue-500" size={32} />
      <motion.div
        className="absolute -right-2 top-1/2 w-4 h-0.5 bg-blue-300 rounded-full"
        animate={{ scaleX: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  </motion.div>
);

// -----------------------------------------------------------------------------
// Transparent Image With Border (typed)
// -----------------------------------------------------------------------------
const TransparentImageWithBorder: React.FC<TransparentImageProps> = ({
  imageUrl,
  borderGradient,
  objectPosition,
  floatingElements,
}) => (
  <div className="relative">
    <div className="relative">
      <div
        className={`absolute -inset-6 bg-gradient-to-r ${borderGradient} rounded-full opacity-60 blur-xl animate-pulse-glow`}
      />
      <div
        className={`relative bg-gradient-to-r ${borderGradient} p-1 rounded-3xl shadow-2xl`}
      >
        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6">
          <motion.div
            className="relative w-72 h-80 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <motion.img
              src={imageUrl}
              alt="Fashion Product"
              className="w-full h-full object-contain drop-shadow-2xl"
              style={{ objectPosition }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7 }}
            />
            {floatingElements.map(
              (element: FloatingElement, index: number) => (
                <motion.div
                  key={index}
                  className={`absolute ${element.position} ${element.size} bg-gradient-to-r ${element.color} rounded-full shadow-lg`}
                  animate={{
                    y: [0, -15, 0],
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 3 + index,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.5,
                  }}
                />
              )
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transform translate-x-[-100%] animate-shine" />
          </motion.div>
        </div>
      </div>
    </div>
  </div>
);

// -----------------------------------------------------------------------------
// Hero Component
// -----------------------------------------------------------------------------
const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % heroSlides.length),
      5000
    );
    return () => clearInterval(interval);
  }, []);

  const currentSlideData = heroSlides[currentSlide];

  const getMainAnimation = () => {
    switch (currentSlideData.animation) {
      case 'summer':
        return <SummerAnimation />;
      case 'new':
        return <NewArrivalsAnimation />;
      case 'flash':
        return <FlashSaleAnimation />;
      default:
        return <SummerAnimation />;
    }
  };

  return (
    <section
      className={`relative min-h-[80vh] flex items-center transition-colors duration-500 ${currentSlideData.bgColor} overflow-hidden mt-16`}
    >
      {/* Background blobs */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-200/20 rounded-full blur-3xl animate-float-medium" />
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-amber-200/20 rounded-full blur-2xl animate-pulse-slow" />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT SIDE */}
          <div className="space-y-6 py-8 z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Badge */}
                <motion.div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/50">
                  {currentSlideData.animation === 'flash' && (
                    <Zap className="text-orange-500" size={16} />
                  )}
                  {currentSlideData.animation === 'new' && (
                    <TrendingUp className="text-green-500" size={16} />
                  )}
                  {currentSlideData.animation === 'summer' && (
                    <ShoppingBag className="text-blue-500" size={16} />
                  )}
                  <span className="text-sm font-semibold text-gray-900">
                    {currentSlideData.badge}
                  </span>
                </motion.div>

                {/* Title */}
                <motion.h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                  {currentSlideData.title}
                  <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-3">
                    {currentSlideData.subtitle}
                  </span>
                </motion.h1>

                {/* Description */}
                <motion.p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                  {currentSlideData.description}
                </motion.p>

                {/* ✅ CTA with redirect */}
                <motion.div>
                  <button
                    onClick={() => router.push('/deals')}
                    className="group relative flex items-center space-x-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white px-10 py-5 rounded-2xl hover:from-gray-800 hover:to-gray-600 transition-all duration-300 font-semibold text-lg shadow-2xl hover:shadow-3xl overflow-hidden"
                  >
                    <span className="relative z-10">
                      {currentSlideData.cta}
                    </span>
                    <ArrowRight
                      className="group-hover:translate-x-2 transition-transform duration-300 relative z-10"
                      size={24}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </motion.div>

                {/* Rating */}
                <motion.div className="flex items-center space-x-6 text-base text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="text-yellow-400"
                          size={20}
                          fill="currentColor"
                        />
                      ))}
                    </div>
                    <span className="font-semibold">
                      4.9/5 (2K+ Reviews)
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT SIDE */}
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -30 }}
                transition={{ duration: 0.8, type: 'spring' }}
                className="relative flex justify-center items-center"
              >
                <TransparentImageWithBorder
                  imageUrl={currentSlideData.image}
                  borderGradient={currentSlideData.borderGradient}
                  objectPosition={currentSlideData.objectPosition}
                  floatingElements={currentSlideData.floatingElements}
                />
                <motion.div className="absolute -top-4 -right-4">
                  {getMainAnimation()}
                </motion.div>
                <motion.div className="absolute -bottom-4 -left-4">
                  <DiscountAnimation />
                </motion.div>
                <motion.div className="absolute top-8 -left-6">
                  <ShippingAnimation />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide dots */}
        <div className="flex justify-center space-x-3 mt-16">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                index === currentSlide
                  ? 'bg-gray-900 w-10 shadow-lg'
                  : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Keyframe animations */}
      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(90deg); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-shine { animation: shine 4s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default Hero;
