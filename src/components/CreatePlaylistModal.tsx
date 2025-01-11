"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import useAuth from "../hooks/useAuth";
import { toast } from "react-hot-toast";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlaylist: (name: string) => void;
}

export default function CreatePlaylistModal({
  isOpen,
  onClose,
  onCreatePlaylist,
}: CreatePlaylistModalProps) {
  const [playlistName, setPlaylistName] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playlistName.trim() && user) {
      const toastId = toast.loading("Creating playlist...");
      try {
        const playlistsRef = collection(db, "playlists");
        await addDoc(playlistsRef, {
          name: playlistName.trim(),
          createdAt: serverTimestamp(),
          songs: 0,
          createdBy: user.email,
          contributors: [user.email],
        });

        toast.success("Playlist created successfully!", { id: toastId });
        onCreatePlaylist(playlistName.trim());
        setPlaylistName("");
        onClose();
      } catch (error) {
        console.error("Error creating playlist:", error);
        toast.error("Failed to create playlist", { id: toastId });
      }
    } else {
      toast.error("Playlist name cannot be empty.");
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
            <h2 className="text-2xl font-bold mb-4">Create New Playlist</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Enter playlist name"
                className="input input-bordered input-primary w-full max-w-xs mb-2"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={onClose}
                  type="button"
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
