'use client';
import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Upload, Zap, Shield, Briefcase, CheckCircle } from 'lucide-react';

const Navbar = () => (
  <nav className="fixed top-0 w-full z-40 px-6 py-6 flex justify-between items-center mix-blend-difference text-[#E2E4E9]">
    <div className="text-xl font-semibold tracking-tight">RESU/MATCH</div>
    <div className="hidden md:flex gap-8 text-sm font-medium">
      <a href="#" className="hover:text-brand-primary transition-colors">Find Jobs</a>
      <a href="#" className="hover:text-brand-primary transition-colors">For Companies</a>
      <a href="#" className="hover:text-brand-primary transition-colors">Pricing</a>
    </div>
    <button className="border border-[#E2E4E9]/30 px-5 py-2 rounded-full text-sm hover:bg-[#E2E4E9] hover:text-black transition-all">
      Login
    </button>
  </nav>
);

interface JobCardProps {
  title: string;
  company: string;
  match: number;
  tags: string[];
  delay?: number;
}

const JobCard = ({ title, company, match, tags, delay }: JobCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="glass-panel p-6 rounded-2xl hover:border-brand-primary-soft transition-colors group cursor-pointer"
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-xl font-medium text-white mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{company}</p>
      </div>
      <div className="flex flex-col items-end">
          <span className="text-brand-primary font-bold font-mono text-lg">{match}%</span>
        <span className="text-xs text-gray-500 uppercase tracking-wider">Match</span>
      </div>
    </div>
    <div className="flex flex-wrap gap-2 mt-4">
      {tags.map((tag, i) => (
          <span key={i} className="text-xs px-3 py-1 rounded-full border border-white/10 text-gray-300 group-hover:border-brand-primary-soft group-hover:text-brand-primary transition-colors">
          {tag}
        </span>
      ))}
    </div>
  </motion.div>
);

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 pt-24 pb-12 overflow-hidden">
      {/* Background Gradients */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[180px] opacity-10"
        style={{ backgroundColor: 'var(--brand-primary)' }}
        aria-hidden="true"
      />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-700 rounded-full blur-[140px] opacity-20" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Content */}
        <div className="lg:col-span-7 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary-soft bg-brand-primary-soft text-brand-primary text-xs font-medium tracking-wide mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"/>
              AI-POWERED RECRUITING V2.0
            </div>
            
            <h1 className="text-6xl md:text-8xl font-semibold leading-[0.9] tracking-tighter mb-8 text-white">
              Stop searching.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--brand-primary)] to-white/70">
                Start matching.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 max-w-lg leading-relaxed mb-10">
              Your resume isn't just a PDF. It's data. We decode your skills and match you with companies looking for exactly who you are, right now.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group relative px-8 py-4 btn-primary font-semibold text-lg overflow-hidden transition-all hover:pr-10">
                <span className="relative z-10 flex items-center gap-2">
                  Upload Resume <Upload size={18} />
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>
              
              <button className="px-8 py-4 btn-ghost font-medium hover:bg-white/5 transition-all">
                View Demo
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Visual - Interactive Card Stack */}
        <div className="lg:col-span-5 relative h-[500px] hidden lg:block">
          <motion.div style={{ y: y1 }} className="absolute inset-0">
             {/* Abstract Visual Representation of "Matching" */}
             <div className="relative w-full h-full">
                {/* Back Card */}
                <motion.div 
                  initial={{ rotate: 6, scale: 0.9, opacity: 0 }}
                  animate={{ rotate: 6, scale: 0.9, opacity: 0.4 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="absolute top-10 left-10 w-full h-full bg-gray-800 rounded-3xl border border-white/5"
                />
                
                {/* Main Card */}
                <motion.div 
                   initial={{ rotate: 0, scale: 1, opacity: 0, y: 50 }}
                   animate={{ rotate: -3, scale: 1, opacity: 1, y: 0 }}
                   transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                   className="absolute top-0 left-0 w-full bg-[#181B21] rounded-3xl border border-white/10 p-8 shadow-2xl accent-glow"
                >
                  <div className="flex justify-between items-center mb-8">
                    <div className="w-12 h-12 rounded-full bg-gray-700/50" />
                    <div className="h-2 w-20 bg-gray-700/50 rounded-full" />
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="h-8 w-3/4 bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-white/5 rounded" />
                    <div className="h-4 w-full bg-white/5 rounded" />
                  </div>

                  <div className="p-4 bg-brand-primary-soft rounded-xl border border-brand-primary-soft flex items-center gap-4">
                    <div className="bg-brand-primary p-2 rounded-full text-black">
                      <Zap size={20} fill="black" />
                    </div>
                    <div>
                      <div className="text-brand-primary font-bold text-lg">98% Compatible</div>
                      <div className="text-brand-primary text-xs opacity-70">Based on skills & culture</div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Elements */}
                <motion.div 
                  style={{ y: y2 }}
                  className="absolute -right-12 top-1/2 glass-panel p-4 rounded-xl flex items-center gap-3"
                >
                  <CheckCircle className="text-brand-primary" size={20} />
                  <span className="text-sm font-medium">Interview Request</span>
                </motion.div>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const FeatureGrid = () => (
  <section className="py-24 px-6 relative z-10">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Large Bento Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="md:col-span-2 glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gray-800 to-transparent opacity-20 rounded-bl-full" />
          <h3 className="text-3xl font-medium mb-4 text-white">Algorithmic Precision</h3>
          <p className="text-gray-400 max-w-md mb-8">
            We don't use keyword stuffing. Our vector database analyzes the semantic meaning of your experience to find jobs that actually fit your career trajectory.
          </p>
          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="text-brand-primary text-2xl font-bold mb-1">0.2s</div>
                <div className="text-xs text-gray-500">Match Speed</div>
             </div>
             <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="text-white text-2xl font-bold mb-1">10k+</div>
                <div className="text-xs text-gray-500">Active Roles</div>
             </div>
          </div>
        </motion.div>

        {/* Tall Bento Box */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.1 }}
           className="md:row-span-2 glass-panel p-8 rounded-3xl flex flex-col justify-between border-t-4"
           style={{ borderTopColor: 'var(--brand-primary)' }}
        >
          <div>
            <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center mb-6">
              <Shield className="text-black" />
            </div>
            <h3 className="text-2xl font-medium mb-3 text-white">Anonymous Mode</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Browse matches without alerting your current employer. Your profile remains hidden until you approve a connection request.
            </p>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10">
             <div className="flex items-center gap-3 text-sm text-gray-300">
               <div className="w-2 h-2 rounded-full bg-green-500" />
               Current Status: Invisible
             </div>
          </div>
        </motion.div>

        {/* Small Bento Box */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ delay: 0.2 }}
           className="glass-panel p-8 rounded-3xl"
        >
          <Briefcase className="text-gray-400 mb-6" size={32} />
          <h3 className="text-xl font-medium mb-2 text-white">Salary Transparent</h3>
          <p className="text-gray-400 text-sm">We only show jobs with verified salary ranges matching your expectations.</p>
        </motion.div>
      </div>
    </div>
  </section>
);

