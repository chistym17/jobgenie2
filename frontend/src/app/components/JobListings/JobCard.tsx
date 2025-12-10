import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Clock, ExternalLink, Star } from 'lucide-react';

interface Job {
    id: number;
    title: string;
    company: string;
    source: string;
    date: string;
    url: string;
    location?: string;
    type?: string;
    salary?: string;
    matchScore?: number;
}

export default function JobCard({ job }: { job: Job }) {
    const [isHovered, setIsHovered] = useState(false);

    const formattedDate = () => {
        try {
            const postDate = new Date(job.date);
            return formatDistanceToNow(postDate, { addSuffix: true });
        } catch (e) {
            return job.date;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Gradient overlay on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className="relative p-6">
                {/* Header with company logo and posted date */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-2 shadow-sm">
                            <div className="bg-white rounded-lg h-12 w-12 flex items-center justify-center text-blue-600 font-bold text-xl shadow-inner">
                                {job.company.charAt(0)}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                                {job.title}
                            </h3>
                            <p className="text-gray-600 font-medium">{job.company}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formattedDate()}
                        </span>
                        {job.matchScore && (
                            <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                                <Star className="w-3 h-3 mr-1" />
                                {job.matchScore}% Match
                            </span>
                        )}
                    </div>
                </div>

                {/* Job details */}
                <div className="space-y-3 mb-6">
                    {job.location && (
                        <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                            {job.location}
                        </div>
                    )}
                    {job.type && (
                        <div className="flex items-center text-gray-600 text-sm">
                            <Briefcase className="w-4 h-4 mr-2 text-purple-500" />
                            {job.type}
                        </div>
                    )}
                    {job.salary && (
                        <div className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                            {job.salary}
                        </div>
                    )}
                </div>

                {/* Source and action button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center text-gray-500 text-sm">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                        </svg>
                        {job.source}
                    </div>
                    <motion.a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow-md"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span>View Job</span>
                        <ExternalLink className="w-4 h-4 ml-2" />
                    </motion.a>
                </div>
            </div>
        </motion.div>
    );
}
