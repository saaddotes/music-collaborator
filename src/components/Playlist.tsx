"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Music, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface PlaylistProps {
  id: string;
  name: string;
  songCount: number;
  deletePlaylist: (id: string) => void;
}

export default function Playlist({
  id,
  name,
  songCount,
  deletePlaylist,
}: PlaylistProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-lg shadow-lg p-6 cursor-pointer relative overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-xl font-semibold mb-2">{name}</h3>
        <p className="text-gray-600 flex items-center">
          <Music className="w-4 h-4 mr-2" />
          {songCount} {songCount === 1 ? "song" : "songs"}
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent to-purple-300 bg-opacity-90 flex gap-2 items-center justify-end pe-5"
      >
        <Link href={`/playlist/${id}`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-purple-400 bg-white  p-3 rounded-full"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </Link>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => deletePlaylist(id)}
          className="text-red-600 bg-white  p-3 rounded-full"
        >
          <Trash2 size={20} />
        </motion.button>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-purple-300 bg-opacity-90 flex md:hidden gap-2 items-center justify-end pe-5">
        <Link href={`/playlist/${id}`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-purple-400 bg-white  p-3 rounded-full"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </Link>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => deletePlaylist(id)}
          className="text-red-600 bg-white  p-3 rounded-full"
        >
          <Trash2 size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
}
