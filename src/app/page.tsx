"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import useAuth from "@/hooks/useAuth";
import Header from "@/components/Header";
import Playlist from "@/components/Playlist";
import CreatePlaylistModal from "@/components/CreatePlaylistModal";
import SearchBar from "@/components/SearchBar";
import RecentlyPlayed from "@/components/RecentlyPlayed";

interface PlaylistData {
  id: string;
  name: string;
  songs: number;
  lastPlayed?: Date;
}

export default function Home() {
  const [playlists, setPlaylists] = useState<PlaylistData[]>([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState<PlaylistData[]>(
    []
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState<PlaylistData[]>([]);
  const { user, loading } = useAuth();

  useEffect(() => {
    const fetchPlaylists = async () => {
      if (user) {
        const playlistsCollection = collection(
          db,
          "users",
          user.uid,
          "playlists"
        );
        const playlistsSnapshot = await getDocs(
          query(playlistsCollection, orderBy("createdAt", "desc"))
        );
        const playlistsData = playlistsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PlaylistData[];
        setPlaylists(playlistsData);
        setFilteredPlaylists(playlistsData);

        // Fetch recently played playlists
        const recentlyPlayedSnapshot = await getDocs(
          query(
            playlistsCollection,
            where("lastPlayed", "!=", null),
            orderBy("lastPlayed", "desc"),
            limit(5)
          )
        );
        const recentlyPlayedData = recentlyPlayedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as PlaylistData[];
        setRecentlyPlayed(recentlyPlayedData);
      }
    };

    if (!loading) {
      fetchPlaylists();
    }
  }, [user, loading]);

  const handleSearch = (searchTerm: string) => {
    const filtered = playlists.filter((playlist) =>
      playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlaylists(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-white text-4xl font-bold"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-white mb-4"
          >
            Please log in or sign up to view your playlists.
          </motion.h2>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Your Music Hub</h2>
          <div className="flex space-x-4 mb-4">
            <SearchBar onSearch={handleSearch} />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-indigo-700 text-white px-6 py-2 rounded-lg hover:bg-indigo-800 transition duration-300"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create New Playlist
            </motion.button>
          </div>
        </motion.section>

        <RecentlyPlayed playlists={recentlyPlayed} />

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">Your Playlists</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPlaylists.map((playlist) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Playlist
                    id={playlist.id}
                    name={playlist.name}
                    songCount={playlist.songs}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.section>
      </main>
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePlaylist={async (name) => {
          // Implementation for creating a new playlist
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
}
