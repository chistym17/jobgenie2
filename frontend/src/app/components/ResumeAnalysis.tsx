import React from 'react';
import { Check, Code, User, X } from 'lucide-react';
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
    };
    onClose?: () => void;
}

export default function ResumeAnalysis({ data, onClose }: ResumeAnalysisProps) {
    return (
        <div className="glass-panel p-7 md:p-9 rounded-2xl md:rounded-3xl border border-white/10 relative">
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-brand-muted hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                    aria-label="Close modal"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
            <div className="flex items-center mb-7">
                <div className="bg-brand-secondary-soft p-2.5 rounded-full mr-3">
                    <Check className="h-5 w-5 text-brand-secondary" />
                </div>
                <h3 className="font-medium text-xl text-white">Resume analysis complete</h3>
            </div>

            <div className="space-y-6">
                <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-brand-primary" />
                    <div>
                        <h4 className="font-medium text-lg text-white">{data.name}</h4>
                        <p className="text-brand-muted text-sm">Profile successfully analyzed</p>
                    </div>
                </div>

                <div className="flex items-start space-x-3">
                    <Code className="h-5 w-5 text-brand-primary mt-1" />
                    <div>
                        <h4 className="font-medium text-base text-white mb-2">Key skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.skills.slice(0, 6).map((skill, index) => (
                                <span key={index} className="bg-brand-primary-soft text-brand-primary px-2.5 py-1 rounded-full text-xs border border-brand-primary-soft">
                                    {skill}
                                </span>
                            ))}
                            {data.skills.length > 6 && (
                                <span className="bg-white/5 text-brand-muted px-2.5 py-1 rounded-full text-xs border border-white/10">
                                    +{data.skills.length - 6} more
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-brand-muted mb-4 text-sm">
                    All set. Check out your matched jobs based on this profile.
                </p>
                <Link href="/recommendations">
                    <button className="btn-primary px-6 py-2 rounded-lg text-sm font-medium">
                        View job matches
                    </button>
                </Link>
            </div>
        </div>
    );
}
