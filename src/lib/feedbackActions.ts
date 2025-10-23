'use server';

import * as Sentry from '@sentry/nextjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// Helper to safely extract string from FormData
function getFormString(formData: FormData, key: string, defaultValue = ''): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : defaultValue;
}

// Server Action for form submissions
export async function submitFeedbackAction(formData: FormData) {
  await Sentry.startSpan(
    {
      name: 'submitFeedbackAction',
      op: 'function.server_action',
    },
    async (span) => {
      try {
        const name = getFormString(formData, 'name');
        const email = getFormString(formData, 'email');
        const message = getFormString(formData, 'message');
        const category = getFormString(formData, 'category', 'general');

        // Basic validation
        if (!name || name.length < 2) {
          throw new Error('Name must be at least 2 characters long');
        }

        if (!email?.includes('@')) {
          throw new Error('Please provide a valid email address');
        }

        if (!message || message.length < 10) {
          throw new Error('Message must be at least 10 characters long');
        }

        span.setAttributes({
          'feedback.category': category,
          'feedback.has_email': !!email,
          'feedback.message_length': message.length,
        });

        // Log feedback for now - in production this might go to a database or email service
        console.log('Feedback received:', {
          name,
          email,
          category,
          message: message.substring(0, 100) + '...',
          timestamp: new Date().toISOString(),
        });

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 500));

        span.setAttributes({
          'feedback.submitted': true,
        });

        // Revalidate relevant paths and redirect to thank you page
        revalidatePath('/feedback');
        redirect('/thank-you?type=feedback');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit feedback';

        console.error('Feedback submission error:', error);
        Sentry.captureException(error);

        span.setAttributes({
          'error.occurred': true,
          'error.message': errorMessage,
        });

        // Re-throw the error so the form can handle it
        throw error;
      }
    }
  );
}
