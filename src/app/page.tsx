"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  getDocs,
  query,
  orderBy,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import useAuth from "@/hooks/useAuth";
import Playlist from "@/components/Playlist";
import CreatePlaylistModal from "@/components/CreatePlaylistModal";
import SearchBar from "@/components/SearchBar";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

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
  const { user, loading } = useAuth();
  const [playlistLoading, setPlaylistLoading] = useState(false);

  const fetchPlaylists = async () => {
    setPlaylistLoading(true);
    if (user) {
      const playlistsCollection = collection(db, "playlists");
      const playlistsSnapshot = await getDocs(
        query(
          playlistsCollection,
          where("contributors", "array-contains", user.email),
          orderBy("createdAt", "desc")
        )
      );
      const playlistsData = playlistsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PlaylistData[];
      setPlaylists(playlistsData);
      setFilteredPlaylists(playlistsData);
    }
    setPlaylistLoading(false);
  };

  async function deletePlaylist(id: string) {
    try {
      const playlistDoc = doc(db, "playlists", id);
      await deleteDoc(playlistDoc)
        .then(() => {
          toast.success("Successful Removed");
          const updatedPlaylists = playlists.filter(
            (playlist) => playlist.id != id
          );
          setPlaylists([...updatedPlaylists]);
          setFilteredPlaylists([...updatedPlaylists]);
          console.log(updatedPlaylists);
        })
        .catch((e) => {
          toast.error("Error while removing");
          console.log(e.message);
        });
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
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
    return <Loading />;
  }

  if (!user) {
    return (
      <>
        <main className="container flex flex-1 items-center justify-center  mx-auto px-4 py-8">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl text-center font-bold text-white mb-4"
          >
            Please log in or sign up to view your playlists.
          </motion.h2>
        </main>
      </>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex flex-col md:flex-row space-y-3 space-x-4 mb-4 items-center">
          <SearchBar onSearch={handleSearch} />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex justify-between items-center my-3">
          <h2 className="text-3xl font-bold text-white">Your Playlists</h2>
          <button
            className="btn btn-secondary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create New Playlist
          </button>
        </div>
        {playlistLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPlaylists.map((playlist) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                >
                  <Playlist
                    id={playlist.id}
                    name={playlist.name}
                    songCount={playlist.songs}
                    deletePlaylist={deletePlaylist}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.section>

      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePlaylist={fetchPlaylists}
      />
    </main>
  );
}
