import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, startOfWeek, endOfMonth, endOfWeek, isSameMonth, isSameDay, addDays } from 'date-fns';
import { fetchEvents, createEvent, deleteEvent } from '../api/calendar';

export default function CalendarView({ user }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');

  useEffect(() => {
    if (user) loadEvents();
  }, [user]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await fetchEvents();
      const parsed = res.data.data.map(e => ({...e, event_date: new Date(e.event_date)}));
      setEvents(parsed);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const res = await createEvent({ title: newEventTitle, event_date: formattedDate });
      const newEv = { ...res.data.data, event_date: new Date(res.data.data.event_date) };
      setEvents(prev => [...prev, newEv]);
      setShowEventModal(false);
      setNewEventTitle('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  // Feature Locked State
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-[var(--color-primary)]/10 shadow-xl shadow-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 ghost-border">
          <span className="material-symbols-outlined text-[48px] text-[var(--color-primary)]">calendar_month</span>
        </div>
        <h2 className="text-3xl font-headline font-bold text-[var(--color-on-surface)] mb-3 tracking-tight">Premium Calendar</h2>
        <p className="max-w-md text-sm font-body text-[var(--color-on-surface-variant)] mb-8 leading-relaxed">
          Schedule tasks, set reminders, and manage your meetings with our advanced calendar view. 
          Available exclusively for registered workspaces.
        </p>
      </div>
    );
  }

  const selectedDateEvents = events.filter(e => isSameDay(e.event_date, selectedDate));

  return (
    <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Main Grid Area */}
      <div className="lg:col-span-2 rounded-3xl border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container)]/50 p-8 shadow-xl backdrop-blur-3xl ghost-border">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-headline font-bold text-[var(--color-on-surface)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--color-primary)] text-[24px]">calendar_today</span>
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] transition-colors border border-[var(--color-outline-variant)]/30">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-bright)] transition-colors border border-[var(--color-outline-variant)]/30">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-label uppercase tracking-widest text-[var(--color-on-surface-variant)] opacity-60 py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, i) => {
            const isCurrentMonth = isSameMonth(date, currentDate);
            const isToday = isSameDay(date, new Date());
            const isSelected = isSameDay(date, selectedDate);
            const hasEvents = events.some(e => isSameDay(e.event_date, date));

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`
                  relative flex h-14 sm:h-20 w-full flex-col items-center justify-center rounded-2xl text-sm font-headline font-medium transition-all duration-300
                  ${!isCurrentMonth ? 'text-[var(--color-outline-variant)] opacity-50' : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-bright)]/50'}
                  ${isSelected ? 'bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/50 text-[var(--color-primary)] shadow-inner' : 'border border-transparent'}
                  ${isToday && !isSelected ? 'bg-[var(--color-tertiary-dim)]/20 text-[var(--color-tertiary-dim)] border border-[var(--color-tertiary-dim)]/30 font-bold' : ''}
                `}
              >
                <span>{format(date, 'd')}</span>
                {hasEvents && (
                  <div className="absolute bottom-2 h-1.5 w-1.5 rounded-full bg-[var(--color-secondary)] shadow-[0_0_8px_var(--color-secondary)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Side Panel */}
      <div className="flex flex-col gap-4">
        <div className="rounded-3xl border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container)]/50 p-6 shadow-xl backdrop-blur-3xl ghost-border min-h-[500px] flex flex-col">
          
          <div className="mb-6 flex items-center justify-between border-b border-[var(--color-outline-variant)]/20 pb-6">
            <div>
              <h3 className="text-xl font-headline font-semibold text-[var(--color-on-surface)] tracking-tight">{format(selectedDate, 'EEEE')}</h3>
              <p className="text-sm font-label text-[var(--color-on-surface-variant)] opacity-60 tracking-wide">{format(selectedDate, 'MMMM d, yyyy')}</p>
            </div>
            <button
              onClick={() => setShowEventModal(true)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[0_4px_14px_rgba(186,158,255,0.25)] transition hover:scale-105 active:scale-95 hover:bg-[var(--color-primary-dim)]"
            >
              <span className="material-symbols-outlined text-[24px]">add</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 scrollbar-thin pr-2">
            {loading ? (
              <div className="flex justify-center py-10">
                <span className="material-symbols-outlined animate-spin text-[var(--color-primary)] text-2xl">progress_activity</span>
              </div>
            ) : selectedDateEvents.length === 0 ? (
               <div className="flex flex-col items-center justify-center text-[var(--color-outline-variant)] h-full opacity-60">
                 <span className="material-symbols-outlined text-[48px] mb-2">event_busy</span>
                 <p className="text-sm font-label">No schedule for today.</p>
               </div>
            ) : (
              selectedDateEvents.map(ev => (
                <div key={ev.id} className="group flex items-start justify-between gap-3 rounded-2xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)] p-4 transition-all hover:border-[var(--color-secondary)]/50 hover:bg-[var(--color-surface-container)]">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-secondary)] shadow-[0_0_8px_var(--color-secondary)]" />
                    <div>
                      <p className="text-sm font-headline font-semibold text-[var(--color-on-surface)] leading-tight">{ev.title}</p>
                      {ev.description && <p className="mt-2 text-xs font-body text-[var(--color-on-surface-variant)]">{ev.description}</p>}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteEvent(ev.id)} 
                    className="text-[var(--color-on-surface-variant)] opacity-0 group-hover:opacity-60 hover:opacity-100 hover:text-[var(--color-error)] transition-all p-2 rounded-full hover:bg-[var(--color-error-container)]/20"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-surface-container-lowest)]/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container)]/90 p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
            <h3 className="mb-1 text-2xl font-headline font-bold tracking-tight text-[var(--color-on-surface)]">Add Reminder</h3>
            <p className="mb-8 text-xs font-label uppercase tracking-widest text-[var(--color-on-surface-variant)]">For {format(selectedDate, 'MMM d, yyyy')}</p>
            <form onSubmit={handleAddEvent}>
              <div className="relative group mb-6">
                 <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-outline-variant)] group-focus-within:text-[var(--color-primary)] transition-colors">edit_calendar</span>
                 <input
                  autoFocus
                  placeholder="Meeting with John..."
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  className="w-full h-14 bg-[var(--color-surface-container-lowest)]/50 rounded-xl ghost-border pl-12 pr-4 text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 border border-transparent transition-all font-body text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowEventModal(false)} className="w-full rounded-full bg-[var(--color-surface-bright)] h-12 text-sm font-headline font-medium text-[var(--color-on-surface)] transition hover:bg-white/10 ghost-border">
                  Cancel
                </button>
                <button type="submit" disabled={!newEventTitle.trim()} className="w-full rounded-full bg-[var(--color-primary)] h-12 text-sm font-headline font-semibold text-[var(--color-on-primary)] transition hover:bg-[var(--color-primary-dim)] disabled:opacity-50">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
