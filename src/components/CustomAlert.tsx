import { AnimatePresence, motion } from "framer-motion";

interface ModelProps {
  isOpen: boolean;
  message: String;
  onClose: () => void;
  onConfrim: () => void;
}

export default function CustomAlert({
  isOpen,
  message,
  onClose,
  onConfrim,
}: ModelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white p-8 rounded-lg shadow-xl w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className=" mb-8">{message}</h1>
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="btn btn-outline">
                Cancel
              </button>
              <button onClick={onConfrim} className="btn btn-primary">
                Confrim
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
