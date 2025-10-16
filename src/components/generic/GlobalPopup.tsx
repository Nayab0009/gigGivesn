"use client";
import { usePopup } from "@/context/GlobalPopupContext";
import { motion, AnimatePresence } from "framer-motion";

export default function GlobalPopup() {
  const { visible, popupData, hidePopup } = usePopup();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-[100px] flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl w-[90%] max-w-md text-center"
          >
            <h2 className="text-xl font-semibold mb-3">{popupData?.title || "Are you sure?"}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{popupData?.message || "This action cannot be undone."}</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  popupData?.onConfirm?.();
                  hidePopup();
                }}
                className="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  popupData?.onCancel?.();
                  hidePopup();
                }}
                className="px-5 py-2 rounded-xl bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
