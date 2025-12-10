"use client";
import { NextPage } from 'next';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import SelectPreferences from '../components/SelectPreferences';

interface UserPreferencesData {
    jobTitle: string[];
    jobType: string[];
    experienceLevel: string[];
}

const PreferencesPage: NextPage = () => {
    const handleSubmit = async (preferences: UserPreferencesData) => {
        console.log('Form submitted with preferences:', preferences);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferences),
        });
        const data = await res.json();
        localStorage.setItem('fetchedJobs', JSON.stringify(data));
        console.log('API response:', data);
    };

    return (
        <div>
            <Head>
                <title>Job Preferences | JobGenie</title>
                <meta name="description" content="Set your job preferences to find your ideal position" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <Navbar />
                <SelectPreferences onSubmit={handleSubmit} />
            </main>
        </div>
    );
};

export default PreferencesPage;