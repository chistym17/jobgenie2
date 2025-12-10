"use client"
import React from 'react';
import { Search, Briefcase, Upload, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const motionAny: any = motion;

const HeroSection = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-purple-50">
      <div className="absolute inset-0 z-0 opacity-30">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full filter blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400 rounded-full filter blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400 rounded-full filter blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-[calc(100vh-8rem)] flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center md:text-left md:flex md:items-center md:justify-between"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="md:w-1/2 mb-10 md:mb-0"
          >
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6"
            >
              Find Your Dream Job with AI Assistance
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl text-gray-700 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              JobGenie aggregates job opportunities from across the web based on your preferences, analyzes your resume, and provides personalized AI guidance to help you land the perfect role.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.a
                href="/upload"
                className="py-3 px-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Upload Resume
              </motion.a>
              <motion.a
                href="/explore-jobs"
                className="py-3 px-6 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
              >
                Explore Jobs
              </motion.a>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="md:w-1/2 flex justify-center"
          >
            <div className="relative w-full max-w-md">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-100 rounded-full z-0 filter blur-xl"></div>
              <div className="relative z-10 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-lg bg-blue-100">
                    <Search className="text-blue-600" size={24} />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-gray-800">Smart Job Search</h3>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="h-3 bg-gray-200 rounded-full w-full"></div>
                  <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">Remote</span>
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm">Full-time</span>
                  <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">Tech</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
