import React, { useState, useEffect } from "react";
import CameraComponent from "./components/Camera";
import PrescriptionDisplay from "./components/PrescriptionDisplay";
import ApiKeyModal from "./components/ApiKeyModal";
import {
  analyzePrescription,
  askQuestionAboutPrescription,
  uploadImageToOpenAI,
} from "./services/openai";
import { blobToBase64 } from "./utils/imageProcessing";
import { Medicine, PrescriptionData } from "./types";
import { Camera, Stethoscope, Loader } from "lucide-react";
import Navbar from "./components/Navbar";

function App() {
  const [apiKey, setApiKey] = useState<string>("");
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [prescriptionData, setPrescriptionData] = useState<Medicine[] | null>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // useEffect(() => {
  //   // Check if API key exists in localStorage
  //   const storedApiKey = localStorage.getItem("openai_api_key");
  //   if (storedApiKey) {
  //     setApiKey(storedApiKey);
  //   } else {
  //     setShowApiKeyModal(true);
  //   }
  // }, []);

  useEffect(() => {
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      setApiKey(import.meta.env.VITE_OPENAI_API_KEY);
      // setShowApiKeyModal(false);
    }
  }, []);

  // const handleApiKeySubmit = (key: string) => {
  //   setApiKey(key);
  //   localStorage.setItem("openai_api_key", key);
  //   // setShowApiKeyModal(false);
  // };

  const handleImageCapture = async (imageUrl: string, blob: Blob) => {
    setCapturedImageUrl(imageUrl);
    setImageBlob(blob);

    try {
      setIsLoading(true);
      setError(null);

      const base64Image = await blobToBase64(blob);
      setImageBase64(base64Image);
      const fileID = await uploadImageToOpenAI(blob, apiKey);

      const data = await analyzePrescription(fileID, apiKey);
      console.log(data, "reponse data");

      setPrescriptionData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      console.error("Error processing prescription:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async (question: string) => {
    if (!imageBase64 || !prescriptionData) {
      throw new Error("Image or prescription data not available");
    }

    return await askQuestionAboutPrescription(
      question,
      imageBase64,
      prescriptionData,
      apiKey
    );
  };

  const handleReset = () => {
    setCapturedImageUrl(null);
    setImageBlob(null);
    setImageBase64(null);
    setPrescriptionData(null);
    setError(null);
  };

  return (
    <div className=" bg-gray-50">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto py-6 px-4">
        {/* {showApiKeyModal && <ApiKeyModal onSubmit={handleApiKeySubmit} />} */}

        {!capturedImageUrl && (
          <div className="flex flex-col items-center justify-center ">
            <div className="w-full max-w-3xl h-full">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 ">
                {/* <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center">
                  <Camera className="text-blue-500 mr-2\" size={20} />
                  <h2 className="text-lg font-semibold text-gray-800">
                    Capture Prescription
                  </h2>
                </div> */}
                <CameraComponent
                  onCapture={handleImageCapture}
                  onCancel={() => {}}
                />
              </div>
            </div>
          </div>
        )}

        {isLoading && capturedImageUrl && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Loader size={48} className="text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Analyzing Prescription
            </h2>
            <p className="text-gray-600 max-w-md">
              Our AI is carefully examining your prescription to extract
              medicine details, dosages, and important information...
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div>
                <p className="font-bold text-red-700">Error</p>
                <p className="text-sm text-red-700">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {capturedImageUrl && prescriptionData && !isLoading && (
          <PrescriptionDisplay
            imageUrl={capturedImageUrl}
            prescriptionData={prescriptionData}
            onAskQuestion={handleAskQuestion}
            onReset={handleReset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-4 px-6 text-center">
        <p className="text-sm text-gray-600">
          This app uses AI to analyze prescriptions. Always consult with a
          healthcare professional for medical advice.
        </p>
      </footer>
    </div>
  );
}

export default App;
