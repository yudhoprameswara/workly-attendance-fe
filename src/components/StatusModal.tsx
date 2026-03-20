import React from "react";
import { CheckCircle2, XCircle, Info } from "lucide-react";

interface StatusModalProps {
  isOpen: boolean;
  type: "success" | "error" | "info";
  title: string;
  message: string;
  onClose: () => void;
}

const StatusModal: React.FC<StatusModalProps> = ({ isOpen, type, title, message, onClose }) => {
  if (!isOpen) return null;

  const config = {
    success: {
      icon: <CheckCircle2 size={48} className="text-green-500" />,
      buttonColor: "bg-green-600 hover:bg-green-700",
      bgColor: "bg-green-50",
    },
    error: {
      icon: <XCircle size={48} className="text-red-500" />,
      buttonColor: "bg-red-600 hover:bg-red-700",
      bgColor: "bg-red-50",
    },
    info: {
      icon: <Info size={48} className="text-blue-500" />,
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      bgColor: "bg-blue-50",
    },
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
        <div className={`p-8 flex flex-col items-center text-center ${config[type].bgColor}`}>
          <div className="mb-4 drop-shadow-sm">{config[type].icon}</div>
          <h3 className="text-2xl font-bold text-neutral-900">{title}</h3>
          <p className="mt-2 text-neutral-600 font-medium">{message}</p>
        </div>
        
        <div className="p-4 bg-white">
          <button
            onClick={onClose}
            className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all active:scale-95 ${config[type].buttonColor}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusModal;