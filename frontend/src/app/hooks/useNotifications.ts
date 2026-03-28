'use client';

import { useState, useEffect, useRef } from 'react';
import { ToastData } from '../components/v2/ToastContainer';
import { NotificationStatus } from '../components/v2/NotificationItem';

export interface Notification {
  id: string;
  step: string;
  message: string;
  status: NotificationStatus;
  timestamp: string;
  uploadId: string;
}

const STATUS_STEPS: Record<string, { step: string; message: string }> = {
  pending: { step: 'Resume Uploaded', message: 'Your resume has been uploaded and queued for processing' },
  parsing: { step: 'Parsing Started', message: 'Analyzing your resume content and extracting information' },
  parsed: { step: 'Parsing Completed', message: 'Resume successfully parsed and structured' },
  embedding: { step: 'Creating Embeddings', message: 'Generating vector embeddings for semantic search' },
  embedding_completed: { step: 'Embeddings Ready', message: 'Resume ready — create recommendations when you want job matches.' },
  recommendations: { step: 'Generating Recommendations', message: 'Finding the best job matches for your profile' },
  completed: { step: 'Recommendations Ready', message: 'Your personalized job recommendations are ready!' },
  failed: { step: 'Processing Failed', message: 'An error occurred during processing' },
  parsing_failed: { step: 'Parsing Failed', message: 'Failed to parse your resume. Please try again' },
  embedding_failed: { step: 'Embedding Failed', message: 'Failed to create embeddings. Please try again' },
};

const STATUS_TO_TOAST: Record<string, { message: string; type: 'success' | 'info' | 'warning' | 'error' }> = {
  pending: { message: 'Resume uploaded', type: 'info' },
  parsing: { message: 'Parsing your resume...', type: 'info' },
  parsed: { message: 'Resume parsed successfully', type: 'success' },
  embedding: { message: 'Creating embeddings...', type: 'info' },
  embedding_completed: { message: 'Resume ready — you can create recommendations when you want.', type: 'success' },
  recommendations: { message: 'Finding job matches...', type: 'info' },
  completed: { message: 'Recommendations ready!', type: 'success' },
  failed: { message: 'Processing failed', type: 'error' },
  parsing_failed: { message: 'Parsing failed', type: 'error' },
  embedding_failed: { message: 'Embedding failed', type: 'error' },
};

export interface Notification {
  id: string;
  step: string;
  message: string;
  status: NotificationStatus;
  timestamp: string;
  uploadId: string;
  errorMessage?: string | null;
}

// Define the status progression order with their corresponding step names
const STATUS_PROGRESSION = [
  { status: 'pending', step: 'Resume Uploaded' },
  { status: 'parsing', step: 'Parsing Started' },
  { status: 'parsed', step: 'Parsing Completed' },
  { status: 'embedding', step: 'Creating Embeddings' },
  { status: 'embedding_completed', step: 'Embeddings Ready' },
  { status: 'recommendations', step: 'Generating Recommendations' },
  { status: 'completed', step: 'Recommendations Ready' },
];

function getCompletedStepsForStatus(status: string): string[] {
  const statusLower = status.toLowerCase();
  
  // Handle failed statuses - show steps up to the failure point
  if (statusLower === 'parsing_failed') {
    return ['Resume Uploaded', 'Parsing Started'];
  }
  if (statusLower === 'embedding_failed') {
    return ['Resume Uploaded', 'Parsing Started', 'Parsing Completed', 'Creating Embeddings'];
  }
  if (statusLower === 'failed') {
    // Generic failure - show all steps up to recommendations
    return ['Resume Uploaded', 'Parsing Started', 'Parsing Completed', 'Creating Embeddings', 'Embeddings Ready', 'Generating Recommendations'];
  }
  
  // Handle successful statuses
  const completedSteps: string[] = [];
  for (const { status: stepStatus, step } of STATUS_PROGRESSION) {
    completedSteps.push(step);
    if (statusLower === stepStatus) {
      break;
    }
  }
  
  return completedSteps;
}

