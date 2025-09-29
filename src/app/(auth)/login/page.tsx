"use client";

import { signIn } from "next-auth/react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const LoginSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(6, "Min 6 chars").required("Required"),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white/80 backdrop-blur-sm"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back
        </h2>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={async (values) => {
            setLoading(true);
            await signIn("credentials", {
              email: values.email,
              password: values.password,
              callbackUrl: "/",
            });
            setLoading(false);
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <Field
                  type="email"
                  name="email"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500"
                />
                <ErrorMessage name="email" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">Password</label>
                <Field
                  type="password"
                  name="password"
                  className="mt-1 w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-500"
                />
                <ErrorMessage name="password" component="p" className="text-red-500 text-sm" />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg"
              >
                {loading ? "Signing in..." : "Sign In"}
              </motion.button>
            </Form>
          )}
        </Formik>

        {/* Google login button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="mt-4 w-full py-3 rounded-xl border border-gray-300 flex items-center justify-center gap-2 hover:bg-gray-100"
        >
          <img src="/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </motion.button>

        <p className="text-center text-sm text-gray-600 mt-5">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-pink-600 font-medium">
            Sign Up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
