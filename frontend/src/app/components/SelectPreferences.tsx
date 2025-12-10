"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, BarChart, MapPin } from 'lucide-react';

interface UserPreferencesProps {
    onSubmit: (preferences: UserPreferencesData) => void;
}

interface UserPreferencesData {
    jobTitle: string[];
    jobType: string[];
    experienceLevel: string[];
}

const SelectPreferences: React.FC<UserPreferencesProps> = ({ onSubmit }) => {
    const [jobTitle, setJobTitle] = useState<string[]>([]);
    const [jobType, setJobType] = useState<string[]>([]);
    const [experienceLevel, setExperienceLevel] = useState<string[]>([]);

    const jobTitleOptions: string[] = [
        'Software Engineer',
        'Full Stack Developer',
        'Backend Developer',
        'Frontend Developer',
        'AI/ML Engineer',
        'Data Scientist',
        'Product Manager',
        'UI/UX Designer',
        'Marketing Manager',
        'Sales Representative',
        'Project Manager',
    ];

    const jobTypeOptions: string[] = [
        'Full-time',
        'Part-time',
        'Internship',
    ];

    const experienceLevelOptions: string[] = [
        'Entry Level',
        'Mid Level',
        'Senior',
    ];

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'jobType') {
            setJobType(prev => {
                const newJobType = [...prev, value];
                return newJobType;
            });
        } else if (name === 'experienceLevel') {
            setExperienceLevel(prev => {
                const newExperienceLevel = [...prev, value];
                return newExperienceLevel;
            });
        }
    };

    const handleSubmit = () => {
        onSubmit({
            jobTitle,
            jobType,
            experienceLevel
        });
    };

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-purple-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="max-w-7xl w-full px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
                        Set Your Job Preferences
                    </h2>

                    <div className="space-y-12">
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <label className="block text-lg font-medium text-gray-700 mb-3">
                                <Briefcase className="inline-block w-5 h-5 mr-2 text-blue-600" />
                                Job Title
                            </label>
                            <div className="flex flex-col space-y-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter job title"
                                        className="w-full px-4 py-3.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 text-gray-900"
                                        value={jobTitle.length > 0 ? jobTitle.join(', ') : ''}
                                        onChange={(e) => {
                                            const newTitle = e.target.value.trim();
                                            if (newTitle && !jobTitle.includes(newTitle)) {
                                                setJobTitle(prev => [...prev, newTitle]);
                                            }
                                        }}
                                        onFocus={(e) => {
                                            if (jobTitle.includes(e.target.value)) {
                                                setJobTitle(['']);
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {jobTitleOptions.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => {
                                                if (!jobTitle.includes(option)) {
                                                    setJobTitle(prev => [...prev, option]);
                                                }
                                            }}
                                            className={`px-4 py-2.5 rounded-full text-sm transition-colors ${jobTitle.includes(option)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-6 rounded-xl">
                                <label className="block text-lg font-medium text-gray-700 mb-3">
                                    <Calendar className="inline-block w-5 h-5 mr-2 text-blue-600" />
                                    Job Type
                                </label>
                                <div className="flex flex-col space-y-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Select job types"
                                            className="w-full px-4 py-3.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 text-gray-900"
                                            value={jobType.length > 0 ? jobType.join(', ') : ''}
                                            readOnly
                                        />
                                    </div>
                                    <select
                                        name="jobType"
                                        className="w-full px-4 py-3.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 bg-white text-gray-900"
                                        onChange={handleSelectChange}
                                    >
                                        <option value="" disabled>Select job type</option>
                                        {jobTypeOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-xl">
                                <label className="block text-lg font-medium text-gray-700 mb-3">
                                    <BarChart className="inline-block w-5 h-5 mr-2 text-blue-600" />
                                    Experience Level
                                </label>
                                <div className="flex flex-col space-y-3">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Select experience levels"
                                            className="w-full px-4 py-3.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 text-gray-900"
                                            value={experienceLevel.length > 0 ? experienceLevel.join(', ') : ''}
                                            readOnly
                                        />
                                    </div>
                                    <select
                                        name="experienceLevel"
                                        className="w-full px-4 py-3.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 bg-white text-gray-900"
                                        onChange={handleSelectChange}
                                    >
                                        <option value="" disabled>Select experience level</option>
                                        {experienceLevelOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-6">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                className="inline-flex items-center px-8 py-3.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default SelectPreferences;