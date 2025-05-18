"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* First gradient blob */}
          <motion.div
            className="absolute w-[800px] h-[800px] rounded-full filter blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(79, 70, 229, 0) 70%)",
              top: "30%",
              left: "10%",
            }}
            animate={{
              x: [0, 50, -30, 0],
              y: [0, -40, 30, 0],
              scale: [1, 1.1, 0.95, 1],
              borderRadius: [
                "50%",
                "60% 40% 60% 40%",
                "45% 55% 45% 55%",
                "50%",
              ],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "reverse",
            }}
          />

          {/* Second gradient blob */}
          <motion.div
            className="absolute w-[1000px] h-[1000px] rounded-full filter blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, rgba(217, 70, 239, 0) 70%)",
              bottom: "10%",
              right: "5%",
            }}
            animate={{
              x: [0, -60, 40, 0],
              y: [0, 50, -20, 0],
              scale: [1, 0.9, 1.1, 1],
              borderRadius: [
                "50%",
                "40% 60% 40% 60%",
                "55% 45% 55% 45%",
                "50%",
              ],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "reverse",
              delay: 5,
            }}
          />

          {/* Third gradient blob */}
          <motion.div
            className="absolute w-[700px] h-[700px] rounded-full filter blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0) 70%)",
              top: "60%",
              left: "60%",
            }}
            animate={{
              x: [0, 30, -50, 0],
              y: [0, -30, 40, 0],
              scale: [1, 1.2, 0.8, 1],
              borderRadius: [
                "50%",
                "65% 35% 65% 35%",
                "40% 60% 40% 60%",
                "50%",
              ],
            }}
            transition={{
              duration: 35,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "reverse",
              delay: 10,
            }}
          />

          {/* Subtle grid overlay */}
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,rgba(255,255,255,0.3))]"></div>

          {/* Subtle noise texture */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E\")",
            }}
          ></div>
        </div>

        <div className="relative container mx-auto px-4 py-32 md:py-40">
          <motion.div
            initial="hidden"
            animate="show"
            variants={container}
            className="max-w-4xl mx-auto text-center relative z-10"
          >
            {/* Badge */}
            <motion.div
              variants={item}
              className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium">
                Now with AI-powered insights
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight mb-6"
            >
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Future-Proof Your Business
              </span>
              <span className="relative inline-block mt-2">
                <span className="relative z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  with Intelligent Automation
                </span>
                <span className="absolute bottom-2 left-0 w-full h-4 bg-gradient-to-r from-blue-400/30 to-indigo-400/30 -z-0"></span>
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={item}
              className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10"
            >
              We&apos;re not just another AI company - we&apos;re your strategic
              partner in digital transformation. Our bespoke automation
              solutions are designed to streamline operations, reduce costs, and
              unlock new levels of efficiency for your business.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
            >
              <Link
                href="#work-with-us"
                className="group relative overflow-hidden px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Work With Us
                  <svg
                    className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 rounded-xl border-2 border-gray-200 bg-white/50 backdrop-blur-sm text-gray-700 font-medium hover:border-blue-200 hover:bg-white/80 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Watch Demo
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={item}
              className="flex flex-wrap justify-center gap-8 md:gap-16 text-gray-600"
            >
              {[
                { value: "10,000+", label: "Active Users" },
                { value: "98%", label: "Satisfaction" },
                { value: "24/7", label: "Support" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm uppercase tracking-wider text-gray-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "AI-Powered Analysis",
                description:
                  "Advanced machine learning algorithms analyze your emails for better insights",
                icon: "🤖",
              },
              {
                title: "Team Collaboration",
                description:
                  "Seamlessly share and manage emails across your entire team",
                icon: "👥",
              },
              {
                title: "Smart Automation",
                description:
                  "Automate repetitive tasks and focus on what matters most",
                icon: "⚡",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Carousel */}
      <div className="py-12 bg-gradient-to-r from-gray-50 to-white overflow-hidden">
        <div
          className="relative
          before:absolute before:top-0 before:left-0 before:w-24 before:h-full before:bg-gradient-to-r before:from-gray-50 before:to-transparent before:z-10
          after:absolute after:top-0 after:right-0 after:w-24 after:h-full after:bg-gradient-to-l after:from-gray-50 after:to-transparent after:z-10"
        >
          <div className="flex space-x-16 animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <div key={`first-${i}`} className="flex items-center space-x-16">
                {[
                  "AWS Lambda",
                  "SQS",
                  "Azure",
                  "Gmail API",
                  "Stripe",
                  "OpenAI",
                  "Google Cloud",
                  "Firebase",
                  "PostgreSQL",
                  "MongoDB",
                ].map((tech) => (
                  <div
                    key={tech}
                    className="flex items-center space-x-2 px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-100"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-medium text-sm">
                      {tech[0]}
                    </div>
                    <span className="text-gray-700 font-medium">{tech}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              AI Solutions That Deliver Real Business Value
            </h2>
            <p className="text-lg text-gray-600">
              We combine cutting-edge AI technology with deep business expertise
              to solve your most pressing challenges
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "End-to-End Business Analysis",
                description:
                  "Comprehensive assessment of your operations to identify high-impact automation opportunities and efficiency gains.",
              },
              {
                title: "Custom AI Automation",
                description:
                  "Tailored automation solutions that integrate seamlessly with your existing systems and workflows.",
              },
              {
                title: "Process Optimization",
                description:
                  "Streamline operations and eliminate bottlenecks with intelligent process automation.",
              },
              {
                title: "Data Integration",
                description:
                  "Connect disparate systems and unlock the full potential of your data with smart integration solutions.",
              },
              {
                title: "AI Strategy Consulting",
                description:
                  "Expert guidance to develop and implement an AI strategy aligned with your business goals.",
              },
              {
                title: "Ongoing Support",
                description:
                  "Continuous monitoring, optimization, and support to ensure your automation delivers maximum value.",
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Work With Us Section */}
      <section id="work-with-us" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Let&apos;s work together to identify automation opportunities and
              implement AI solutions that drive real business results.
            </p>
            <a
              href="https://tally.so" // Replace with your Tally form link
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
            >
              Get Started with a Free Consultation
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
