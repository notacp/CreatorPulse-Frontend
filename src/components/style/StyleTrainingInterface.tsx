'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/apiService';
import { StylePost, StyleTrainingStatus } from '@/lib/types';
import FileUploadZone from './FileUploadZone';

export default function StyleTrainingInterface() {
  const [stylePosts, setStylePosts] = useState<StylePost[]>([]);
  const [currentPost, setCurrentPost] = useState('');
  const [trainingStatus, setTrainingStatus] = useState<StyleTrainingStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadStyleData();
  }, []);

  const loadStyleData = async () => {
    setIsLoading(true);
    try {
      // Load existing style posts (this would come from a real API endpoint)
      // For now, we'll simulate this with the mock data
      const statusResponse = await apiService.getStyleTrainingStatus();
      if (statusResponse.success && statusResponse.data) {
        setTrainingStatus(statusResponse.data);
      }
      
      // In a real implementation, we'd have an endpoint to get existing style posts
      // For now, we'll use the mock data from the API service
      const mockData = apiService.getMockData();
      const currentUser = apiService.getCurrentUser();
      if (currentUser) {
        const userStylePosts = mockData.stylePosts.filter(sp => sp.user_id === currentUser.id);
        setStylePosts(userStylePosts);
      }
    } catch (err) {
      console.error('Error loading style data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addPost = async () => {
    if (!currentPost.trim() || currentPost.length < 50) {
      setErrors({ post: 'Post must be at least 50 characters long' });
      return;
    }

    if (currentPost.length > 3000) {
      setErrors({ post: 'Post must be less than 3000 characters' });
      return;
    }

    setErrors({});
    
    // Add to local state immediately for better UX
    const newPost: StylePost = {
      id: `temp-${Date.now()}`,
      user_id: apiService.getCurrentUser()?.id || '',
      content: currentPost.trim(),
      processed: false,
      created_at: new Date().toISOString(),
      word_count: currentPost.trim().split(/\s+/).length
    };

    setStylePosts(prev => [...prev, newPost]);
    setCurrentPost('');

    // Upload to API using the new addStylePost method
    try {
      const response = await apiService.addStylePost(currentPost.trim());
      if (response.success) {
        // Refresh the data to get the real post with proper ID
        await loadStyleData();
        // Show success message
        setErrors({ success: 'Post added successfully!' });
        setTimeout(() => setErrors({}), 2000);
      } else {
        // Remove the temporary post if upload failed
        setStylePosts(prev => prev.filter(p => p.id !== newPost.id));
        setErrors({ post: response.error?.message || 'Failed to upload post' });
      }
    } catch (err) {
      console.error('Error uploading post:', err);
      setStylePosts(prev => prev.filter(p => p.id !== newPost.id));
      setErrors({ post: 'Network error. Please try again.' });
    }
  };

  const removePost = async (postId: string) => {
    // Remove from local state immediately
    setStylePosts(prev => prev.filter(p => p.id !== postId));
    
    // In a real implementation, we'd call an API to delete the post
    // For now, we'll just update the mock data
    try {
      const mockData = apiService.getMockData();
      const postIndex = mockData.stylePosts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        mockData.stylePosts.splice(postIndex, 1);
      }
    } catch (err) {
      console.error('Error removing post:', err);
      // Reload data to ensure consistency
      await loadStyleData();
    }
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setErrors({});

    try {
      const text = await file.text();
      let posts: string[] = [];

      // Parse based on file type
      if (file.name.endsWith('.csv')) {
        // Simple CSV parsing - assume each line is a post
        posts = text.split('\n')
          .map(line => line.trim())
          .filter(line => line.length >= 50 && line.length <= 3000);
      } else {
        // Text file - split by double newlines or assume each line is a post
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        
        // Try to detect if it's paragraph-separated content
        if (text.includes('\n\n')) {
          posts = text.split('\n\n')
            .map(post => post.replace(/\n/g, ' ').trim())
            .filter(post => post.length >= 50 && post.length <= 3000);
        } else {
          posts = lines.filter(line => line.length >= 50 && line.length <= 3000);
        }
      }

      if (posts.length === 0) {
        setErrors({ file: 'No valid posts found. Each post must be 50-3000 characters.' });
        return;
      }

      if (posts.length > 50) {
        setErrors({ file: 'Too many posts. Maximum 50 posts per upload.' });
        return;
      }

      // Upload posts
      const response = await apiService.uploadStylePosts({ posts });
      if (response.success) {
        await loadStyleData();
        setErrors({});
        // Show success message
        setErrors({ success: `Successfully uploaded ${posts.length} posts!` });
        setTimeout(() => setErrors({}), 3000);
      } else {
        setErrors({ file: response.error?.message || 'Failed to upload posts' });
      }
    } catch (err) {
      console.error('Error reading file:', err);
      setErrors({ file: 'Error reading file. Please try again.' });
    } finally {
      setIsUploading(false);
    }
  };

  const retrainStyle = async () => {
    setIsProcessing(true);
    try {
      const response = await apiService.retrainStyle();
      if (response.success) {
        await loadStyleData();
        setErrors({ success: 'Style retraining started!' });
        setTimeout(() => setErrors({}), 3000);
      } else {
        setErrors({ retrain: response.error?.message || 'Failed to start retraining' });
      }
    } catch (err) {
      console.error('Error retraining style:', err);
      setErrors({ retrain: 'Network error. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const characterCount = currentPost.length;
  const isValidPost = characterCount >= 50 && characterCount <= 3000;
  const processedPosts = stylePosts.filter(p => p.processed).length;
  const totalPosts = stylePosts.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading style training data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Status Overview */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Training Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalPosts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Posts</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {processedPosts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Processed</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {trainingStatus?.status || 'Unknown'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
          </div>
        </div>

        {trainingStatus && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Processing Progress</span>
              <span>{trainingStatus.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  trainingStatus.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                }`}
                style={{ width: `${trainingStatus.progress}%` }}
              />
            </div>
            {trainingStatus.message && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {trainingStatus.message}
              </p>
            )}
          </div>
        )}

        {totalPosts >= 10 && (
          <div className="mt-6">
            <button
              onClick={retrainStyle}
              disabled={isProcessing}
              className="px-4 py-2 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Retraining...
                </div>
              ) : (
                'Retrain Style Model'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Add New Posts */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Add New Posts
        </h2>

        {/* Training Status Warning */}
        {stylePosts.length < 10 && (
          <div className="mb-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>Minimum 10 posts required for effective style training</strong>
                  <br />
                  You currently have {stylePosts.length} posts. Add {10 - stylePosts.length} more to enable draft generation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {errors.success && (
          <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-green-800 dark:text-green-200">{errors.success}</p>
              </div>
            </div>
          </div>
        )}

        {(errors.post || errors.file || errors.retrain) && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {errors.post || errors.file || errors.retrain}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Manual Post Entry */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Add Single Post
            </h3>
            <div className="relative">
              <textarea
                value={currentPost}
                onChange={(e) => setCurrentPost(e.target.value)}
                placeholder="Paste one of your LinkedIn posts here... (minimum 50 characters)"
                rows={8}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none ${
                  characterCount > 0 && !isValidPost 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                {characterCount}/3000
                {characterCount > 0 && characterCount < 50 && (
                  <span className="text-red-500 ml-2">Minimum 50 characters</span>
                )}
              </div>
            </div>
            
            <button
              onClick={addPost}
              disabled={!isValidPost}
              className="mt-3 w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Post
            </button>
          </div>

          {/* File Upload */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Bulk Upload from File
            </h3>
            
            <FileUploadZone
              onFileUpload={handleFileUpload}
              isUploading={isUploading}
              acceptedTypes={['.txt', '.csv', 'text/plain', 'text/csv']}
              maxSize={5 * 1024 * 1024} // 5MB
            />

            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium mb-2">File Format Guidelines:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li><strong>TXT files:</strong> One post per line or separated by blank lines</li>
                <li><strong>CSV files:</strong> One post per line</li>
                <li>Each post must be 50-3000 characters</li>
                <li>Maximum 50 posts per upload</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Posts */}
      {stylePosts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Style Posts ({stylePosts.length})
            </h2>
            
            {stylePosts.length < 10 && (
              <div className="text-sm text-orange-600 dark:text-orange-400">
                Add {10 - stylePosts.length} more posts for optimal training
              </div>
            )}
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Array.isArray(stylePosts) && stylePosts.map((post) => (
              <div key={post.id} className="flex justify-between items-start p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1 mr-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {post.content}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400 space-x-4">
                    <span>{post.content.length} characters</span>
                    <span>{post.word_count} words</span>
                    <span className={`px-2 py-1 rounded-full ${
                      post.processed 
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                    }`}>
                      {post.processed ? 'Processed' : 'Processing'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removePost(post.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex-shrink-0"
                  title="Remove post"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started Guide */}
      {stylePosts.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Getting Started with Style Training
          </h3>
          
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">Upload 10-20 sample posts</p>
                <p className="text-gray-600 dark:text-gray-400">Include posts with different tones and topics from your industry.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">Wait for processing</p>
                <p className="text-gray-600 dark:text-gray-400">Our AI will analyze your writing style and create a personalized model.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">Start generating drafts</p>
                <p className="text-gray-600 dark:text-gray-400">Once training is complete, you&apos;ll receive personalized draft suggestions.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}