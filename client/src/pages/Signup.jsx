import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/register", { name, email, password });
      alert("Registration Successful! Now Login.");
      navigate("/login"); // Send user to login page
    } catch (error) {
      alert("Signup Failed: " + error.response.data.message);
    }
  };

  return (
    <div className="bg-slate-900 h-screen text-white flex justify-center items-center">
      <form onSubmit={handleSignup} className="bg-slate-800 p-8 rounded-lg border border-slate-700 w-96 flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-blue-500 text-center">Sign Up</h1>
        
        <input className="p-2 rounded bg-slate-700 border-none focus:ring-2 focus:ring-blue-500" type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="p-2 rounded bg-slate-700 border-none focus:ring-2 focus:ring-blue-500" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="p-2 rounded bg-slate-700 border-none focus:ring-2 focus:ring-blue-500" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        
        <button className="bg-blue-600 py-2 rounded font-bold hover:bg-blue-500">Sign Up</button>
        <p className="text-center text-slate-400">Already have an account? <Link to="/login" className="text-blue-400">Login</Link></p>
      </form>
    </div>
  );
}