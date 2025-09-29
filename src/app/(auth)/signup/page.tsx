"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);

  const SignupSchema = Yup.object({
    name: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(6, "Min 6 chars").required("Required"),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 rounded-2xl shadow-xl bg-white/80 backdrop-blur-sm"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Account
        </h2>

        <Formik
          initialValues={{ name: "", email: "", password: "" }}
          validationSchema={SignupSchema}
          onSubmit={async (values) => {
            setLoading(true);
            await fetch("/api/auth/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values),
            });
            setLoading(false);
            window.location.href = "/login";
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-5">
              <div>
                <Field
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                />
                <ErrorMessage name="name" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                />
                <ErrorMessage name="email" component="p" className="text-red-500 text-sm" />
              </div>

              <div>
                <Field
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                />
                <ErrorMessage name="password" component="p" className="text-red-500 text-sm" />
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-semibold"
              >
                {loading ? "Creating..." : "Sign Up"}
              </motion.button>
            </Form>
          )}
        </Formik>

        <p className="text-center text-sm text-gray-600 mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-600 font-medium">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
