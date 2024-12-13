"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Music, Play, Plus } from "lucide-react";
import Link from "next/link";

interface PlaylistProps {
  id: string;
  name: string;
  songCount: number;
}

export default function Playlist({ id, name, songCount }: PlaylistProps) {
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
        className="absolute inset-0 bg-purple-600 bg-opacity-90 flex items-center justify-center space-x-4"
      >
        <Link href={`/playlist/${id}`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white text-purple-600 p-3 rounded-full"
          >
            <Play className="w-6 h-6" />
          </motion.button>
        </Link>
        <Link href={`/playlist/${id}`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="bg-white text-purple-600 p-3 rounded-full"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
}
