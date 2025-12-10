import React from 'react';
import { Check, Briefcase, Code, MapPin, User } from 'lucide-react';
import Link from 'next/link';

interface ResumeAnalysisProps {
    data: {
        name: string;
        skills: string[];
        experience: Array<{
            position: string;
            company: string;
            duration: string;
        }>;
        preferences: {
            location: string;
            role: string;
        };
    };
}

export default function ResumeAnalysis({ data }: ResumeAnalysisProps) {
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex items-center mb-6">
                <div className="bg-green-50 p-3 rounded-full mr-4">
                    <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-xl text-gray-800">Resume Analysis Complete</h3>
            </div>

            <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-center space-x-4">
                    <User className="h-5 w-5 text-blue-500" />
                    <div>
                        <h4 className="font-semibold text-lg text-gray-800">{data.name}</h4>
                        <p className="text-gray-600">Profile Successfully Analyzed</p>
                    </div>
                </div>

                {/* Role Preference */}
                <div className="flex items-center space-x-4">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                    <div>
                        <h4 className="font-semibold text-gray-800">Preferred Role</h4>
                        <p className="text-gray-600">{data.preferences.role}</p>
                    </div>
                </div>

                {/* Location */}
                <div className="flex items-center space-x-4">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    <div>
                        <h4 className="font-semibold text-gray-800">Location</h4>
                        <p className="text-gray-600">{data.preferences.location}</p>
                    </div>
                </div>

                {/* Key Skills */}
                <div className="flex items-start space-x-4">
                    <Code className="h-5 w-5 text-blue-500 mt-1" />
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Key Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.slice(0, 6).map((skill, index) => (
                                <span key={index} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                                    {skill}
                                </span>
                            ))}
                            {data.skills.length > 6 && (
                                <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-full text-sm">
                                    +{data.skills.length - 6} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-gray-600 mb-6 text-lg">
                    Based on your resume, we've found <span className="font-semibold text-blue-600">10 job matches</span> where you would be a top candidate.
                </p>
                <Link href="/recommendations">
                    <button className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition font-medium text-lg">
                        View Job Matches
                    </button>
                </Link>
            </div>
        </div>
    );
} 