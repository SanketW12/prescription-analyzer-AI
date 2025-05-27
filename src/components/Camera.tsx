import React, { useRef, useState, useEffect } from "react";
import { Camera, X } from "lucide-react";

interface CameraProps {
  onCapture: (imageData: string, blob: Blob) => void;
  onCancel: () => void;
}

const CameraComponent: React.FC<CameraProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 400, min: 400 },
          height: { ideal: 700, min: 700 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            setIsCameraActive(true);
            setCameraPermission(true);
          }
        };
      }
    } catch (err) {
      setCameraPermission(false);
      setError("Unable to access camera. Please check permissions.");
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();

      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame on canvas
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get image data from canvas
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const imageUrl = URL.createObjectURL(blob);
              onCapture(imageUrl, blob);
              stopCamera();
            }
          },
          "image/jpeg",
          0.95
        );
      }
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {cameraPermission === false && (
        <div className="text-center p-4">
          <p className="text-red-600 mb-3">Camera access denied</p>
          <p>
            Please check your browser settings and allow camera access to use
            this feature.
          </p>
          <button
            onClick={startCamera}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {cameraPermission !== false && (
        <div className="relative">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-lg shadow-lg">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted
            />
            {/* <button
              onClick={onCancel}
              className="absolute top-4 right-4 bg-gray-800 bg-opacity-70 p-2 rounded-full text-white"
            >
              <X size={20} />
            </button> */}
          </div>

          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex justify-center">
            <button
              onClick={captureImage}
              className="p-4 bg-white rounded-full shadow-lg hover:bg-gray-100 transition"
              disabled={!isCameraActive}
            >
              <Camera size={30} className="text-[#6A9C89]" />
            </button>
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
