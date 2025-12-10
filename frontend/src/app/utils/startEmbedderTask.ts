/**
 * @param userEmail 
 * @returns 
 */

import { startRecommendationTask } from './startrecommendationtask';

export async function pullEmbedderTask(task_id: string, userEmail: string): Promise<{ status: 'pending' | 'completed' | 'error', message: string, recommendation_task_id?: string }> {
    const pollInterval = 1000;
    const maxAttempts = 30;
    let attempts = 0;

    const pollTask = async (): Promise<{ status: 'pending' | 'completed' | 'error', message: string, recommendation_task_id?: string }> => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_WORKER_URL}/precompute-embedding/${task_id}`);

            if (!response.ok) {
                throw new Error('Failed to fetch task status');
            }

            const data = await response.json();

            if (data.status === 'completed') {
                const recommendationData = await startRecommendationTask(userEmail);

                return {
                    status: 'completed',
                    message: 'Embedding task completed and recommendation task started',
                    recommendation_task_id: recommendationData.task_id
                };
            }

            if (attempts >= maxAttempts) {
                return {
                    status: 'error',
                    message: 'Task polling timeout after 5 minutes'
                };
            }

            await new Promise(resolve => setTimeout(resolve, pollInterval));
            attempts++;
            return pollTask();

        } catch (error) {
            console.error('Error checking task status:', error);
            return {
                status: 'error',
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            };
        }
    };

    return pollTask();
}