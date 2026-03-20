import { useState } from 'react';

export default function AddTaskModal({ onAdd, onClose }) {
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onAdd(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-surface-container-lowest)]/80 backdrop-blur-md p-4">
      
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative rounded-3xl bg-[var(--color-surface-container)]/80 p-8 shadow-2xl backdrop-blur-3xl ghost-border overflow-hidden">
          
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-primary)]/20 rounded-full blur-[50px] pointer-events-none"></div>

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-[var(--color-outline)] hover:text-[var(--color-on-surface)] transition bg-white/5 hover:bg-[var(--color-surface-bright)] rounded-full"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>

          <h2 className="text-2xl font-headline font-extrabold tracking-tight text-[var(--color-on-surface)] mb-6">
            Create New Task
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-label uppercase tracking-widest text-[var(--color-on-surface-variant)] px-2">Task Title</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-outline-variant)] group-focus-within:text-[var(--color-primary)] transition-colors">title</span>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. Design meeting at 3 PM"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-14 bg-[var(--color-surface-container-lowest)]/40 rounded-xl ghost-border pl-12 pr-4 text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 border-none font-body transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-label uppercase tracking-widest text-[var(--color-on-surface-variant)] px-2">Description (Optional)</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-4 text-[var(--color-outline-variant)] group-focus-within:text-[var(--color-primary)] transition-colors">notes</span>
                <textarea
                  placeholder="Add any extra details here..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-24 bg-[var(--color-surface-container-lowest)]/40 rounded-xl ghost-border pl-12 pr-4 py-4 text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 border-none font-body transition-all resize-none scrollbar-thin"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-label uppercase tracking-widest text-[var(--color-on-surface-variant)] px-2">Priority</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-outline-variant)] group-focus-within:text-[var(--color-primary)] transition-colors pointer-events-none">flag</span>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full h-14 bg-[var(--color-surface-container-lowest)]/40 rounded-xl ghost-border pl-12 pr-10 text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 border-none font-body transition-all appearance-none"
                >
                  <option value="low" className="bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]">Low</option>
                  <option value="medium" className="bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]">Medium</option>
                  <option value="high" className="bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]">High</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-outline-variant)] pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={!formData.title.trim()}
                className="w-full h-14 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-dim)] text-[var(--color-on-primary)] font-headline font-semibold rounded-full shadow-[0_10px_25px_rgba(186,158,255,0.2)] hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">add_task</span>
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
