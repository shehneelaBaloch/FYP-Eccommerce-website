"use client";

import { signIn } from "next-auth/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useCallback, useMemo } from "react";
import { Eye, EyeOff, Lock, Mail, User, ShoppingBag, Sparkles } from "lucide-react";

// ✅ Memoized feature items to prevent re-renders
const FEATURE_ITEMS = [
  { icon: Sparkles, text: "Exclusive member discounts" },
  { icon: User, text: "Personalized style recommendations" },
  { icon: ShoppingBag, text: "Fast & secure checkout" }
] as const;

// ✅ Memoized validation schema
const LoginSchema = Yup.object({
  email: Yup.string().email("Invalid email format").required("Email is required"),
  password: Yup.string().min(6, "Minimum 6 characters required").required("Password is required"),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // ✅ Memoized toggle password function
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // ✅ Optimized sign-in handler
  const handleSignIn = useCallback(async (values: { email: string; password: string }, setSubmitting: (isSubmitting: boolean) => void) => {
    setAuthError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (res?.error) {
        if (res.error.toLowerCase().includes("credentials")) {
          setAuthError("Invalid email or password. Please try again.");
        } else {
          setAuthError("Something went wrong. Please try again later.");
        }
      } else {
        window.location.href = "/";
      }
    } catch (err: any) {
      setAuthError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }, []);

  // ✅ Memoized Google sign-in handler
  const handleGoogleSignIn = useCallback(() => {
    signIn("google", { callbackUrl: "/" });
  }, []);

  // ✅ Memoized initial form values
  const initialValues = useMemo(() => ({ email: "", password: "" }), []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-4 mt-8">
      {/* Animated Background Elements - Optimized */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-pink-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-4xl w-full rounded-3xl shadow-2xl overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20">
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
                Welcome Back
              </h1>
              
              <p className="text-purple-100 mb-6 max-w-sm mx-auto lg:mx-0 text-sm lg:text-base">
                Sign in to your account and discover the latest fashion trends.
              </p>

              {/* Features List */}
              <div className="space-y-3">
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
                      <IconComponent size={18} className="text-yellow-300 flex-shrink-0" />
                      <span>{item.text}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Section - Login Form */}
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
              className="text-center mb-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Sign In
              </h2>
              <p className="text-gray-600 text-sm">
                Access your StyleHub account
              </p>
            </motion.div>

            <Formik
              initialValues={initialValues}
              validationSchema={LoginSchema}
              onSubmit={async (values, { setSubmitting }) => {
                await handleSignIn(values, setSubmitting);
              }}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Field
                        type="email"
                        name="email"
                        className={`w-full px-4 py-3 pl-11 rounded-xl border-2 focus:ring-2 focus:outline-none transition-all duration-200 text-sm ${
                          errors.email && touched.email
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-purple-500 focus:ring-purple-200"
                        }`}
                        placeholder="Enter your email"
                      />
                      <Mail 
                        size={18} 
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                          errors.email && touched.email ? "text-red-400" : "text-gray-400"
                        }`} 
                      />
                    </div>
                    <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1 flex items-center gap-1" />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className={`w-full px-4 py-3 pl-11 pr-11 rounded-xl border-2 focus:ring-2 focus:outline-none transition-all duration-200 text-sm ${
                          errors.password && touched.password
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-purple-500 focus:ring-purple-200"
                        }`}
                        placeholder="Enter your password"
                      />
                      <Lock 
                        size={18} 
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                          errors.password && touched.password ? "text-red-400" : "text-gray-400"
                        }`} 
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1 flex items-center gap-1" />
                  </div>

                  {/* Forgot Password */}
                  <div className="text-right">
                    <Link href="/forgot-password" className="text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors">
                      Forgot your password?
                    </Link>
                  </div>

                  {/* Auth Error */}
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0"></div>
                      {authError}
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group text-sm"
                  >
                    {/* Animated Loader */}
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </motion.div>
                    )}
                    
                    <span className={`transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                      Sign In
                    </span>
                    
                    {/* Button Shine Effect */}
                    <div className="absolute inset-0 -inset-x-32 -inset-y-8 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 group-hover:translate-x-64 transition-all duration-1000 ease-out" />
                  </motion.button>
                </Form>
              )}
            </Formik>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-gray-400 text-xs">or continue with</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            {/* Google Sign In */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              className="w-full py-3.5 rounded-xl border border-gray-200 flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </motion.button>

            {/* Sign Up Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-6 pt-5 border-t border-gray-100"
            >
              <p className="text-gray-600 text-xs">
                Don't have an account?{" "}
                <Link 
                  href="/signup" 
                  className="text-purple-600 font-semibold hover:text-purple-700 transition-colors hover:underline"
                >
                  Create Account
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}