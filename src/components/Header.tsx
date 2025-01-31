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
      transition={{ duration: 0.5 }}
      className="sticky top-0 bg-purple-800 text-white p-4 shadow-lg"
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Music Collaborator
        </Link>
        <nav>
          <ul className="flex space-x-4 items-center">
            {loading ? (
              <li>Loading...</li>
            ) : user ? (
              <>
                <li className="hidden md:block">Welcome, {user.email}</li>
                <li>
                  <button
                    onClick={handleSignOut}
                    className="btn btn-outline text-white"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/login" className="btn btn-ghost text-lg">
                    Login
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </motion.header>
  );
}
