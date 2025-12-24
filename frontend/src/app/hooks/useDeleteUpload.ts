import { useState } from 'react';

const backendV2Base = process.env.NEXT_PUBLIC_BACKEND_URL?.replace('/api/v1', '/api/v2') || 'http://localhost:8000/api/v2';

export function useDeleteUpload() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUpload = async (uploadId: string): Promise<boolean> => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`${backendV2Base}/resume/upload/${uploadId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Failed to delete upload' }));
        throw new Error(errorData.detail || 'Failed to delete upload');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete upload';
      setError(errorMessage);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteUpload, isDeleting, error };
}

