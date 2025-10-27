import Form from 'next/form';
import { submitFeedbackAction } from '@/lib/feedbackActions';

export default function FeedbackForm() {
  return (
    <div className="max-w-md mx-auto bg-spotify-dark-gray rounded-lg p-6">
      <h2 className="text-xl font-bold text-spotify-white mb-4">Send Feedback</h2>
      <p className="text-spotify-light-gray text-sm mb-6">
        Help us improve your Spotify Time Machine experience.
      </p>

      <Form action={submitFeedbackAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-spotify-light-gray">
            Your Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Enter your name"
            className="w-full px-3 py-2 bg-spotify-black border border-gray-600 rounded-md 
                       text-spotify-white placeholder-gray-400 focus:outline-none 
                       focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-spotify-light-gray">
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="your.email@example.com"
            className="w-full px-3 py-2 bg-spotify-black border border-gray-600 rounded-md 
                       text-spotify-white placeholder-gray-400 focus:outline-none 
                       focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-spotify-light-gray">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue="general"
            className="w-full px-3 py-2 bg-spotify-black border border-gray-600 rounded-md 
                       text-spotify-white focus:outline-none 
                       focus:border-spotify-green focus:ring-1 focus:ring-spotify-green"
          >
            <option value="general">General Feedback</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="ui">User Interface</option>
            <option value="performance">Performance Issue</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="message" className="block text-sm font-medium text-spotify-light-gray">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={4}
            placeholder="Please share your feedback, suggestions, or report any issues..."
            className="w-full px-3 py-2 bg-spotify-black border border-gray-600 rounded-md 
                       text-spotify-white placeholder-gray-400 focus:outline-none 
                       focus:border-spotify-green focus:ring-1 focus:ring-spotify-green resize-vertical"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-spotify-green hover:bg-green-500 text-spotify-black 
                     font-semibold py-2 px-4 rounded-md transition-colors duration-200 
                     focus:outline-none focus:ring-2 focus:ring-spotify-green focus:ring-offset-2 
                     focus:ring-offset-spotify-dark-gray disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send Feedback
        </button>
      </Form>

      <p className="text-xs text-spotify-light-gray mt-4 text-center">
        Your feedback helps us build a better experience for everyone.
      </p>
    </div>
  );
}
