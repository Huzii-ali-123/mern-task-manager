import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [file, setFile] = useState(null);
  const [userName, setUserName] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  // --- HELPER: Get Config with Token ---
  const getConfig = () => {
    const token = localStorage.getItem("token");
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");

    if (!token) {
      navigate("/login"); // Kick them out if no token
      return;
    }
    setUserName(name);
    
    const fetchTasks = async () => {
      try {
        // We now pass getConfig() to show the badge
        const response = await axios.get("/tasks", getConfig());
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        if (error.response.status === 401) handleLogout(); // Token expired? Logout.
      }
    };
    fetchTasks();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    navigate("/login");
  };

  const addTask = async () => {
    if (!newTask) return;
    const formData = new FormData();
    formData.append("title", newTask);
    if (file) formData.append("image", file);

    try {
      // Pass getConfig() here too
      const response = await axios.post("http://localhost:5000/tasks", formData, getConfig());
      setTasks([...tasks, response.data]);
      setNewTask("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const toggleTask = async (id) => {
    try {
      const response = await axios.put(`http://localhost:5000/tasks/${id}`, {}, getConfig());
      setTasks(tasks.map(t => t._id === id ? response.data : t));
    } catch (error) { console.error(error); }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/tasks/${id}`, getConfig());
      setTasks(tasks.filter(t => t._id !== id));
    } catch (error) { console.error(error); }
  };

  return (
    <div className="bg-slate-900 min-h-screen text-white flex flex-col items-center py-10">
      <div className="w-full max-w-xl flex justify-between items-center mb-10 px-4">
        <h1 className="text-3xl font-bold text-blue-500">Huzaifa's Task Manager</h1>
        <div className="flex items-center gap-4">
            <span className="text-green-400 font-bold">Hello, {userName}!</span>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-500 text-sm px-4 py-2 rounded font-bold">Logout</button>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-8 w-80">
        <input type="text" className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" placeholder="Task Title..." value={newTask} onChange={(e) => setNewTask(e.target.value)} />
        <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
        <button onClick={addTask} className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg font-bold transition">Add Task</button>
      </div>

      <div className="w-96 flex flex-col gap-4">
        {tasks.map((task) => (
          <div key={task._id} className={`p-4 rounded-lg border flex flex-col gap-3 transition-all ${task.isCompleted ? "bg-slate-900 border-slate-700 opacity-50" : "bg-slate-800 border-slate-600"}`}>
            <div className="flex justify-between items-center">
              <span onClick={() => toggleTask(task._id)} className={`cursor-pointer select-none font-bold text-lg ${task.isCompleted ? "line-through text-slate-500" : ""}`}>{task.title}</span>
              <button onClick={() => deleteTask(task._id)} className="text-red-500">🗑️</button>
            </div>
            {task.image && <img src={axios.defaults.baseURL + task.image} alt="attachment" className="w-full h-40 object-cover rounded-md border border-slate-700" />}
          </div>
        ))}
        {tasks.length === 0 && <p className="text-center text-slate-500">No tasks found for you.</p>}
      </div>
    </div>
  )
}