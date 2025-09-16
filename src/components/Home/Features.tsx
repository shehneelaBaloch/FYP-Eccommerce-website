'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Star, Users, Award, Heart } from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Star,
      title: "Premium Quality",
      desc: "Every product is carefully curated and quality-checked",
      color: "from-yellow-400 to-orange-400"
    },
    {
      icon: Users,
      title: "2M+ Customers",
      desc: "Join our community of satisfied shoppers worldwide",
      color: "from-blue-400 to-cyan-400"
    },
    {
      icon: Award,
      title: "Award Winning",
      desc: "Recognized as the best e-commerce platform 2023",
      color: "from-purple-400 to-pink-400"
    },
    {
      icon: Heart,
      title: "Eco Friendly",
      desc: "Sustainable packaging and ethical sourcing",
      color: "from-green-400 to-emerald-400"
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="relative py-16 overflow-hidden">
      {/* Same background as Hero */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-100" />

      <div className="relative z-10 max-w-7xl mx-auto px-10 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ShopEase
            </span>
            ?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're committed to providing you with the best shopping experience possible
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group text-center p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
                className={`flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${feature.color} rounded-xl group-hover:shadow-md`}
              >
                <feature.icon className="text-white" size={24} />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
