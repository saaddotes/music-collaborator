"use client";

import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebase/firebaseConfig";
import { useRouter } from "next/navigation";

export default function Login() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error) {
      setError("Failed to log in. Please check your credentials." + error);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (error) {
      setError("Failed to create an account. Please try again." + error);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className=" text-center font-bold text-2xl mb-5">
          {" "}
          {isLogin ? "Login" : "Signup"}
        </h1>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            onClick={() => setIsLogin(true)}
            className={`btn btn-outline ${isLogin ? "btn-active" : ""}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`btn btn-outline ${!isLogin ? "btn-active" : ""}`}
          >
            Sigup
          </button>
        </div>
        {/* <h2 className="text-2xl font-bold mb-4">Login</h2> */}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={isLogin ? handleLogin : handleSignup}>
          {!isLogin && (
            <div className="mb-6">
              <label
                htmlFor="name"
                className="block text-gray-700 font-bold mb-2"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Saad Ali"
                className="input input-bordered input-primary w-full max-w-xs"
                required
              />
            </div>
          )}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block text-gray-700 font-bold mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="saad@example.com"
              className="input input-bordered input-primary w-full max-w-xs"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="******"
              className="input input-bordered input-primary w-full max-w-xs"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300"
          >
            {isLogin ? "Login" : "Signup"}
          </button>
        </form>
      </div>
    </div>
  );
}
