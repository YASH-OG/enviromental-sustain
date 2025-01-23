import { useState, useEffect } from 'react';
import axios from 'axios';

interface LeaderboardEntry {
  userId: string;
  username: string;
  points: number;
  badges: string[];
}

const actionTypes = [
  'Tree Planting',
  'Energy Conservation',
  'Waste Reduction',
  'Sustainable Transport',
  'Water Conservation',
  'Renewable Energy Usage',
];

export default function EcoImpact() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [actionType, setActionType] = useState<string>('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [submissionStatus, setSubmissionStatus] = useState<string>('');

  useEffect(() => {
    // Fetch leaderboard data when component mounts
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/eco-impact/leaderboard');
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedImage || !actionType) {
      alert('Please select an image and action type');
      return;
    }

    // Get location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(location);

          setLoading(true);
          try {
            // Convert image to base64
            const reader = new FileReader();
            reader.readAsDataURL(selectedImage);
            reader.onloadend = async () => {
              const base64Image = reader.result as string;

              // Submit action
              const response = await axios.post('http://localhost:5000/api/eco-impact/submit-action', {
                imageBase64: base64Image,
                actionType,
                location,
                userId: 'test-user', // TODO: Replace with actual user ID from auth
              });

              setSubmissionStatus('Action submitted successfully!');
              // Refresh leaderboard
              fetchLeaderboard();
              
              // Reset form
              setSelectedImage(null);
              setImagePreview('');
              setActionType('');
            };
          } catch (error) {
            console.error('Error submitting action:', error);
            setSubmissionStatus('Error submitting action. Please try again.');
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Error getting location. Please enable location services.');
        }
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-3xl font-semibold text-gray-900">EcoImpact</h1>
            <p className="mt-2 text-sm text-gray-700">
              Document your environmental actions and compete on the leaderboard.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Action Submission Form */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Action Image
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="mx-auto h-64 w-64 object-cover" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                              <span>Upload a file</span>
                              <input
                                type="file"
                                className="sr-only"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Action Type
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select an action</option>
                    {actionTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedImage || !actionType}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                >
                  {loading ? 'Submitting...' : 'Submit Action'}
                </button>

                {submissionStatus && (
                  <div className={`mt-2 text-sm ${submissionStatus.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {submissionStatus}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900">Leaderboard</h3>
              <div className="mt-4 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                            Rank
                          </th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            User
                          </th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Points
                          </th>
                          <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                            Badges
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {leaderboard.map((entry, index) => (
                          <tr key={entry.userId}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                              {index + 1}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {entry.username}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {entry.points}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {entry.badges.join(', ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
