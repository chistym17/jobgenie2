"use client";
import { useState, useEffect } from 'react';
import Head from 'next/head';
import JobDetailsModal from '../components/JobDetailsModal';
import ChatWidget from '../components/ChatWidget';
import Navbar from '../components/Navbar';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { motion } from 'framer-motion';
import RecommendationLoader from '../components/RecommendationLoader';
import { useRouter } from 'next/navigation';
import RecommendationProgress from '../components/RecommendationProgress';

export interface WSJob {
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
}

let cachedRecommendations: WSJob[] | null = null;

export default function Home() {
    const router = useRouter();
    const [jobs, setJobs] = useState<WSJob[]>([]);
    const [selectedJob, setSelectedJob] = useState<WSJob | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const { user, loading: userLoading } = useCurrentUser();
    const email = user?.email;

    useEffect(() => {
        if (userLoading) {
            return;
        }
        setLoading(true);

        if (!user) {
            router.push('/login');
            return;
        }

        if (cachedRecommendations !== null) {
            setJobs(cachedRecommendations);
            setLoading(false);
            return;
        }

        const workerUrl = process.env.NEXT_PUBLIC_RECOMMENDATIONS_URL;
        const taskId = localStorage.getItem('recommendation_task_id');

        if (!workerUrl) {
            setError('Worker URL not configured');
            setLoading(false);
            return;
        }

        if (taskId) {
            setIsProcessing(true);
            const pollInterval = setInterval(async () => {
                try {
                    const response = await fetch(`${workerUrl}/${taskId}`);
                    const data = await response.json();

                    
                    if (data.status === 'completed') {
                        clearInterval(pollInterval);
                        localStorage.removeItem('recommendation_task_id');
                        cachedRecommendations = data.data;
                        setJobs(data.data);
                        setLoading(false);
                    }
                } catch (err) {
                    console.error('Error polling task:', err);
                    clearInterval(pollInterval);
                    setError('Failed to fetch recommendations');
                    setLoading(false);
                }
            }, 1000); 

            return () => clearInterval(pollInterval);
        } else {
            setIsProcessing(false);
            fetch(workerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email })
            })
                .then(async (res) => {
                    if (!res.ok) throw new Error('Failed to fetch recommendations');
                    return res.json();
                })
                .then((data) => {
                    if (data.task_id) {
                        localStorage.setItem('recommendationTaskId', data.task_id);
                        setLoading(true); 
                    } else {
                        cachedRecommendations = data.jobs || [];
                        setJobs(data.jobs || []);
                        setLoading(false);
                    }
                })
                .catch((err) => {
                    console.error('Error:', err);
                    setError(err.message || 'Failed to fetch recommendations');
                    setLoading(false);
                });
        }
    }, [user, userLoading]);

    return (
        <div className="min-h-screen bg-gray-50">
            <Head>
                <title>JobGenie - Smart Recommendations</title>
                <meta name="description" content="AI-powered job recommendations" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-8">
                <div className="flex flex-col md:flex-row gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full md:w-3/4"
                    >
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Your Recommendations</h2>
                            </div>
                            {loading ? (
                                isProcessing ? (
                                    <RecommendationProgress />
                                ) : (
                                    <RecommendationLoader />
                                )
                            ) : error ? (
                                <div className="text-red-500">{error}</div>
                            ) : (
                                <div className="space-y-6">
                                    {jobs.map((job, idx) => (
                                        <div key={idx} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{job["Job Title"]}</h3>
                                                <div className="text-gray-600">{job["Company Name"]}</div>
                                                <div className="text-gray-500 text-sm">{job["Location"]}</div>
                                                {job["Match Score"] && (
                                                    <div className="mt-1 text-xs inline-block bg-yellow-100 text-yellow-800 rounded px-2 py-0.5 font-semibold">
                                                        Match Score: {job["Match Score"]}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col md:flex-row gap-2 mt-2 md:mt-0">
                                                {job["Direct Link"] ? (
                                                    <a 
                                                        href={job["Direct Link"]} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm text-center hover:bg-blue-700 transition-colors"
                                                    >
                                                        Apply
                                                    </a>
                                                ) : (
                                                    <div className="px-3 py-1 bg-gray-100 text-gray-500 rounded text-sm text-center">
                                                        No Direct Link
                                                    </div>
                                                )}
                                                <button
                                                    className="px-3 py-1 bg-gray-200 rounded text-sm text-gray-800"
                                                    onClick={() => { setSelectedJob(job); setModalOpen(true); }}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="w-full md:w-1/3 flex flex-col"
                    >
                        <div className="h-96 md:h-[32rem]">
                            <ChatWidget selectedJob={selectedJob} />
                        </div>
                    </motion.div>
                </div>
                <JobDetailsModal job={selectedJob as any} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
            </main>
        </div>
    );
}