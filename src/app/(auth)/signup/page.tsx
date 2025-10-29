"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useCallback, useMemo } from "react";
import { toast, Toaster } from "react-hot-toast";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Lock, Mail, User, ShoppingBag, Sparkles, CheckCircle } from "lucide-react";

// ✅ Memoized feature items to prevent re-renders
const FEATURE_ITEMS = [
  { icon: CheckCircle, text: "Fast & secure checkout" },
  { icon: User, text: "Personalized recommendations" },
  { icon: Sparkles, text: "Exclusive member discounts" }
] as const;

// ✅ Memoized validation schema
const SignupSchema = Yup.object({
  name: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Memoized toggle password function
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // ✅ Optimized signup handler
  const handleSignup = useCallback(async (values: { name: string; email: string; password: string }, resetForm: () => void) => {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      toast.success("Account created successfully!");
      resetForm();

      // ✅ Automatically sign the user in
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (loginRes?.error) {
        toast.error("Account created, but login failed. Please log in manually.");
      } else {
        toast.success("Logged in successfully!");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Memoized Google sign-in handler
  const handleGoogleSignUp = useCallback(() => {
    signIn("google", { callbackUrl: "/" });
  }, []);

  // ✅ Memoized initial form values
  const initialValues = useMemo(() => ({ name: "", email: "", password: "" }), []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4 mt-8">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Optimized Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-pink-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      {/* Exact same container as login */}
      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 h-[580px]">
        {/* Left Section - Welcome & Graphics */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 lg:p-10 text-white relative overflow-hidden"
        >
          {/* Optimized Animated Icons */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ 
                rotate: 360,
              }}
              transition={{ 
                rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              }}
              className="absolute -top-16 -right-16 w-32 h-32 bg-white/10 rounded-full"
            />
          </div>

          <div className="relative z-10 h-full flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center lg:text-left"
            >
              {/* Logo/Icon */}
              <motion.div
                animate={{ 
                  scale: [1, 1.02, 1],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 backdrop-blur-sm"
              >
                <ShoppingBag size={28} className="text-white" />
              </motion.div>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                Join StyleHub
              </h1>
              
              <p className="text-purple-100 mb-6 max-w-sm mx-auto lg:mx-0 text-sm lg:text-base">
                Create your account and unlock exclusive fashion benefits.
              </p>

              {/* Features List - Compact spacing */}
              <div className="space-y-2">
                {FEATURE_ITEMS.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <motion.div
                      key={item.text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-3 text-purple-100 text-sm"
                    >
                      <IconComponent size={16} className="text-yellow-300 flex-shrink-0" />
                      <span className="text-xs">{item.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Section - Signup Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="p-8 lg:p-10 flex items-center justify-center"
        >
          <div className="w-full max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-4"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Create Account
              </h2>
              <p className="text-gray-600 text-sm">
                Join the StyleHub community
              </p>
            </motion.div>

            <Formik
              initialValues={initialValues}
              validationSchema={SignupSchema}
              onSubmit={async (values, { resetForm }) => {
                await handleSignup(values, resetForm);
              }}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-3">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <Field
                        type="text"
                        name="name"
                        className={`w-full px-3 py-2.5 pl-10 rounded-xl border-2 focus:ring-2 focus:outline-none transition-all duration-200 text-sm ${
                          errors.name && touched.name
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-purple-500 focus:ring-purple-200"
                        }`}
                        placeholder="Enter your full name"
                      />
                      <User 
                        size={16} 
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                          errors.name && touched.name ? "text-red-400" : "text-gray-400"
                        }`} 
                      />
                    </div>
                    <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1 flex items-center gap-1" />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Field
                        type="email"
                        name="email"
                        className={`w-full px-3 py-2.5 pl-10 rounded-xl border-2 focus:ring-2 focus:outline-none transition-all duration-200 text-sm ${
                          errors.email && touched.email
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-purple-500 focus:ring-purple-200"
                        }`}
                        placeholder="you@example.com"
                      />
                      <Mail 
                        size={16} 
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                          errors.email && touched.email ? "text-red-400" : "text-gray-400"
                        }`} 
                      />
                    </div>
                    <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1 flex items-center gap-1" />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className={`w-full px-3 py-2.5 pl-10 pr-10 rounded-xl border-2 focus:ring-2 focus:outline-none transition-all duration-200 text-sm ${
                          errors.password && touched.password
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-purple-500 focus:ring-purple-200"
                        }`}
                        placeholder="Create a password"
                      />
                      <Lock 
                        size={16} 
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                          errors.password && touched.password ? "text-red-400" : "text-gray-400"
                        }`} 
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1 flex items-center gap-1" />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group text-sm mt-2"
                  >
                    {/* Animated Loader */}
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </motion.div>
                    )}
                    
                    <span className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                      {loading ? "Creating Account..." : "Create Account"}
                    </span>
                    
                    {/* Button Shine Effect */}
                    <div className="absolute inset-0 -inset-x-32 -inset-y-8 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-64 transition-all duration-1000 ease-out" />
                  </motion.button>
                </Form>
              )}
            </Formik>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-gray-400 text-xs">or continue with</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            {/* Google Sign Up */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignUp}
              className="w-full py-3 rounded-xl border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </motion.button>

            {/* Sign In Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-4 pt-4 border-t border-gray-100"
            >
              <p className="text-gray-600 text-xs">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="text-purple-600 font-semibold hover:text-purple-700 transition-colors hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}