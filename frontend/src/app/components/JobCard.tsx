import { useState } from 'react';
import { motion } from 'framer-motion';

export interface JobCardProps {
    job: any;
    onViewDetails: () => void;
}

export default function JobCard({ job, onViewDetails }: JobCardProps) {
    const title = job["Job Title"] || "";
    const company = job["Company Name"] || "";
    const location = job["Location"] || "";
    const type = job["Job Type"] || "";
    const matchScore = job["Match Score"] || 0;
    const logo = job["Logo"] || null;
    const shortDescription = job["Description"] || "";
    const matchReasons: string[] = job["Key Requirements"] || [];
    const bonusSkills: string[] = job["Bonus Skills"] || [];
    const stack: string[] = job["Stack"] || [];
    const salary = job["Salary"] || "";
    const postedDate = job["Posted Date"] || "";
    const applicationDeadline = job["Application Deadline"] || "";

    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        setExpanded(!expanded);
    };

    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
            onClick={onViewDetails}
        >
            <div className="flex justify-between">
                <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                        {logo ? (
                            <img src={logo} alt={company} className="h-12 w-12 rounded-md object-cover" />
                        ) : (
                            <div className="h-12 w-12 bg-blue-100 text-blue-800 rounded-md flex items-center justify-center font-bold text-xl">
                                {company.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{title}</h3>
                        <p className="text-gray-600">{company}</p>
                        <p className="text-gray-500 text-sm">{location}</p>
                        <p className="text-gray-400 text-xs">{type}</p>
                        <p className="text-gray-400 text-xs">{salary}</p>
                        <p className="text-gray-400 text-xs">Posted: {postedDate}</p>
                        <p className="text-gray-400 text-xs">Deadline: {applicationDeadline}</p>
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${matchScore >= 85 ? 'bg-green-100 text-green-800' :
                        matchScore >= 70 ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        Match Score: {matchScore}
                    </span>
                </div>
            </div>
            <p className="text-gray-700 mt-3">{shortDescription}</p>
            {stack.length > 0 && (
                <div className="text-xs text-gray-500 mt-2">Stack: {stack.join(', ')}</div>
            )}
            {bonusSkills.length > 0 && (
                <div className="text-xs text-gray-500 mt-2">Bonus Skills: {bonusSkills.join(', ')}</div>
            )}
            {matchReasons.length > 0 && (
                <div className="mt-3 pt-3 border-t text-gray-700">
                    <p className="font-medium mb-2">Key Requirements:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {matchReasons.map((reason: string, index: number) => (
                            <li key={index}>{reason}</li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="mt-4 flex justify-between">
                <div className="flex space-x-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand();
                        }}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{expanded ? "Hide details" : "Why this job?"}</span>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();

                        }}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Show more like this</span>
                    </button>
                </div>
                <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md transition-colors font-medium">
                    Apply Now
                </button>
            </div>
        </motion.div>
    );
}