const RecentMatches = () => {
  const jobs: JobCardProps[] = [
    { title: "Senior Frontend Engineer", company: "Vercel", match: 96, tags: ["React", "Next.js", "Design Systems"] },
    { title: "Product Designer", company: "Linear", match: 92, tags: ["Figma", "UI/UX", "Prototyping"] },
    { title: "AI Research Scientist", company: "Anthropic", match: 89, tags: ["Python", "PyTorch", "LLMs"] },
  ];

  return (
    <section className="py-24 px-6 bg-[#0B0D10]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
           <div>
             <h2 className="text-4xl md:text-5xl text-white mb-4">Live Opportunities</h2>
             <p className="text-gray-500">Based on profiles similar to yours.</p>
           </div>
          <button className="text-brand-primary hover:text-white transition-colors flex items-center gap-2 mt-4 md:mt-0">
             View all jobs <ArrowRight size={16} />
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobs.map((job, idx) => (
            <JobCard key={idx} {...job} delay={idx * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="py-12 border-t border-white/10 text-center relative overflow-hidden">
     <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-[#0F1115] to-[#0F1115]" />
     <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center">
       <h2 className="text-[12vw] md:text-[8vw] leading-none font-bold text-[#181B21] select-none">
         RESU/MATCH
       </h2>
       <div className="mt-8 flex gap-6 text-gray-500">
         <a href="#" className="hover:text-white transition-colors">Privacy</a>
         <a href="#" className="hover:text-white transition-colors">Terms</a>
         <a href="#" className="hover:text-white transition-colors">Twitter</a>
       </div>
       <p className="mt-8 text-xs text-gray-600">
         © 2024 ResuMatch Inc. Engineered for the modern era.
       </p>
     </div>
  </footer>
);

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