import { Suspense } from 'react';
import { Metadata } from 'next';
import FeedbackForm from '@/components/forms/FeedbackForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Feedback | Spotify Time Machine',
  description: 'Share your feedback about the Spotify Time Machine experience.',
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-spotify-black py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-spotify-white mb-4">We Value Your Feedback</h1>
          <p className="text-spotify-light-gray text-lg max-w-2xl mx-auto">
            Your thoughts and suggestions help us make the Spotify Time Machine experience better
            for everyone. Please share your feedback below.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          }
        >
          <FeedbackForm />
        </Suspense>

        <div className="mt-12 text-center">
          <div className="bg-spotify-dark-gray rounded-lg p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-spotify-white mb-4">
              Other Ways to Reach Us
            </h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-spotify-light-gray">
              <div>
                <h3 className="font-medium text-spotify-white mb-2">Bug Reports</h3>
                <p>Found a bug? Please include steps to reproduce it in your feedback.</p>
              </div>
              <div>
                <h3 className="font-medium text-spotify-white mb-2">Feature Requests</h3>
                <p>Have an idea for a new feature? We&apos;d love to hear about it!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
