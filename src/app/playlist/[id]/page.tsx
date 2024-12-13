"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  doc,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import useAuth from "@/hooks/useAuth";
import Header from "@/components/Header";
import AddSongModal from "@/components/AddSongModal";
import AddContributorModal from "@/components/AddContributorModal";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Trash2 } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string;
  addedBy: string;
  url?: string;
}

interface Contributor {
  id: string;
  email: string;
}

export default function PlaylistDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [isAddContributorModalOpen, setIsAddContributorModalOpen] =
    useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (user && id) {
      const playlistRef = doc(db, "users", user.uid, "playlists", id as string);
      const unsubscribePlaylist = onSnapshot(playlistRef, (doc) => {
        if (doc.exists()) {
          setPlaylist({ id: doc.id, ...doc.data() });
        }
      });

      const songsRef = collection(
        db,
        "users",
        user.uid,
        "playlists",
        id as string,
        "songs"
      );
      const unsubscribeSongs = onSnapshot(songsRef, (snapshot) => {
        const songsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Song)
        );
        setSongs(songsData);
      });

      const contributorsRef = collection(
        db,
        "users",
        user.uid,
        "playlists",
        id as string,
        "contributors"
      );
      const unsubscribeContributors = onSnapshot(
        contributorsRef,
        (snapshot) => {
          const contributorsData = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Contributor)
          );
          setContributors(contributorsData);
        }
      );

      return () => {
        unsubscribePlaylist();
        unsubscribeSongs();
        unsubscribeContributors();
      };
    }
  }, [user, id]);

  const handleAddSong = async (song: {
    title: string;
    artist: string;
    url?: string;
  }) => {
    if (user && id) {
      const songsRef = collection(
        db,
        "users",
        user.uid,
        "playlists",
        id as string,
        "songs"
      );
      await addDoc(songsRef, {
        ...song,
        addedBy: user.email,
        createdAt: new Date(),
      });
      const playlistRef = doc(db, "users", user.uid, "playlists", id as string);
      await updateDoc(playlistRef, {
        songs: songs.length + 1,
      });
      setIsAddSongModalOpen(false);
    }
  };

  const handleAddContributor = async (email: string) => {
    if (user && id) {
      const contributorsRef = collection(
        db,
        "users",
        user.uid,
        "playlists",
        id as string,
        "contributors"
      );
      await addDoc(contributorsRef, {
        email,
        addedAt: new Date(),
      });
      setIsAddContributorModalOpen(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSongSelect = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = song.url || "";
      audioRef.current.play();
    }
  };

  const handleNextSong = () => {
    if (currentSong) {
      const currentIndex = songs.findIndex(
        (song) => song.id === currentSong.id
      );
      const nextSong = songs[(currentIndex + 1) % songs.length];
      handleSongSelect(nextSong);
    }
  };

  const handlePreviousSong = () => {
    if (currentSong) {
      const currentIndex = songs.findIndex(
        (song) => song.id === currentSong.id
      );
      const previousSong =
        songs[(currentIndex - 1 + songs.length) % songs.length];
      handleSongSelect(previousSong);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (user && id) {
      const songRef = doc(
        db,
        "users",
        user.uid,
        "playlists",
        id as string,
        "songs",
        songId
      );
      await deleteDoc(songRef);
      const playlistRef = doc(db, "users", user.uid, "playlists", id as string);
      await updateDoc(playlistRef, {
        songs: songs.length - 1,
      });
      if (currentSong && currentSong.id === songId) {
        setCurrentSong(null);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = "";
        }
      }
    }
  };

  if (!playlist) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-600">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-6"
        >
          {playlist.name}
        </motion.h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-white mb-4">Songs</h2>
            <button
              onClick={() => setIsAddSongModalOpen(true)}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg mb-4 hover:bg-purple-100 transition duration-300"
            >
              Add Song
            </button>
            <ul className="bg-white rounded-lg shadow-lg p-4">
              <AnimatePresence>
                {songs.map((song) => (
                  <motion.li
                    key={song.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border-b last:border-b-0 py-2 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-semibold">{song.title}</p>
                      <p className="text-sm text-gray-600">{song.artist}</p>
                      <p className="text-xs text-gray-500">
                        Added by: {song.addedBy}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSongSelect(song)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <Play size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteSong(song.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.section>
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-white mb-4">
              Contributors
            </h2>
            <button
              onClick={() => setIsAddContributorModalOpen(true)}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg mb-4 hover:bg-purple-100 transition duration-300"
            >
              Add Contributor
            </button>
            <ul className="bg-white rounded-lg shadow-lg p-4">
              <AnimatePresence>
                {contributors.map((contributor) => (
                  <motion.li
                    key={contributor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border-b last:border-b-0 py-2"
                  >
                    {contributor.email}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.section>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-white rounded-lg shadow-lg p-4"
        >
          <h2 className="text-2xl font-semibold mb-4">Now Playing</h2>
          {currentSong ? (
            <div>
              <p className="font-semibold">{currentSong.title}</p>
              <p className="text-sm text-gray-600">{currentSong.artist}</p>
              <div className="flex items-center justify-center space-x-4 mt-4">
                <button
                  onClick={handlePreviousSong}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <SkipBack size={24} />
                </button>
                <button
                  onClick={handlePlayPause}
                  className="text-purple-600 hover:text-purple-800"
                >
                  {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                </button>
                <button
                  onClick={handleNextSong}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <SkipForward size={24} />
                </button>
              </div>
            </div>
          ) : (
            <p>No song selected</p>
          )}
        </motion.div>
      </main>
      <AddSongModal
        isOpen={isAddSongModalOpen}
        onClose={() => setIsAddSongModalOpen(false)}
        onAddSong={handleAddSong}
      />
      <AddContributorModal
        isOpen={isAddContributorModalOpen}
        onClose={() => setIsAddContributorModalOpen(false)}
        onAddContributor={handleAddContributor}
      />
      <audio ref={audioRef} onEnded={handleNextSong} />
    </div>
  );
}
