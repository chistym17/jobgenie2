"use client";
import { useEffect, useState } from 'react';

const messages = [
    'Analyzing your resume...',
    'Searching for top job matches...',
    'Creating personalized recommendations...',
    'Curating the best opportunities for you...'
];

export default function RecommendationLoader() {
    const [currentMessage, setCurrentMessage] = useState(0);
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
                setCurrentMessage((prev) => (prev + 1) % messages.length);
            }, 3000);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            {showMessage && (
                <div className="bg-blue-50 p-4 rounded-lg text-blue-700">
                    <p className="text-sm font-medium">{messages[currentMessage]}</p>
                </div>
            )}
        </div>
    );
}
