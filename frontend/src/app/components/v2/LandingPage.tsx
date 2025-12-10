'use client';

import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import FeatureGrid from "./FeatureGrid";
import RecentMatches from "./RecentMatches";
import Footer from "./Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-brand text-brand">
      <div className="noise-bg" />
      <Navbar />
      <Hero />
      <FeatureGrid />
      <RecentMatches />
      <Footer />
    </div>
  );
};

export default LandingPage;
