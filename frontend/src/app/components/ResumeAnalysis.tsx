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
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10">
            <div className="flex items-center mb-8">
                <div className="bg-brand-secondary-soft p-3 rounded-full mr-4">
                    <Check className="h-6 w-6 text-brand-secondary" />
                </div>
                <h3 className="font-bold text-2xl text-white">Resume Analysis Complete</h3>
            </div>

            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <User className="h-5 w-5 text-brand-primary" />
                    <div>
                        <h4 className="font-semibold text-lg text-white">{data.name}</h4>
                        <p className="text-brand-muted">Profile Successfully Analyzed</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <Briefcase className="h-5 w-5 text-brand-primary" />
                    <div>
                        <h4 className="font-semibold text-white">Preferred Role</h4>
                        <p className="text-brand-muted">{data.preferences.role}</p>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <MapPin className="h-5 w-5 text-brand-primary" />
                    <div>
                        <h4 className="font-semibold text-white">Location</h4>
                        <p className="text-brand-muted">{data.preferences.location}</p>
                    </div>
                </div>

                <div className="flex items-start space-x-4">
                    <Code className="h-5 w-5 text-brand-primary mt-1" />
                    <div>
                        <h4 className="font-semibold text-white mb-2">Key Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.slice(0, 6).map((skill, index) => (
                                <span key={index} className="bg-brand-primary-soft text-brand-primary px-3 py-1 rounded-full text-sm border border-brand-primary-soft">
                                    {skill}
                                </span>
                            ))}
                            {data.skills.length > 6 && (
                                <span className="bg-white/5 text-brand-muted px-3 py-1 rounded-full text-sm border border-white/10">
                                    +{data.skills.length - 6} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-brand-muted mb-6 text-lg">
                    Based on your resume, we've found <span className="font-semibold text-brand-primary">10 job matches</span> where you would be a top candidate.
                </p>
                <Link href="/recommendations">
                    <button className="btn-primary px-8 py-3 rounded-lg font-medium text-lg">
                        View Job Matches
                    </button>
                </Link>
            </div>
        </div>
    );
}
