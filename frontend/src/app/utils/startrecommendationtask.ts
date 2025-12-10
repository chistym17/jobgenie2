/**
 * @param userEmail 
 * @returns 
 */
export async function startRecommendationTask(userEmail: string): Promise<{ task_id: string; message: string }> {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_WORKER_URL}/recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail }),
        });

        if (!response.ok) {
            throw new Error('Failed to start recommendation task');
        }

        const data = await response.json();
        console.log(data);
        localStorage.setItem('recommendation_task_id', data.task_id);
        return data;
    } catch (error) {
        console.error('Error starting recommendation task:', error);
        throw error;
    }
} 