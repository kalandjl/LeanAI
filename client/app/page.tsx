"use client"
import React, { useState, useCallback, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { predictImage } from '@/lib/model';

interface PredictionResult {
  prediction: number;
}

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | ''; text: string; }>({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectFile = useCallback((selectedFile: File | null) => {
    setFile(selectedFile);
    setMessage({ type: '', text: '' });
    setPredictionResult(null);
    setImagePreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : null);
  }, []);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    selectFile(e.target.files ? e.target.files[0] : null);
  }, [selectFile]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith('image/')) selectFile(dropped);
  }, [selectFile]);

  const handleSubmit = useCallback(async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please upload an image first!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });
    setPredictionResult(null);

    try {
      const res = await predictImage(file);
      setPredictionResult(res);
      setMessage({ type: 'success', text: 'Prediction successful!' });
    } catch (err) {
      console.error("Prediction error:", err);
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'An unknown error occurred during prediction.' });
    } finally {
      setLoading(false);
    }
  }, [file]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-6 sm:p-8 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_24px_48px_-24px_rgba(0,0,0,0.6)]">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
            Get a bodyfat % estimate
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            Upload an image of your physique to get an estimated body fat percentage.
          </p>

          {/* File Upload Section */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`group relative mt-6 cursor-pointer overflow-hidden rounded-xl border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zinc-400
              ${imagePreviewUrl
                ? 'border-white/[0.08]'
                : dragging
                  ? 'border-dashed border-zinc-400 bg-white/[0.04]'
                  : 'border-dashed border-white/15 hover:border-white/30 hover:bg-white/[0.02]'}`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            {!imagePreviewUrl ? (
              <div className="flex h-44 flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                  <Upload className="h-4 w-4 text-zinc-300" />
                </div>
                <p className="text-sm text-zinc-300">
                  <span className="font-medium text-zinc-50 underline-offset-4 group-hover:underline">Choose a file</span> or drag it here
                </p>
                <p className="mt-1 text-xs text-zinc-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            ) : (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreviewUrl}
                  alt="Image Preview"
                  className="max-h-96 w-full object-contain bg-black/40"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="rounded-full bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-100 backdrop-blur">Click to change image</p>
                </div>
              </div>
            )}
          </div>

          {/* Prediction Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !file}
            className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-zinc-50 text-sm font-medium text-zinc-900 transition
              hover:bg-white active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-white/[0.06] disabled:text-zinc-500"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Predicting...
              </>
            ) : (
              <>
                Get Prediction
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Message Display (Success/Error) */}
          {message.text && (
            <div
              className={`mt-4 flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm
                ${message.type === 'success' ? 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300' : ''}
                ${message.type === 'error' ? 'border-red-500/20 bg-red-500/[0.06] text-red-300' : ''}
              `}
            >
              {message.type === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {message.type === 'error' && <XCircle className="h-4 w-4 shrink-0" />}
              <p>{message.text}</p>
            </div>
          )}

          {/* Prediction Result Display */}
          {predictionResult && (
            <div className="mt-6 border-t border-white/[0.08] pt-6">
              <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Prediction Result
              </h3>
              <p className="mt-3 text-sm text-zinc-400">Estimated Body Fat Percentage</p>
              <p className="mt-1 text-5xl font-semibold tracking-tight tabular-nums text-zinc-50">
                {predictionResult.prediction ? (
                  <>
                    {predictionResult.prediction.toFixed(2)}
                    <span className="ml-1 text-2xl font-normal text-zinc-500">%</span>
                  </>
                ) : (
                  <span className="text-zinc-500">N/A</span>
                )}
              </p>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-zinc-600">
          Powered by a cutting-edge ML model. Results are estimates.
        </p>
      </div>
    </main>
  );
};

export default App;