function reconstructTimelineFromStatus(status: string, errorMessage: string | null): Notification[] {
  const completedSteps = getCompletedStepsForStatus(status);
  const isFailed = status.includes('failed') || status === 'failed';
  const notifications: Notification[] = [];

  // Build timeline showing all completed steps
  for (const stepName of completedSteps) {
    const statusInfo = Object.entries(STATUS_STEPS).find(([_, info]) => info.step === stepName);
    if (!statusInfo) continue;

    const [stepStatus, info] = statusInfo;
    const isLastStep = stepName === completedSteps[completedSteps.length - 1];
    
    const getNotificationStatus = (): NotificationStatus => {
      if (isFailed && isLastStep) return 'failed';
      if (isLastStep && !isFailed) {
        // Check if this is a completed status
        if (status === 'completed' || status === 'parsed' || status === 'embedding_completed') {
          return 'completed';
        }
        return 'in_progress';
      }
      return 'completed';
    };

    notifications.push({
      id: `reconstructed-${stepStatus}`,
      step: info.step,
      message: info.message,
      status: getNotificationStatus(),
      timestamp: '',
      uploadId: '',
      errorMessage: isFailed && isLastStep ? errorMessage : undefined,
    });
  }

  return notifications;
}

export function useNotifications(uploadId: string | null, currentStatus: string | null, errorMessage: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const prevStatusRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  useEffect(() => {
    if (!uploadId || !currentStatus) {
      setNotifications([]);
      prevStatusRef.current = null;
      isInitialLoadRef.current = true;
      return;
    }

    // On initial load, reconstruct the timeline from current status
    if (isInitialLoadRef.current && currentStatus) {
      const reconstructed = reconstructTimelineFromStatus(currentStatus, errorMessage);
      if (reconstructed.length > 0) {
        const now = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });
        setNotifications(reconstructed.map((n, index) => ({
          ...n,
          uploadId,
          // For completed steps, show "Completed", for current step show current time
          timestamp: index < reconstructed.length - 1 ? 'Completed' : now,
        })));
        isInitialLoadRef.current = false;
        prevStatusRef.current = currentStatus;
        return;
      }
    }

    const statusChanged = prevStatusRef.current !== currentStatus;
    const statusInfo = STATUS_STEPS[currentStatus];

    if (statusChanged && statusInfo) {
      const notificationId = `${uploadId}-${currentStatus}-${Date.now()}`;
      const timestamp = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const getStatus = (status: string): NotificationStatus => {
        if (status.includes('failed')) return 'failed';
        if (status === 'completed' || status === 'parsed' || status === 'embedding_completed') return 'completed';
        if (status === 'pending') return 'pending';
        return 'in_progress';
      };

      const newNotification: Notification = {
        id: notificationId,
        step: statusInfo.step,
        message: statusInfo.message,
        status: getStatus(currentStatus),
        timestamp,
        uploadId,
        errorMessage: errorMessage || undefined,
      };

      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.uploadId === uploadId);
        const existing = filtered.find((n) => n.step === statusInfo.step);
        if (existing) {
          return filtered.map((n) =>
            n.id === existing.id ? newNotification : n
          );
        }
        const updated = [...filtered, newNotification];
        const order = ['Resume Uploaded', 'Parsing Started', 'Parsing Completed', 'Creating Embeddings', 'Embeddings Ready', 'Generating Recommendations', 'Recommendations Ready'];
        return updated.sort((a, b) => {
          const aIndex = order.indexOf(a.step);
          const bIndex = order.indexOf(b.step);
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
      });

      const toastInfo = STATUS_TO_TOAST[currentStatus];
      if (toastInfo && prevStatusRef.current !== null) {
        const toastId = `toast-${Date.now()}`;
        setToasts([{ id: toastId, message: toastInfo.message, type: toastInfo.type }]);
      }

      prevStatusRef.current = currentStatus;
    } else if (!prevStatusRef.current && currentStatus) {
      prevStatusRef.current = currentStatus;
    }

    if (errorMessage && currentStatus && (currentStatus.includes('failed') || currentStatus === 'failed')) {
      setNotifications((prev) => {
        const filtered = prev.filter((n) => n.uploadId === uploadId);
        const failedNotification = filtered.find((n) => n.status === 'failed');
        if (failedNotification) {
          return filtered.map((n) =>
            n.id === failedNotification.id ? { ...n, errorMessage } : n
          );
        }
        return filtered;
      });
    }
  }, [uploadId, currentStatus, errorMessage]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getNotificationsForUpload = (uploadId: string) => {
    return notifications.filter((n) => n.uploadId === uploadId);
  };

  return {
    notifications: getNotificationsForUpload(uploadId || ''),
    toasts,
    removeToast,
  };
}

