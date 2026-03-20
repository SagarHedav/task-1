import { CheckCircle, Circle, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskCard({ task, onToggle, onDelete }) {
  const isCompleted = task.status === 'completed';

  return (
    <div
      className={`group relative flex flex-col gap-3 rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        isCompleted
          ? 'border-green-500/20 bg-green-950/20 shadow-green-900/10'
          : 'border-indigo-500/20 bg-gray-900 shadow-indigo-900/10'
      }`}
    >
      {/* Status badge */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
            isCompleted
              ? 'bg-green-500/15 text-green-400'
              : 'bg-indigo-500/15 text-indigo-400'
          }`}
        >
          {isCompleted ? (
            <CheckCircle size={12} />
          ) : (
            <Circle size={12} />
          )}
          {isCompleted ? 'Completed' : 'Pending'}
        </span>

        <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          {/* Toggle button */}
          <button
            onClick={() => onToggle(task.id)}
            title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
            className={`rounded-lg p-2 text-xs font-medium transition-all duration-200 ${
              isCompleted
                ? 'hover:bg-yellow-500/20 hover:text-yellow-400 text-gray-400'
                : 'hover:bg-green-500/20 hover:text-green-400 text-gray-400'
            }`}
          >
            {isCompleted ? <Circle size={16} /> : <CheckCircle size={16} />}
          </button>

          {/* Delete button */}
          <button
            onClick={() => onDelete(task.id)}
            title="Delete task"
            className="rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-red-500/20 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3
        className={`text-base font-semibold leading-snug transition-all ${
          isCompleted ? 'text-gray-400 line-through' : 'text-white'
        }`}
      >
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p
          className={`text-sm leading-relaxed ${
            isCompleted ? 'text-gray-600' : 'text-gray-400'
          }`}
        >
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="mt-auto flex items-center gap-1.5 pt-2 text-xs text-gray-600">
        <Clock size={11} />
        <span>{format(new Date(task.created_at), 'MMM d, yyyy · h:mm a')}</span>
      </div>
    </div>
  );
}
