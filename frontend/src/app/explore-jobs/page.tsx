"use client";

import Navbar from '../components/Navbar';
import JobListings from '../components/JobListings';

export default function ExploreJobs() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <JobListings />
      </main>
    </div>
  );
}

