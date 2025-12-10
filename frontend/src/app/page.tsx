import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import WorkflowSection from "./components/WorkflowSection";
import JobListings from "./components/JobListings";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <HeroSection />
      </div>
      <WorkflowSection />
      <div id="joblistings">
        <JobListings />
      </div>
      <div>
        <Newsletter/>
      </div>
      <Footer/>

    </div>
  );
}
