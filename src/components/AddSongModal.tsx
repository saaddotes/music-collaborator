"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSong: (song: { title: string; artist: string; url: string }) => void;
}

export default function AddSongModal({
  isOpen,
  onClose,
  onAddSong,
}: AddSongModalProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && artist.trim() && url.trim()) {
      onAddSong({
        title: title.trim(),
        artist: artist.trim(),
        url: url.trim(),
      });
      setTitle("");
      setArtist("");
      setUrl("");
      toast.success("Song added successfully!");
    } else {
      toast.error("Please fill in all fields");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white p-8 rounded-lg shadow-xl w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Add New Song</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input input-bordered input-primary w-full max-w-xs"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="artist"
                  className="block text-sm font-medium text-gray-700"
                >
                  Artist
                </label>
                <input
                  type="text"
                  id="artist"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="input input-bordered input-primary w-full max-w-xs"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="url"
                  className="block text-sm font-medium text-gray-700"
                >
                  Audio URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="input input-bordered input-primary w-full max-w-xs"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Add Song
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
