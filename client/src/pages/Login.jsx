import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
try {
      const response = await axios.post("http://localhost:5000/login", { email, password });
      
      // SAVE TOKEN AND NAME
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("name", response.data.user.name); // <--- Add this line
      
      alert("Login Successful!");
      navigate("/"); 
    } catch (error) {
      alert("Login Failed: " + error.response.data.message);
    }
  };

  return (
    <div className="bg-slate-900 h-screen text-white flex justify-center items-center">
      <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-lg border border-slate-700 w-96 flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-green-500 text-center">Login</h1>
        
        <input className="p-2 rounded bg-slate-700 border-none focus:ring-2 focus:ring-green-500" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="p-2 rounded bg-slate-700 border-none focus:ring-2 focus:ring-green-500" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        
        <button className="bg-green-600 py-2 rounded font-bold hover:bg-green-500">Login</button>
        <p className="text-center text-slate-400">Don't have an account? <Link to="/signup" className="text-green-400">Sign Up</Link></p>
      </form>
    </div>
  );
}