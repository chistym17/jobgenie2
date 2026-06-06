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
      <div className="dbms-preview-banner">
        Theme preview only — DBMS monochrome style. Your main homepage at{" "}
        <a href="/" className="underline hover:no-underline">
          /
        </a>{" "}
        is unchanged.
      </div>
      <Navbar />
      <Hero />
      <FeatureGrid />
      <RecentMatches />
      <Footer />
    </>
  );
};

export default LandingPage;
