"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  doc,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import useAuth from "@/hooks/useAuth";
import AddSongModal from "@/components/AddSongModal";
import AddContributorModal from "@/components/AddContributorModal";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipForward, SkipBack, Trash2, Home } from "lucide-react";
import { toast } from "react-hot-toast";
import Loading from "@/components/Loading";
import CustomAlert from "@/components/CustomAlert";

interface Song {
  id: string;
  title: string;
  artist: string;
  addedBy: string;
  url: string;
}

interface Contributor {
  id: string;
  email: string;
}
interface PlaylistData {
  id: string;
  name: string;
  songs: number;
  lastPlayed?: Date;
}
export default function PlaylistDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<PlaylistData | null>(null);
  const [songs, setSongs] = useState<Song[] | []>([]);
  const [songsLoading, setSongsLoading] = useState(false);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isAddSongModalOpen, setIsAddSongModalOpen] = useState(false);
  const [isAddContributorModalOpen, setIsAddContributorModalOpen] =
    useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [songsAlert, setSongsAlert] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [usersAlert, setUsersAlert] = useState(false);

  function confrimSongs() {
    handleDeleteSong(selectedId);
  }

  function confrimUsers() {
    handleDeleteUser(selectedId);
  }

  // const [alertFunc, setAltFunc] = useState(() => console.log("Testing"));

  useEffect(() => {
    if (user && id) {
      const playlistRef = doc(db, "playlists", id as string);
      const unsubscribePlaylist = onSnapshot(playlistRef, (doc) => {
        if (doc.exists()) {
          setPlaylist({ id: doc.id, ...doc.data() } as PlaylistData);
        } else {
          toast.error("Playlist not found");
          router.push("/");
        }
      });

      const songsRef = collection(db, "playlists", id as string, "songs");
      const unsubscribeSongs = onSnapshot(songsRef, (snapshot) => {
        const songsData = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Song)
        );
        setSongs(songsData);
      });

      const contributorsRef = doc(db, "playlists", id as string);
      const unsubscribeContributors = onSnapshot(contributorsRef, (doc) => {
        if (doc.exists()) {
          const contributors = doc.data().contributors || [];
          setContributors(
            contributors.map((email: string, index: number) => ({
              id: index,
              email,
            }))
          );
        }
      });

      return () => {
        unsubscribePlaylist();
        unsubscribeSongs();
        unsubscribeContributors();
      };
    }
  }, [user, id, router]);

  const handleAddSong = async (song: {
    title: string;
    artist: string;
    url: string;
  }) => {
    if (user && id) {
      const toastId = toast.loading("Adding song...");
      try {
        const songsRef = collection(db, "playlists", id as string, "songs");
        await addDoc(songsRef, {
          ...song,
          addedBy: user.email,
          createdAt: new Date(),
        });
        const playlistRef = doc(db, "playlists", id as string);
        await updateDoc(playlistRef, {
          songs: songs.length + 1,
        });
        setIsAddSongModalOpen(false);
        toast.success("Song added successfully!", { id: toastId });
      } catch (error) {
        console.error("Error adding song:", error);
        toast.error("Failed to add song", { id: toastId });
      }
    }
  };

  const handleAddContributor = async (email: string) => {
    if (!user) {
      toast.error("You must be logged in to add a member.");
      return;
    }
    if (email.trim() && user) {
      const toastId = toast.loading("Adding contributor...");
      try {
        // Check if the user exists
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          toast.error("User not found", { id: toastId });
          return;
        }

        const playlistRef = doc(db, "playlists", id as string);
        await updateDoc(playlistRef, {
          contributors: arrayUnion(email),
        });

        toast.success("Contributor added successfully!", { id: toastId });
        setIsAddContributorModalOpen(false);
      } catch (error) {
        console.error("Error adding contributor:", error);
        toast.error("Failed to add contributor", { id: toastId });
      }
    } else {
      toast.error("Email cannot be empty.");
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
      audioRef.current.src = song.url;
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
      const toastId = toast.loading("Deleting song...");
      try {
        const songRef = doc(db, "playlists", id as string, "songs", songId);
        await deleteDoc(songRef);
        const playlistRef = doc(db, "playlists", id as string);
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
        toast.success("Song deleted successfully!", { id: toastId });
      } catch (error) {
        console.error("Error deleting song:", error);
        toast.error("Failed to delete song", { id: toastId });
      }
    }
    setSongsAlert(false);
  };

  const handleDeleteUser = async (userEmail: string) => {
    if (user && id) {
      const toastId = toast.loading("Deleting user...");
      const playlistRef = doc(db, "playlists", id as string);
      const data = await getDoc(playlistRef);
      try {
        const users = data.data()?.contributors;
        const filteredUsers = users?.filter(
          (email: string) => email != userEmail
        );
        await updateDoc(playlistRef, { contributors: filteredUsers });
        toast.success("User deleted successfully!", { id: toastId });
      } catch (error) {
        toast.success("Failed to delete user!", { id: toastId });
      }
    }

    setUsersAlert(false);
  };

  if (!playlist) {
    return <Loading />;
  }

  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-6"
        >
          <h1 className="text-4xl font-bold text-white">{playlist.name}</h1>
          <Link href="/" className="btn my-3">
            <Home className="mr-2" /> Back to Home
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8 bg-white rounded-lg shadow-lg p-4"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-4"
          >
            <div className="flex justify-between items-center border-b-2 mb-1">
              <h2 className="text-2xl font-semibold text-slate-500">Songs</h2>
              <button
                onClick={() => setIsAddSongModalOpen(true)}
                className="btn text-purple-600 my-3"
              >
                Add Song
              </button>
            </div>
            {songsLoading ? (
              <Loading />
            ) : (
              <div>
                {songs.length > 0 ? (
                  <ul>
                    <AnimatePresence>
                      {songs.map((song) => (
                        <motion.li
                          key={song.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="border-b last:border-b-0 flex justify-between items-center bg-white rounded-lg shadow-lg p-4 my-2"
                        >
                          <div>
                            <p className="font-semibold">{song.title}</p>
                            <p className="text-sm text-gray-600">
                              {song.artist}
                            </p>
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
                              onClick={() => {
                                setSelectedId(song?.id);
                                setSongsAlert(true);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                ) : (
                  <span>No Songs Available</span>
                )}
              </div>
            )}
          </motion.section>
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow-lg p-4"
          >
            <div className="flex justify-between items-center border-b-2 mb-1">
              <h2 className="text-2xl font-semibold text-slate-500">
                Contributors
              </h2>
              <button
                onClick={() => setIsAddContributorModalOpen(true)}
                className="btn text-purple-600 my-3"
              >
                Add Contributors
              </button>
            </div>
            <ul>
              <AnimatePresence>
                {contributors.map((contributor) => (
                  <motion.li
                    key={contributor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border-b last:border-b-0 py-4 flex justify-between items-center bg-white rounded-lg shadow-lg p-4 my-2"
                  >
                    <span>{contributor.email}</span>
                    <span>
                      {user?.email == contributor.email ? (
                        "admin"
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedId(contributor?.email);
                            setUsersAlert(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.section>
        </div>

        <AddSongModal
          isOpen={isAddSongModalOpen}
          onClose={() => setIsAddSongModalOpen(false)}
          onAddSong={handleAddSong}
        />

        <CustomAlert
          isOpen={songsAlert}
          onClose={() => setSongsAlert(false)}
          message={"Do you want to delete this song?"}
          onConfrim={confrimSongs}
        />

        <CustomAlert
          isOpen={usersAlert}
          message={"Do you want to delete this user?"}
          onClose={() => setUsersAlert(false)}
          onConfrim={confrimUsers}
        />

        <AddContributorModal
          isOpen={isAddContributorModalOpen}
          onClose={() => setIsAddContributorModalOpen(false)}
          onAddContributor={handleAddContributor}
        />
        <audio ref={audioRef} onEnded={handleNextSong} />
      </main>
    </>
  );
}
