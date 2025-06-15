"use client"
import React, { useState, useCallback, useRef, useEffect, ChangeEvent } from 'react';
import { Upload, Loader2, CheckCircle, XCircle, Image as ImageIcon, Info } from 'lucide-react';
import { predictImage } from '@/lib/model';

// Define the shape of the prediction result
interface PredictionResult {
  prediction: number;
}

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null); // Single file state
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null); // For direct image preview
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string; }>({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handles file selection and sets up preview
  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    setFile(selectedFile);
    setMessage({ type: '', text: '' }); // Clear any previous messages
    setPredictionResult(null); // Clear previous results

    if (selectedFile) {
      setImagePreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setImagePreviewUrl(null);
    }
  }, []);

  // Handles image submission for prediction
  const handleSubmit = useCallback(async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please upload an image first!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    setPredictionResult(null);

    try {
      const res = await predictImage(file); // Use the directly uploaded file

      setPredictionResult(res);
      setMessage({ type: 'success', text: 'Prediction successful!' });
    } catch (err: any) {
      console.error("Prediction error:", err);
      setMessage({ type: 'error', text: err.message || 'An unknown error occurred during prediction.' });
    } finally {
      setLoading(false);
    }
  }, [file]);

  // Triggers the hidden file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 font-inter flex items-center justify-center p-4">
      <div className="bg-gray-800 bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-gray-700 transform transition-all duration-500 hover:shadow-glow">
        <h1 className="text-4xl font-extrabold text-center mb-6 bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Get a bodyfat % estimate
        </h1>
        <p className="text-center text-gray-400 mb-8 max-w-md mx-auto">
          Upload an image of your physique to get an estimated body fat percentage.
        </p>

        {/* File Upload Section */}
        <div
          className="border-2 border-dashed border-purple-600 rounded-xl p-6 mb-6 text-center cursor-pointer hover:border-purple-400 transition-colors duration-300 relative group"
          onClick={triggerFileInput}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          {!imagePreviewUrl ? (
            <div className="flex flex-col items-center justify-center h-32">
              <Upload className="w-12 h-12 text-purple-500 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <p className="text-lg font-medium text-gray-300">
                <span className="text-purple-400 hover:underline">Choose a file</span> or drag it here
              </p>
              <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
            </div>
          ) : (
            <div className="relative w-full overflow-hidden rounded-lg">
              <img
                src={imagePreviewUrl}
                alt="Image Preview"
                className="w-full h-full object-cover rounded-lg transform transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                <p className="text-white text-lg font-bold">Click to change image</p>
              </div>
            </div>
          )}
        </div>

        {/* Prediction Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !file} // Button disabled if no file or loading
          className={`w-full py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300
            ${loading || !file
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:from-purple-700 hover:to-pink-700 transform hover:-translate-y-1 hover:shadow-xl'
            }
            flex items-center justify-center`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-3" />
              Predicting...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2" />
              Get Prediction
            </>
          )}
        </button>

        {/* Message Display (Success/Error) */}
        {message.text && (
          <div
            className={`mt-6 p-4 rounded-lg flex items-center space-x-3 transition-opacity duration-500 opacity-100
              ${message.type === 'success' ? 'bg-green-600 bg-opacity-20 text-green-300 border border-green-500' : ''}
              ${message.type === 'error' ? 'bg-red-600 bg-opacity-20 text-red-300 border border-red-500' : ''}
            `}
          >
            {message.type === 'success' && <CheckCircle className="w-6 h-6 text-green-400" />}
            {message.type === 'error' && <XCircle className="w-6 h-6 text-red-400" />}
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Prediction Result Display */}
        {predictionResult && (
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-2xl font-semibold mb-4 bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
              Prediction Result
            </h3>
            <div className="bg-gray-700 bg-opacity-50 p-6 rounded-xl shadow-inner border border-gray-600">
              <p className="text-lg text-gray-200 flex items-center">
                <Info className="w-5 h-5 text-blue-400 mr-2" />
                Estimated Body Fat Percentage:
              </p>
              <p className="text-5xl font-extrabold mt-3 text-white text-center animate-pulse-once">
                {predictionResult.prediction ? (
                  <span className="bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500">
                    {predictionResult.prediction.toFixed(2)}%
                  </span>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </p>
            </div>
          </div>
        )}

        <p className="text-center text-gray-600 text-sm mt-8">
          Powered by a cutting-edge ML model. Results are estimates.
        </p>
      </div>
      {/* Tailwind CSS CDN and Font */}
      <script src="https://cdn.tailwindcss.com"></script>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        @keyframes pulse-once {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.9; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pulse-once { animation: pulse-once 1s ease-out; }
        .shadow-glow { box-shadow: 0 0 15px rgba(168, 85, 247, 0.5), 0 0 30px rgba(236, 72, 153, 0.3); }
        .range-thumb-purple::-webkit-slider-thumb {
          background: linear-gradient(to right, #a855f7, #ec4899);
          border-radius: 9999px;
          height: 16px;
          width: 16px;
          cursor: pointer;
          -webkit-appearance: none;
          margin-top: -6px; /* Adjust to vertically center thumb */
        }
        .range-thumb-purple::-moz-range-thumb {
          background: linear-gradient(to right, #a855f7, #ec4899);
          border-radius: 9999px;
          height: 16px;
          width: 16px;
          cursor: pointer;
          -moz-appearance: none;
        }
      `}</style>
    </div>
  );
};

export default App;
