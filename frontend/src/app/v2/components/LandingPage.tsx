"use client";

import React from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import FeatureGrid from "./FeatureGrid";
import RecentMatches from "./RecentMatches";
import Footer from "./Footer";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <FeatureGrid />
      <RecentMatches />
      <Footer />
    </>
  );
};

export default LandingPage;
