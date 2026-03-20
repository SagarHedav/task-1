import { formatDistanceToNow } from 'date-fns';

export default function TaskCard({ task, onToggle, onDelete }) {
  const isCompleted = task.status === 'completed';
  
  // Decide the glowing left border color based on status or priority
  const glowColor = isCompleted 
    ? 'border-l-[var(--color-tertiary-dim)]'
    : 'border-l-[var(--color-secondary-fixed)]';

  return (
    <div className={`relative flex items-center gap-4 rounded-3xl bg-[var(--color-surface-container)]/40 p-5 ghost-border shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:bg-[var(--color-surface-container)]/60 border-l-4 ${glowColor}`}>
      
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={`w-7 h-7 shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${
          isCompleted 
            ? 'bg-[var(--color-tertiary-dim)] border-[var(--color-tertiary-dim)] text-[var(--color-on-tertiary)]' 
            : 'border-[var(--color-outline)] hover:border-[var(--color-secondary-dim)] text-transparent'
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">check</span>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <h3 className={`truncate font-headline font-semibold text-lg transition-all ${isCompleted ? 'text-[var(--color-on-surface-variant)] opacity-50 line-through' : 'text-[var(--color-on-surface)]'}`}>
            {task.title}
          </h3>
          {!isCompleted && task.priority && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[8px] font-label font-bold uppercase tracking-widest ring-1 ring-inset inline-flex items-center gap-1 ${
              task.priority === 'high' 
                ? 'bg-[var(--color-error-container)]/20 text-[var(--color-error-dim)] ring-[var(--color-error-dim)]/30' 
              : task.priority === 'low'
                ? 'bg-[var(--color-surface-bright)]/50 text-[var(--color-outline-variant)] ring-[var(--color-outline-variant)]/30'
                : 'bg-[var(--color-surface-bright)] text-[var(--color-secondary-fixed)] ring-[var(--color-secondary-fixed)]/20'
            }`}>
              {task.priority === 'high' && <span className="w-1 h-1 rounded-full bg-[var(--color-error-dim)] animate-pulse"></span>}
              {task.priority} Priority
            </span>
          )}
        </div>
        {task.description && (
          <p className="mt-1 truncate text-sm font-body text-[var(--color-on-surface-variant)]">
            {task.description}
          </p>
        )}
      </div>

      {/* Right Meta & Actions */}
      <div className="flex items-center gap-4 shrink-0">
        <div className={`flex items-center gap-1.5 text-xs font-label font-medium uppercase tracking-widest transition-colors ${isCompleted ? 'text-[var(--color-on-surface-variant)] opacity-40' : 'text-[var(--color-on-surface-variant)] opacity-60'}`}>
          <span className="material-symbols-outlined text-[14px]">
            {isCompleted ? 'task_alt' : 'schedule'}
          </span>
          {isCompleted ? 'Done' : formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(task.id)}
          className="text-[var(--color-on-surface-variant)] opacity-40 hover:opacity-100 hover:text-[var(--color-error)] transition-all p-2 rounded-full hover:bg-[var(--color-error-container)]/20"
          aria-label="Delete task"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>

    </div>
  );
}
