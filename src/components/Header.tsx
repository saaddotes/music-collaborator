"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function Header() {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
      className="bg-purple-800 text-white p-4 shadow-lg"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          <motion.span
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            Music Collaborator
          </motion.span>
        </Link>
        <nav>
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex space-x-4"
          >
            {loading ? (
              <li>Loading...</li>
            ) : user ? (
              <>
                <li>Welcome, {user.email}</li>
                <li>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSignOut}
                    className="hover:text-purple-300 transition duration-300"
                  >
                    Sign Out
                  </motion.button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-purple-300 transition duration-300"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="hover:text-purple-300 transition duration-300"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </motion.ul>
        </nav>
      </div>
    </motion.header>
  );
}
