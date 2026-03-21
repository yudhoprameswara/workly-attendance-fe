import React from "react";
import { CheckCircle2, XCircle, Info, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StatusModalProps {
  isOpen: boolean;
  type: "success" | "error" | "info" | "confirm";
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
}

const StatusModal: React.FC<StatusModalProps> = ({
  isOpen,
  type,
  title,
  message,
  onClose,
  onConfirm,
}) => {
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
    confirm: {
      icon: <HelpCircle size={48} className="text-amber-500" />,
      buttonColor: "bg-amber-600 hover:bg-amber-700",
      bgColor: "bg-amber-50",
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
              duration: 0.3 
            }}
            className="relative bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className={`p-8 flex flex-col items-center text-center ${config[type].bgColor}`}>
              <div className="mb-4 drop-shadow-sm">{config[type].icon}</div>
              <h3 className="text-2xl font-black text-neutral-900 tracking-tight">{title}</h3>
              <p className="mt-2 text-neutral-600 font-medium leading-relaxed">{message}</p>
            </div>

            <div className="p-6 bg-white">
              {type === "confirm" ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (onConfirm) onConfirm();
                      onClose();
                    }}
                    className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all active:scale-95 shadow-lg shadow-amber-100 ${config[type].buttonColor}`}
                  >
                    Ya
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-4 rounded-2xl text-neutral-500 font-bold text-lg transition-all hover:bg-neutral-50 active:scale-95"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  onClick={onClose}
                  className={`w-full py-4 rounded-2xl text-white font-bold text-lg transition-all active:scale-95 shadow-lg ${config[type].buttonColor}`}
                >
                  OK
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StatusModal;