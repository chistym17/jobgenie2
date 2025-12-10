import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface JobDetailsModalProps {
  job: Partial<{
    "Job Title": string;
    "Company Name": string;
    "Location": string;
    "Job Type"?: string;
    "Salary"?: string;
    "Posted Date"?: string;
    "Application Deadline"?: string;
    "Key Requirements"?: string[];
    "Bonus Skills"?: string[];
    "Stack"?: string[];
    "Description"?: string;
    "How to Apply"?: string[] | string;
    "Direct Link"?: string;
    "Match Score"?: number;
  }> | null;
  isOpen: boolean;
  onClose: () => void;
}

const backdropVariants = {
  visible: { opacity: 1, backdropFilter: 'blur(6px)' },
  hidden: { opacity: 0, backdropFilter: 'blur(0px)' },
};

const modalVariants = {
  hidden: { opacity: 0, y: -50, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, y: 30, scale: 0.96 }
};

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, isOpen, onClose }) => {
  if (!isOpen || !job) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/30 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-10 border border-blue-100"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
            tabIndex={-1}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-blue-600 text-2xl font-bold focus:outline-none"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex flex-col gap-3">
              {job["Job Title"] && <h2 className="text-2xl font-bold text-blue-700 mb-1">{job["Job Title"]}</h2>}
              <div className="flex items-center gap-2 mb-2">
                {job["Company Name"] && <span className="text-gray-700 font-medium">{job["Company Name"]}</span>}
                {job["Location"] && <span className="text-xs bg-blue-100 text-blue-700 rounded px-2 py-0.5 ml-2">{job["Location"]}</span>}
                {job["Salary"] && <span className="text-xs bg-green-100 text-green-700 rounded px-2 py-0.5 ml-2">{job["Salary"]}</span>}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {job["Job Type"] && <span className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5">{job["Job Type"]}</span>}
                {job["Match Score"] && <span className="text-xs bg-yellow-100 text-yellow-800 rounded px-2 py-0.5">Match: {job["Match Score"]}</span>}
                {job["Stack"] && <span className="text-xs bg-indigo-100 text-indigo-700 rounded px-2 py-0.5">{job["Stack"].join(', ')}</span>}
              </div>
              {job["Description"] && <div className="text-gray-700"><b>Description:</b> {job["Description"]}</div>}
              {job["Key Requirements"] && <div className="text-gray-700"><b>Key Requirements:</b> {job["Key Requirements"].join(', ')}</div>}
              {job["Bonus Skills"] && <div className="text-gray-700"><b>Bonus Skills:</b> {job["Bonus Skills"].join(', ')}</div>}
              {job["How to Apply"] && <div className="text-gray-700"><b>How to Apply:</b> {typeof job["How to Apply"] === 'string' ? job["How to Apply"] : job["How to Apply"].join(', ')}</div>}
              {job["Application Deadline"] && <div className="text-gray-500 text-xs">Deadline: {job["Application Deadline"]}</div>}
              {job["Direct Link"] && (
                <a
                  href={job["Direct Link"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                  Direct Link
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JobDetailsModal;
