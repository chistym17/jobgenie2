"use client"
import React from 'react';
import { Settings, Upload, Search, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: <Search className="text-blue-600" size={24} />,
    title: "Find Jobs",
    description: "Search through thousands of job opportunities from top companies"
  },
  {
    icon: <Upload className="text-purple-600" size={24} />,
    title: "Submit Resume",
    description: "Upload your resume and let our AI analyze it for you"
  },
  {
    icon: <Settings className="text-green-600" size={24} />,
    title: "Get Recommendations",
    description: "Receive personalized job recommendations based on your skills"
  },
  {
    icon: <MessageCircle className="text-pink-600" size={24} />,
    title: "Apply & Interview",
    description: "Get matched with perfect job opportunities and prepare for interviews"
  }
];

const container = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
  },
};

const WorkflowSection = () => {
  return (
    <div id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4"
          >
            How JobGenie Works
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Our streamlined process helps you find, analyze, and apply to jobs that perfectly match your skills and preferences.
          </motion.p>
        </motion.div>

        <div className="relative">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={item}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 relative"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-6">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-lg">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2 hidden md:block">
                    <div className="w-0.5 h-16 bg-gradient-to-b from-blue-100 to-transparent rotate-45"></div>
                    <div className="w-0.5 h-16 bg-gradient-to-b from-blue-100 to-transparent -rotate-45"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Arrows connecting steps */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2">
            {steps.map((_, index) => {
              if (index === steps.length - 1) return null;
              return (
                <div
                  key={index}
                  className="absolute left-0 top-1/2 -translate-y-1/2 transform -translate-x-1/2"
                  style={{
                    left: `${index * 100}%`,
                    width: `${100 / (steps.length - 1)}%`
                  }}
                >
                  <div className="w-0.5 h-16 bg-gradient-to-b from-blue-100 to-transparent rotate-45"></div>
                  <div className="w-0.5 h-16 bg-gradient-to-b from-blue-100 to-transparent -rotate-45"></div>
                </div>
              );
            })}
          </div>
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.a
            href="/jobs"
            className="inline-flex items-center justify-center py-3 px-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg font-semibold"
          >
            Start Your Job Search Journey
          </motion.a>
        </motion.div>
      </div>
    </div>
  );
};

export default WorkflowSection;
