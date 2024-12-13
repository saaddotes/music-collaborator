"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface PlaylistData {
  id: string;
  name: string;
  songs: number;
  lastPlayed?: Date;
}

interface RecentlyPlayedProps {
  playlists: PlaylistData[];
}

export default function RecentlyPlayed({ playlists }: RecentlyPlayedProps) {
  if (playlists.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-12"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Recently Played</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {playlists.map((playlist) => (
          <Link href={`/playlist/${playlist.id}`} key={playlist.id}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white rounded-lg shadow-lg p-4 w-48 flex-shrink-0"
            >
              <h3 className="font-semibold mb-2 truncate">{playlist.name}</h3>
              <p className="text-sm text-gray-600">{playlist.songs} songs</p>
              <p className="text-xs text-gray-500 mt-2">
                Last played: {playlist.lastPlayed?.toLocaleString()}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
