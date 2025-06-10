"use client"
import { predictImage } from "@/lib/model";
import React, { useState } from "react";

export default function PredictPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);


  // Handle submit: upload image and get prediction
  const handleSubmit = async () => {

    if (!file) return alert("Please upload an image first!");
    setLoading(true);

    predictImage(file).then((res) => {

        setResult(res)
        setLoading(false)
    })
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto", padding: 20 }}>
      <h1>Image Prediction</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
      />
      <br />
      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Predicting..." : "Predict"}
      </button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <h3>Prediction Result:</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
