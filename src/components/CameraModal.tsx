import React, { useRef, useState, useEffect } from "react";
import { X, Camera, RefreshCw } from "lucide-react";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }, 
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Gagal akses kamera. Pastikan izin diberikan dan gunakan HTTPS.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  const takePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `attendance-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
        onClose();
      }
    }, "image/jpeg");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        
        <div className="absolute top-4 left-0 right-0 z-10 flex justify-between px-6">
          <span className="text-white/80 font-medium text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
            Ambil Selfie Presensi
          </span>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="relative aspect-[3/4] bg-neutral-800 flex items-center justify-center">
          {error ? (
            <div className="text-center p-6">
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button onClick={startCamera} className="text-white flex items-center gap-2 mx-auto bg-white/10 px-4 py-2 rounded-lg">
                <RefreshCw size={16} /> Coba Lagi
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover mirror"
              style={{ transform: "scaleX(-1)" }} 
            />
          )}
        </div>

        <div className="p-8 flex justify-center bg-neutral-900">
          <button
            onClick={takePhoto}
            disabled={!!error}
            className="group relative flex items-center justify-center"
          >
            <div className="absolute w-20 h-20 rounded-full border-4 border-white/20 group-active:scale-90 transition-transform" />
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl group-active:scale-95 transition-transform">
              <Camera size={28} className="text-blue-600" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;