
"use client";
import { useState, useEffect } from 'react';
import JobCard from './JobCard';
import SearchBar from './SearchBar';
import LoadingSpinner from './LoadingSpinner';
import NoResultsFound from './NoResultsFound';

interface Job {
    id: number;
    title: string;
    company: string;
    source: string;
    date: string;
    url: string;
}

export default function JobListings() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [visibleJobs, setVisibleJobs] = useState(25);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            console.log(process.env.NEXT_PUBLIC_BACKEND_URL)
            try {
                setIsLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs`);

                if (!response.ok) {
                    throw new Error('Failed to fetch jobs');
                }

                const data = await response.json();
                setJobs(data);
                setFilteredJobs(data);
            } catch (err: unknown) {
                console.error('Error fetching jobs:', err);
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);

        if (!query.trim()) {
            setFilteredJobs(jobs);
            return;
        }

        const lowercaseQuery = query.toLowerCase();
        const results = jobs.filter(job =>
            job.title.toLowerCase().includes(lowercaseQuery) ||
            job.company.toLowerCase().includes(lowercaseQuery) ||
            job.source.toLowerCase().includes(lowercaseQuery)
        );

        setFilteredJobs(results);
        setVisibleJobs(50);
    };

    const loadMoreJobs = () => {
        setVisibleJobs(prev => prev + 50);
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-red-500 text-xl">Error: {error}</p>
                    <p className="mt-4">Please try again later.</p>
                </div>
            </div>
        );
    }

    return (
        <section className="bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-blue-800 mb-4">Available Positions</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Discover your next career opportunity. We've gathered the best jobs from across the web.
                    </p>
                </div>

                <SearchBar onSearch={handleSearch} />

                {filteredJobs.length === 0 ? (
                    <NoResultsFound query={searchQuery} />
                ) : (
                    <>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredJobs.slice(0, visibleJobs).map((job) => (
                                <JobCard key={job.id} job={job} />
                            ))}
                        </div>

                        {visibleJobs < filteredJobs.length && (
                            <div className="mt-12 text-center">
                                <button
                                    onClick={loadMoreJobs}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center mx-auto"
                                >
                                    <span>Load More</span>
                                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>
                            </div>
                        )}

                        <div className="mt-8 text-center text-gray-500">
                            Showing {Math.min(visibleJobs, filteredJobs.length)} of {filteredJobs.length} jobs
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
