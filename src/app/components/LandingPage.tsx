"use client";

import { ArrowRight, Mail, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { motion } from "framer-motion";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

interface Props {
  user: User | null;
}

const LandingPage = ({ user }: Props) => {
  const features = [
    {
      icon: <Mail className="w-6 h-6 text-blue-500" />,
      title: "Smart Email Processing",
      description:
        "Get AI-powered summaries of your emails, helping you focus on what matters.",
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      title: "Lightning Fast",
      description:
        "Process hundreds of emails in seconds with our advanced AI technology.",
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      title: "Secure & Private",
      description:
        "Your emails are processed with enterprise-grade security and privacy.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Hero Section */}
      <div className="relative min-h-screen">
        <AnimatedBackground />

        {/* Navigation */}
        <header className="relative z-10">
          <div className="container mx-auto px-4">
            <div className="h-16 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <h1 className="text-2xl font-medium font-display text-white">
                  Infuse
                </h1>
              </div>
              <div className="flex items-center gap-8">
                <nav className="hidden md:flex space-x-8">
                  <a
                    href="#products"
                    className="text-gray-200 hover:text-white transition-colors"
                  >
                    Products
                  </a>
                  <a
                    href="#docs"
                    className="text-gray-200 hover:text-white transition-colors"
                  >
                    Docs
                  </a>
                  <a
                    href="#company"
                    className="text-gray-200 hover:text-white transition-colors"
                  >
                    Company
                  </a>
                  <a
                    href="#pricing"
                    className="text-gray-200 hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </nav>
                {user ? (
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="text-brand-cream bg-brand-orange hover:bg-brand-orange/90 hover:text-brand-cream"
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4">
                    <Link href="/signin">
                      <Button
                        variant="ghost"
                        className="text-brand-cream hover:bg-brand-cream/10"
                      >
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/signin">
                      <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                        Sign up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="container px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    Your Email Assistant
                  </motion.span>
                  <br />
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="bg-gradient-to-r from-brand-cream to-brand-orange text-transparent bg-clip-text"
                  >
                    Powered by AI
                  </motion.span>
                </h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto"
                >
                  Get smart summaries of your emails, save time, and never miss
                  important information.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                >
                  <Button
                    size="lg"
                    className="bg-brand-orange hover:bg-brand-orange/90 text-white"
                  >
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-brand-cream/10">
        <div className="container mx-auto px-4 md:px-6 max-w-[1200px]">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Everything you need to manage your emails efficiently
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-3 bg-brand-sky/20 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-display text-xl font-bold mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-brand-navy/5 to-brand-teal/5">
        <div className="container mx-auto px-4 md:px-6 max-w-[1200px]">
          <div className="max-w-2xl mx-auto text-center">
            <div className="space-y-4">
              <h2 className="font-display text-3xl font-bold">
                Ready to Get Started?
              </h2>
              <p className="text-gray-500 leading-relaxed mx-auto max-w-lg">
                Join thousands of users who are already saving time with our AI
                email assistant.
              </p>
            </div>
            <Button
              size="lg"
              className="bg-brand-orange hover:bg-brand-orange/90 text-white mt-8"
            >
              Sign Up Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-navy/10">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2024 Infuse. All rights reserved.
            </p>
            <nav className="flex gap-6">
              <a
                className="text-sm text-gray-500 hover:text-gray-900 hover:underline underline-offset-4"
                href="#"
              >
                Terms of Service
              </a>
              <a
                className="text-sm text-gray-500 hover:text-gray-900 hover:underline underline-offset-4"
                href="#"
              >
                Privacy
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
