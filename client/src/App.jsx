import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from 'axios';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

export default function App() {
  // If we are in "production" (live), use the Render URL.
// If we are in "development" (your laptop), use localhost.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  );
}