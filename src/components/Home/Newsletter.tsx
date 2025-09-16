'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Send } from 'lucide-react';

const Newsletter: React.FC = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background elements that match the Hero section */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-pink-200/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-purple-300/20 rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-xl border border-white/20"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex justify-center mb-6"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Mail className="text-white" size={32} />
            </div>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Never Miss a Deal
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our newsletter and be the first to know about exclusive offers, new arrivals, and special promotions
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="px-6 py-4 rounded-full text-gray-900 border-2 border-purple-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all duration-300 w-full sm:max-w-md placeholder-gray-400"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl transition-all duration-300 whitespace-nowrap flex items-center gap-2"
            >
              <span>Subscribe</span>
              <Send className="group-hover:translate-x-1 transition-transform" size={18} />
            </motion.button>
          </motion.div>

          <p className="text-sm text-gray-500 mt-6">
            🔒 We respect your privacy and never share your data
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;