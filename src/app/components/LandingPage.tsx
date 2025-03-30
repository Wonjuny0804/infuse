"use client";

import {
  ArrowRight,
  Mail,
  Shield,
  Zap,
  Calendar,
  MessageSquare,
  ListFilter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { motion } from "framer-motion";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
// Removed unused useState import since we're no longer using email and isSubscribed state
// import { useState } from "react";
// Import will be used when screenshot URLs are provided
// import Image from "next/image";
import "./aiAnimation.css"; // Import the CSS for the animation
import Image from "next/image";

interface Props {
  user: User | null;
}

const LandingPage = ({ user }: Props) => {
  const features = [
    {
      icon: <Mail className="w-6 h-6 text-gray-400" />,
      title: "Email Summary Assistant",
      description:
        'Get smart summaries of your inbox: "Looks like last night&apos;s email contains 4 ads and 2 that need your attention. There was mail from work..."',
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-gray-400" />,
      title: "Custom Email Agent",
      description:
        "Set up your own agent to draft emails and reply on your behalf, saving you time while maintaining your personal touch.",
    },
    {
      icon: <ListFilter className="w-6 h-6 text-gray-400" />,
      title: "Smart Prioritization",
      description:
        "Automatically sort emails by importance and get summaries of long email threads to quickly catch up on conversations.",
    },
    {
      icon: <Calendar className="w-6 h-6 text-gray-400" />,
      title: "Calendar Integration",
      description:
        "Seamlessly create events and tasks in your favorite calendar and reminder apps based on your email content.",
    },
    {
      icon: <Zap className="w-6 h-6 text-gray-400" />,
      title: "Lightning Fast",
      description:
        "Process hundreds of emails in seconds with our advanced AI technology.",
    },
    {
      icon: <Shield className="w-6 h-6 text-gray-400" />,
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
            <div className="h-20 flex items-center justify-between">
              <div className="flex items-center gap-8">
                <h1 className="text-3xl font-bold font-display text-brand-light">
                  Infuse
                  <span className="ai-animated">AI</span>
                  Labs
                </h1>
              </div>
              <div className="flex items-center gap-8">
                <nav className="hidden md:flex space-x-8">
                  <a
                    href="#features"
                    className="text-gray-400 hover:text-brand-light transition-colors text-sm font-medium"
                  >
                    Features
                  </a>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.open("https://tally.so/r/3E6Z5q", "_blank");
                    }}
                    className="text-gray-400 hover:text-brand-light transition-colors text-sm font-medium"
                  >
                    Join Beta
                  </a>
                  <a
                    href="#faq"
                    className="text-gray-400 hover:text-brand-light transition-colors text-sm font-medium"
                  >
                    FAQ
                  </a>
                </nav>
                {user ? (
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      className="text-brand-light border border-brand-light/20 hover:bg-brand-light/10"
                    >
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() =>
                        window.open("https://tally.so/r/3E6Z5q", "_blank")
                      }
                      className="bg-brand-light text-brand-dark hover:bg-brand-light/90 font-medium"
                    >
                      Join Beta
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-5rem)]">
          <div className="container px-4 mx-auto">
            <div className="max-w-5xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-6"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="flex items-center justify-center gap-2 mb-6"
                >
                  <span className="px-3 py-1 text-xs font-medium text-brand-light bg-brand-light/10 rounded-full">
                    Coming Soon
                  </span>
                  <span className="text-gray-400 text-sm">
                    Join our exclusive beta
                  </span>
                </motion.div>

                <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.1] mb-4">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-brand-light block"
                  >
                    Your Inbox,
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="animated-gradient-text block"
                  >
                    Revolutionized
                  </motion.span>
                </h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed"
                >
                  Infuse AI transforms your email experience with intelligent
                  summaries, custom email agents, smart prioritization, and
                  seamless calendar integration.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                  <Button
                    onClick={() =>
                      window.open("https://tally.so/r/3E6Z5q", "_blank")
                    }
                    size="lg"
                    className="bg-brand-light text-brand-dark hover:bg-brand-light/90 font-medium px-8 h-12"
                  >
                    Join Beta <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <a href="#screenshots">
                    <Button
                      size="lg"
                      variant="ghost"
                      className="text-gray-400 hover:text-brand-dark h-12"
                    >
                      View Screenshots
                    </Button>
                  </a>
                </motion.div>

                {/* App Screenshot Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="mt-12 relative"
                >
                  <div className="bg-gradient-to-b from-brand-dark/20 to-transparent p-1 rounded-xl shadow-2xl">
                    {/* Replace the src with actual screenshot URL later */}
                    <div className="relative h-[400px] w-full rounded-lg bg-gray-800/40 flex items-center justify-center overflow-hidden">
                      <p className="text-gray-400 text-sm">
                        Screenshot placeholder - URL will be provided later
                      </p>

                      <Image
                        src="/images/main.png"
                        alt="Infuse AI app screenshot"
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section
        id="features"
        className="w-full py-12 md:py-24 lg:py-32 bg-gray-100"
      >
        <div className="container mx-auto px-4 md:px-6 max-w-[1200px]">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Everything you need to take control of your inbox
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-3 bg-gray-100 rounded-full mb-4">
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

      {/* Screenshots Section */}
      <section
        id="screenshots"
        className="w-full py-12 md:py-24 lg:py-32 bg-white"
      >
        <div className="container mx-auto px-4 md:px-6 max-w-[1200px]">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">
              Preview InfuseAI
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Get a glimpse of how our platform will revolutionize your email
              workflow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Screenshot 1 */}
            <div className="bg-gradient-to-b from-brand-dark/10 to-transparent p-1 rounded-xl shadow-lg">
              <div className="relative h-[300px] w-full rounded-lg bg-gray-800/30 flex items-center justify-center">
                <p className="text-gray-400 text-sm">
                  Email summary screenshot placeholder
                </p>

                <Image
                  src="/images/feature1.png"
                  alt="Email summary feature"
                  fill
                  className="object-cover rounded-l object-top"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium mb-2">
                  Email Summary Assistant
                </h3>
                <p className="text-gray-500 text-sm">
                  Quick overview of your inbox with AI-powered insights
                </p>
              </div>
            </div>

            {/* Screenshot 2 */}
            <div className="bg-gradient-to-b from-brand-dark/10 to-transparent p-1 rounded-xl shadow-lg">
              <div className="relative h-[300px] w-full rounded-lg bg-gray-800/30 flex items-center justify-center">
                <p className="text-gray-400 text-sm">
                  Custom agent screenshot placeholder
                </p>

                <Image
                  src="/images/feature2.png"
                  alt="Custom email agent feature"
                  fill
                  className="object-cover rounded-l object-top"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-medium mb-2">Custom Email Agent</h3>
                <p className="text-gray-500 text-sm">
                  Set up your personalized email assistant to handle
                  correspondence
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Signup Section */}
      <section
        id="beta"
        className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-brand-dark/5 to-gray-100/5"
      >
        <div className="container mx-auto px-4 md:px-6 max-w-[1200px]">
          <div className="max-w-2xl mx-auto text-center">
            <div className="space-y-4">
              <h2 className="font-display text-3xl font-bold">Join Our Beta</h2>
              <p className="text-gray-500 leading-relaxed mx-auto max-w-lg">
                Be the first to experience our AI-powered email assistant. Sign
                up for our beta and we&apos;ll notify you when it&apos;s ready!
              </p>
            </div>

            <div className="mt-8 max-w-md mx-auto">
              <Button
                onClick={() =>
                  window.open("https://tally.so/r/3E6Z5q", "_blank")
                }
                className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white py-3"
              >
                Join Beta Waitlist
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container mx-auto px-4 md:px-6 max-w-[1200px]">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Everything you need to know about our service
            </p>
          </div>
          <div className="max-w-3xl mx-auto divide-y">
            <div className="py-5">
              <h3 className="text-xl font-medium">
                When will the beta be available?
              </h3>
              <p className="mt-2 text-gray-500">
                We&apos;re launching our beta soon. Sign up to be notified!
              </p>
            </div>
            <div className="py-5">
              <h3 className="text-xl font-medium">
                How does the freemium model work?
              </h3>
              <p className="mt-2 text-gray-500">
                Our basic features will be free to use, with premium features
                available for a monthly subscription.
              </p>
            </div>
            <div className="py-5">
              <h3 className="text-xl font-medium">Is my email data secure?</h3>
              <p className="mt-2 text-gray-500">
                Absolutely. We use enterprise-grade encryption and never store
                your email content permanently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2024 InfuseAILabs.com. All rights reserved.
            </p>
            <nav className="flex gap-6">
              <Link
                className="text-sm text-gray-500 hover:text-brand-dark hover:underline underline-offset-4"
                href="/terms"
              >
                Terms of Service
              </Link>
              <Link
                className="text-sm text-gray-500 hover:text-brand-dark hover:underline underline-offset-4"
                href="/privacy"
              >
                Privacy
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
