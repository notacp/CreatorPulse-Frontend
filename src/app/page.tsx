export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            CreatorPulse
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform hours of content ideation into minutes of review time with
            AI-powered LinkedIn post drafts delivered to your inbox.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Get Started
            </button>
            <button className="border border-gray-300 hover:border-gray-400 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors">
              Learn More
            </button>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Connect Your Sources
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Add RSS feeds and Twitter handles to monitor industry content and
              trends.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Train Your Style
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Upload sample posts to teach AI your unique voice and writing
              style.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Receive Daily Drafts
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get 3-5 personalized LinkedIn post drafts delivered to your inbox
              daily.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
