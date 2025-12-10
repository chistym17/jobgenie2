import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface Stage {
    name: string;
    duration: number; // in milliseconds
}

const stages: Stage[] = [
    { name: "Fetching Resume Data", duration: 5000 },
    { name: "Extracting Key Points", duration: 5000 },
    { name: "Searching Similar Jobs", duration: 5000 },
    { name: "Making Final Recommendations", duration: 5000 }
];

export default function RecommendationProgress() {
    const [currentStage, setCurrentStage] = useState(0);
    const [progress, setProgress] = useState(0);
    const [warningVisible, setWarningVisible] = useState(false);

    useEffect(() => {
        let startTime = Date.now();
        let currentStageStartTime = startTime;
        let totalDuration = stages.reduce((acc, stage) => acc + stage.duration, 0);

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const currentElapsed = Date.now() - currentStageStartTime;
            
            // Calculate overall progress
            const overallProgress = Math.min((elapsed / totalDuration) * 100, 100);
            setProgress(overallProgress);

            // Update current stage
            let stageElapsed = 0;
            for (let i = 0; i < stages.length; i++) {
                stageElapsed += stages[i].duration;
                if (elapsed < stageElapsed) {
                    if (i !== currentStage) {
                        setCurrentStage(i);
                        currentStageStartTime = Date.now();
                    }
                    break;
                }
            }

            // Show warning after 5 seconds
            if (elapsed > 5000 && !warningVisible) {
                setWarningVisible(true);
            }

            if (elapsed >= totalDuration) {
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="relative w-48 h-48 mb-8">
                {/* Circular Progress */}
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: progress / 100 }}
                        transition={{ duration: 0.5 }}
                        style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
                    />
                    {/* Percentage text */}
                    <text
                        x="50"
                        y="50"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-2xl font-bold fill-gray-800"
                    >
                        {Math.round(progress)}%
                    </text>
                </svg>
            </div>

            {/* Current Stage */}
            <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {stages[currentStage].name}
                </h3>
                <p className="text-gray-600">
                    Please wait while we analyze your profile...
                </p>
            </div>

            {/* Progress Stages */}
            <div className="w-full max-w-md space-y-3">
                {stages.map((stage, index) => (
                    <div key={index} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                            index < currentStage 
                                ? 'bg-blue-500' 
                                : index === currentStage 
                                    ? 'bg-blue-500 animate-pulse' 
                                    : 'bg-gray-200'
                        }`} />
                        <span className={`text-sm ${
                            index <= currentStage ? 'text-gray-800' : 'text-gray-400'
                        }`}>
                            {stage.name}
                        </span>
                    </div>
                ))}
            </div>

            {/* Warning Message */}
            {warningVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start"
                >
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
                    <div>
                        <p className="text-yellow-800 font-medium">Please don't close this tab</p>
                        <p className="text-yellow-700 text-sm mt-1">
                            We're processing your recommendations. Closing the tab may interrupt the process.
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
} 