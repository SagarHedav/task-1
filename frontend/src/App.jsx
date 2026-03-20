import { useState, useEffect, useCallback } from 'react';
import TaskCard from './components/TaskCard';
import AddTaskModal from './components/AddTaskModal';
import AuthPage from './components/AuthPage';
import CalendarView from './components/CalendarView';
import { fetchTasks, createTask, toggleTask, deleteTask } from './api/tasks';
import { fetchCurrentUser } from './api/auth';

const FILTERS = ['All', 'Pending', 'Completed'];

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  
  // Navigation
  const [currentTab, setCurrentTab] = useState('Tasks');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // App State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    setLoading(true);
    setError('');
    
    if (user) {
      try {
        const res = await fetchTasks();
        setTasks(res.data.data);
      } catch (err) {
        if (err?.response?.status === 401) {
          handleLogout();
        } else {
          setError('Could not connect to the API.');
        }
      }
    } else {
      const stored = localStorage.getItem('guest_tasks');
      setTasks(stored ? JSON.parse(stored) : []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authChecking) loadTasks();
  }, [loadTasks, authChecking]);

  useEffect(() => {
    if (!authChecking && !user && !loading) {
      localStorage.setItem('guest_tasks', JSON.stringify(tasks));
    }
  }, [tasks, user, authChecking, loading]);

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('taskflow_token');
    setUser(null);
    setCurrentTab('Tasks');
    const stored = localStorage.getItem('guest_tasks');
    setTasks(stored ? JSON.parse(stored) : []);
  };

  const handleAdd = async (data) => {
    if (user) {
      const res = await createTask(data);
      setTasks((prev) => [res.data.data, ...prev]);
    } else {
      const newTask = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description || '',
        status: data.status || 'pending',
        priority: data.priority || 'medium',
        created_at: new Date().toISOString()
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleToggle = async (id) => {
    if (user) {
      const res = await toggleTask(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? res.data.data : t)));
    } else {
      setTasks(prev => prev.map(t => 
        t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t
      ));
    }
  };

  const handleDelete = async (id) => {
    if (user) {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">autorenew</span>
      </div>
    );
  }

  let filtered = tasks.filter((t) => {
    if (filter === 'Pending') return t.status === 'pending';
    if (filter === 'Completed') return t.status === 'completed';
    return true;
  });

  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(q) || 
      (t.description && t.description.toLowerCase().includes(q))
    );
  }

  filtered.sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'date_asc') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'priority_high') {
       const priorities = { high: 3, medium: 2, low: 1 };
       const pA = priorities[a.priority] || priorities.medium;
       const pB = priorities[b.priority] || priorities.medium;
       if (pA !== pB) return pB - pA;
       // Tiebreaker: date
       return new Date(b.created_at) - new Date(a.created_at);
    }
    return 0;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);

  return (
    <div className="min-h-screen flex bg-background font-body text-on-background selection:bg-primary-container selection:text-on-primary-container relative">
      
      {/* Background Liquid Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="liquid-orb w-[600px] h-[600px] bg-[var(--color-orb-1)]/10 -top-20 -left-20"></div>
        <div className="liquid-orb w-[800px] h-[800px] bg-[var(--color-orb-2)]/10 -bottom-40 right-0"></div>
        <div className="liquid-orb w-[400px] h-[400px] bg-[var(--color-orb-3)]/10 top-1/4 left-1/3"></div>
      </div>

      {showAuthModal && (
        <AuthPage 
          onLogin={handleLoginSuccess} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-[var(--color-surface-container-low)]/80 backdrop-blur-xl border-r border-[var(--color-outline-variant)]/30 flex flex-col z-20 sticky top-0 h-screen hidden md:flex">
        {/* Logo */}
        <div className="h-20 flex items-center px-6">
          <span className="text-xl font-medium bg-gradient-to-r from-indigo-300 to-[var(--color-primary)] bg-clip-text text-transparent font-headline tracking-tight">
            Liquid Intelligence
          </span>
        </div>

        {/* Profile/Workspace */}
        <div className="px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-tertiary-container)] text-[var(--color-on-tertiary-container)] flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined filled">verified</span>
          </div>
          <div className="overflow-hidden">
            <p className="font-headline font-bold text-[var(--color-on-surface)] truncate">
              {user ? user.username : 'Guest Session'}
            </p>
            <p className="text-[10px] font-label text-[var(--color-on-surface-variant)] uppercase tracking-widest truncate">
              {user ? 'Premium Workspace' : 'Local Storage Only'}
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="px-4 mt-6 flex-1 space-y-1">
          <button 
            onClick={() => setCurrentTab('Tasks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all ${
              currentTab === 'Tasks' 
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' 
                : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">task_alt</span>
            Tasks
          </button>
          
          <button 
            onClick={() => setCurrentTab('Calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium transition-all ${
              currentTab === 'Calendar' 
                ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' 
                : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-white/5'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            Calendar
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-[20px]">analytics</span>
            Analytics
          </button>
          
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-full text-sm font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            Settings
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="p-6">
          <button
            onClick={() => setShowTaskModal(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-primary)]/10 hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)] transition-all font-headline font-semibold text-sm shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add New Task
          </button>

          <div className="mt-8 flex flex-col gap-3">
            <a href="#" className="flex items-center gap-2 text-xs font-label text-[var(--color-outline-variant)] hover:text-[var(--color-primary)] transition-colors">
              <span className="material-symbols-outlined text-[14px]">help</span> Help
            </a>
            <a href="#" className="flex items-center gap-2 text-xs font-label text-[var(--color-outline-variant)] hover:text-[var(--color-primary)] transition-colors">
              <span className="material-symbols-outlined text-[14px]">shield</span> Privacy
            </a>
            <p className="mt-4 text-[9px] uppercase tracking-widest text-[var(--color-outline-variant)]/60">
              © 2024 Liquid Intelligence
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-h-screen relative z-10">
        
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-[var(--color-outline-variant)]/10 bg-transparent">
          
          <div className="flex items-center gap-6 ml-auto">
            <button className="text-[var(--color-outline)] hover:text-[var(--color-on-surface)] transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button 
              onClick={() => document.documentElement.classList.toggle('dark')}
              className="text-[var(--color-outline)] hover:text-[var(--color-on-surface)] transition-colors"
            >
              <span className="material-symbols-outlined">contrast</span>
            </button>
            
            {user ? (
              <button onClick={handleLogout} className="text-sm font-headline font-semibold px-5 py-2 rounded-full bg-[var(--color-error-container)]/20 text-[var(--color-error-dim)] hover:bg-[var(--color-error-container)]/40 transition-colors">
                Log Out
              </button>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="text-sm font-headline font-semibold px-5 py-2 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-dim)] shadow-[0_4px_14px_rgba(186,158,255,0.25)] transition-colors">
                Sign In
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 max-w-5xl mx-auto w-full flex-1">
          
          {currentTab === 'Calendar' ? (
            <CalendarView user={user} />
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Guest / Sync Banner */}
              {!user && (
                <div className="bg-[var(--color-surface-container)]/30 backdrop-blur-3xl rounded-3xl p-6 ghost-border flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between shadow-2xl shadow-[var(--color-primary)]/5 border-l-4 border-l-[var(--color-secondary-dim)]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-surface-bright)] text-[var(--color-secondary-dim)] flex items-center justify-center shadow-inner">
                      <span className="material-symbols-outlined filled">cloud_off</span>
                    </div>
                    <div>
                      <h3 className="font-headline font-semibold text-lg text-[var(--color-on-surface)]">Guest Mode: Smart Sync</h3>
                      <p className="text-sm font-body text-[var(--color-on-surface-variant)] mt-1 max-w-lg leading-relaxed">
                        Your data is stored locally on this device. Sign in to enable cloud synchronization across all platforms.
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowAuthModal(true)} className="px-6 py-2.5 rounded-full border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:bg-[var(--color-primary)]/10 text-sm font-headline font-medium transition-all shrink-0">
                    Learn More
                  </button>
                </div>
              )}

              {/* Titling Header -> Replaced with Workspace Overview & Live Velocity */}
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Workspace Overview Box */}
                <div className="flex-1 bg-[var(--color-surface-container)]/60 backdrop-blur-3xl rounded-[2rem] p-8 ghost-border shadow-xl relative overflow-hidden flex flex-col justify-center">
                  <span className="material-symbols-outlined absolute -right-6 -top-12 text-[200px] text-black/20 rotate-12 pointer-events-none select-none">task_alt</span>
                  <div className="relative z-10">
                    <h2 className="text-3xl sm:text-4xl font-headline font-bold text-[var(--color-on-surface)] tracking-tight">Workspace Overview</h2>
                    <p className="mt-2 text-[var(--color-on-surface-variant)] font-body text-base">
                      You've completed <span className="font-semibold text-[var(--color-primary)]">{completedCount}/{totalTasks}</span> tasks this week. Keep the momentum!
                    </p>
                    <div className="mt-8 h-2.5 w-full max-w-xl rounded-full bg-black/40 overflow-hidden shadow-inner">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-1000 ease-out relative"
                        style={{ width: `${completionPercentage}%` }}
                      >
                         <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 blur-[2px]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Velocity Box */}
                <div className="w-full lg:w-72 shrink-0 bg-[var(--color-surface-container)]/60 backdrop-blur-3xl rounded-[2rem] p-6 ghost-border shadow-xl flex flex-col justify-between">
                  <p className="text-[10px] font-headline uppercase tracking-widest text-[var(--color-secondary)] font-bold">Live Velocity</p>
                  
                  <div className="flex items-end gap-3 mt-2">
                    <span className="text-5xl font-headline font-extrabold text-[var(--color-on-surface)] tracking-tighter leading-none">{completionPercentage}%</span>
                    <span className="text-sm font-label font-semibold text-emerald-400 mb-1 flex items-center">
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span> 12%
                    </span>
                  </div>

                  {/* Aesthetic Mini Bar Chart */}
                  <div className="flex items-end gap-1.5 h-12 mt-6">
                    <div className="w-full bg-[var(--color-primary-dim)]/50 rounded-sm h-[40%] hover:h-[50%] transition-all"></div>
                    <div className="w-full bg-[var(--color-primary-dim)]/70 rounded-sm h-[60%] hover:h-[70%] transition-all"></div>
                    <div className="w-full bg-[var(--color-primary-dim)]/60 rounded-sm h-[50%] hover:h-[60%] transition-all"></div>
                    <div className="w-full bg-[var(--color-primary)] rounded-sm h-[90%] shadow-[0_0_10px_var(--color-primary)] hover:h-[100%] transition-all"></div>
                    <div className="w-full bg-[var(--color-primary-dim)]/80 rounded-sm h-[70%] hover:h-[80%] transition-all"></div>
                  </div>
                </div>

              </div>

              {/* Tabs & Filters Area Tabs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                {/* Left Tabs */}
                <div className="flex items-center gap-1 bg-[var(--color-surface-container-low)] inline-flex p-1.5 rounded-full border border-[var(--color-outline-variant)]/20 shadow-inner">
                  {FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                        filter === f
                          ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md'
                          : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-outline-variant)] text-[18px]">search</span>
                    <input 
                      type="text" 
                      placeholder="Search tasks..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-40 sm:w-56 px-5 py-2.5 pl-11 rounded-full border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container)]/30 hover:bg-[var(--color-surface-container)]/80 text-[var(--color-on-surface)] placeholder:text-[var(--color-outline-variant)] text-sm font-headline font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/50 transition-all shadow-sm"
                    />
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowSortMenu(!showSortMenu)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container)]/30 hover:bg-[var(--color-surface-container)]/80 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] text-sm font-headline font-semibold transition-all shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">sort</span>
                      Sort
                    </button>

                    {showSortMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-[var(--color-surface-container-high)] rounded-2xl shadow-xl border border-[var(--color-outline-variant)]/30 overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-100">
                        <button onClick={() => { setSortBy('date_desc'); setShowSortMenu(false); }} className={`w-full text-left px-4 py-3 text-sm flex justify-between items-center transition-colors ${sortBy === 'date_desc' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)] hover:bg-white/5'}`}>
                          Date (Newest) {sortBy === 'date_desc' && <span className="material-symbols-outlined text-[16px]">check</span>}
                        </button>
                        <button onClick={() => { setSortBy('date_asc'); setShowSortMenu(false); }} className={`w-full text-left px-4 py-3 text-sm flex justify-between items-center transition-colors ${sortBy === 'date_asc' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)] hover:bg-white/5'}`}>
                          Date (Oldest) {sortBy === 'date_asc' && <span className="material-symbols-outlined text-[16px]">check</span>}
                        </button>
                        <button onClick={() => { setSortBy('priority_high'); setShowSortMenu(false); }} className={`w-full text-left px-4 py-3 text-sm flex justify-between items-center transition-colors ${sortBy === 'priority_high' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'text-[var(--color-on-surface-variant)] hover:bg-white/5'}`}>
                          Priority (High) {sortBy === 'priority_high' && <span className="material-symbols-outlined text-[16px]">check</span>}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Task List */}
              <div className="space-y-4">
                {filtered.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}

                {filtered.length === 0 && (
                  <div className="w-full border border-dashed border-[var(--color-outline-variant)]/50 rounded-2xl p-12 flex flex-col items-center justify-center text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container)]/10">
                     <span className="material-symbols-outlined text-4xl mb-3 text-[var(--color-outline)]">checklist</span>
                     <p>No tasks found for this view.</p>
                  </div>
                )}
              </div>

              {/* Add Task Button (Restored) */}
              <div className="pt-8 pb-4 w-full">
                <button 
                  onClick={() => setShowTaskModal(true)}
                  className="w-full relative flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-[var(--color-outline-variant)] bg-transparent py-10 group transition-all hover:bg-[var(--color-surface-container)]/20 hover:border-[var(--color-outline)]"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--color-surface-container)] shadow-sm group-hover:shadow-lg flex items-center justify-center transition-all group-hover:scale-110">
                    <span className="material-symbols-outlined text-2xl text-[var(--color-on-surface-variant)]">add</span>
                  </div>
                  <span className="text-sm font-headline font-semibold text-[var(--color-on-surface-variant)] opacity-80">Add a new task...</span>
                </button>
              </div>
                
              <div className="mt-8 flex justify-end gap-6 text-[10px] font-label uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-60">
                <span className="text-[var(--color-secondary-dim)] font-medium">Cloud Sync: {user ? 'Active' : 'Guest'}</span>
                <span>System Status</span>
              </div>
            </div>
          )}

        </div>
      </main>

      {showTaskModal && (
        <AddTaskModal onAdd={handleAdd} onClose={() => setShowTaskModal(false)} />
      )}
    </div>
  );
}
