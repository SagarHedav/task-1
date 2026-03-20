import { useState, useEffect, useCallback } from 'react';
import { Plus, CheckSquare, Loader2, AlertCircle, RefreshCw, ClipboardList, LogOut } from 'lucide-react';
import TaskCard from './components/TaskCard';
import AddTaskModal from './components/AddTaskModal';
import AuthPage from './components/AuthPage';
import { fetchTasks, createTask, toggleTask, deleteTask } from './api/tasks';
import { fetchCurrentUser } from './api/auth';

const FILTERS = ['All', 'Pending', 'Completed'];

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('All');

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('taskflow_token');
      if (token) {
        try {
          const res = await fetchCurrentUser(token);
          setUser(res.data.user);
        } catch {
          localStorage.removeItem('taskflow_token');
        }
      }
      setAuthChecking(false);
    };
    checkAuth();
  }, []);

  const loadTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchTasks();
      setTasks(res.data.data);
    } catch (err) {
      if (err?.response?.status === 401) {
        handleLogout();
      } else {
        setError('Could not connect to the API. Make sure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleLogout = () => {
    localStorage.removeItem('taskflow_token');
    setUser(null);
    setTasks([]);
  };

  const handleAdd = async (data) => {
    const res = await createTask(data);
    setTasks((prev) => [res.data.data, ...prev]);
  };

  const handleToggle = async (id) => {
    const res = await toggleTask(id);
    setTasks((prev) => prev.map((t) => (t.id === id ? res.data.data : t)));
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <Loader2 size={32} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLogin={(u) => setUser(u)} />;
  }

  const filtered = tasks.filter((t) => {
    if (filter === 'Pending') return t.status === 'pending';
    if (filter === 'Completed') return t.status === 'completed';
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero header */}
      <header className="relative overflow-hidden border-b border-gray-800/60 bg-gray-900/50 px-6 py-8 text-center backdrop-blur-sm">
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-indigo-700/20 blur-3xl" />

        {/* Top bar with username and logout */}
        <div className="absolute right-4 top-4 flex flex-col items-end sm:flex-row sm:items-center sm:gap-4 gap-2">
          <span className="text-sm font-medium text-gray-400">Hello, <span className="text-indigo-400">{user.username}</span></span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs text-gray-400 transition hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>

        <div className="relative mt-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-900/50">
            <ClipboardList size={26} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Task<span className="text-indigo-400">Flow</span>
          </h1>

          {/* Stats */}
          {!loading && !error && (
            <div className="mt-5 flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{tasks.length}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="h-8 w-px bg-gray-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-400">{pendingCount}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div className="h-8 w-px bg-gray-700" />
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{completedCount}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1 rounded-xl bg-gray-900 p-1 border border-gray-800">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  filter === f
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadTasks}
              className="rounded-xl border border-gray-800 p-2.5 text-gray-500 transition hover:border-indigo-500/40 hover:text-indigo-400"
              title="Refresh tasks"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-900/40 transition hover:bg-indigo-500 active:scale-95"
            >
              <Plus size={16} /> Add Task
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-gray-500">
            <Loader2 size={32} className="animate-spin text-indigo-500" />
            <p className="text-sm">Loading tasks…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-red-500/20 bg-red-950/20 py-16 px-6 text-center">
            <AlertCircle size={36} className="text-red-400" />
            <div>
              <p className="font-medium text-red-300">Connection Error</p>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
            </div>
            <button
              onClick={loadTasks}
              className="flex items-center gap-2 rounded-lg bg-red-600/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-600/30"
            >
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <CheckSquare size={40} className="text-gray-700" />
            <p className="text-gray-500">
              {filter === 'All' ? 'No tasks yet. Click "Add Task" to get started!' : `No ${filter.toLowerCase()} tasks.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <AddTaskModal onAdd={handleAdd} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
