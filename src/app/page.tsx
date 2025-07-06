'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, CheckIcon, XMarkIcon, ChevronDownIcon, ClockIcon, PlayIcon, CalendarIcon, UserIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

interface Todo {
  id: string;
  text: string;
  status: 'pending' | 'in-progress' | 'done';
  createdAt: Date;
  tags: string[];
  startDate?: string;
  deadline?: string;
  assignee?: string;
}

type FilterType = 'all' | 'pending' | 'in-progress' | 'done';
type TagFilterType = 'all' | string;

const AVAILABLE_TAGS = [
  { id: 'work', label: 'Work', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { id: 'personal', label: 'Personal', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { id: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { id: 'shopping', label: 'Shopping', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { id: 'health', label: 'Health', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
  { id: 'finance', label: 'Finance', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
];

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    icon: ClockIcon,
    bgColor: 'bg-gray-50 dark:bg-gray-800',
    textColor: 'text-gray-600 dark:text-gray-300',
    chartColor: '#6B7280'
  },
  'in-progress': {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: PlayIcon,
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    textColor: 'text-blue-600 dark:text-blue-400',
    chartColor: '#3B82F6'
  },
  done: {
    label: 'Done',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: CheckIcon,
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    textColor: 'text-green-600 dark:text-green-400',
    chartColor: '#10B981'
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
};

// Helper function to check if deadline is overdue
const isOverdue = (deadline: string) => {
  return new Date(deadline) < new Date();
};

// Helper function to get days until deadline
const getDaysUntilDeadline = (deadline: string) => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Donut Chart Component
const DonutChart = ({ todos }: { todos: Todo[] }) => {
  const total = todos.length;
  if (total === 0) return null;

  const pending = todos.filter(t => t.status === 'pending').length;
  const inProgress = todos.filter(t => t.status === 'in-progress').length;
  const done = todos.filter(t => t.status === 'done').length;

  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  
  const pendingAngle = (pending / total) * 360;
  const inProgressAngle = (inProgress / total) * 360;
  const doneAngle = (done / total) * 360;

  const inProgressOffset = pendingAngle;
  const doneOffset = pendingAngle + inProgressAngle;

  const completionPercentage = Math.round((done / total) * 100);

  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/20 p-8 mb-8 transition-all duration-300">
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 text-center">Progress Overview</h3>
      
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <svg width="140" height="140" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#E2E8F0"
              className="dark:stroke-slate-600"
              strokeWidth={strokeWidth}
            />
            
            {/* Done segment */}
            {done > 0 && (
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={STATUS_CONFIG.done.chartColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (doneAngle / 360) * circumference}
                strokeLinecap="round"
                transform="rotate(0 70 70)"
              />
            )}
            
            {/* In Progress segment */}
            {inProgress > 0 && (
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={STATUS_CONFIG['in-progress'].chartColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (inProgressAngle / 360) * circumference}
                strokeLinecap="round"
                transform={`rotate(${doneOffset} 70 70)`}
              />
            )}
            
            {/* Pending segment */}
            {pending > 0 && (
              <circle
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={STATUS_CONFIG.pending.chartColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (pendingAngle / 360) * circumference}
                strokeLinecap="round"
                transform={`rotate(${doneOffset + inProgressOffset} 70 70)`}
              />
            )}
          </svg>
          
          {/* Center percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">{completionPercentage}%</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-6 text-center">
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-slate-500 mb-2 shadow-sm"></div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{pending}</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-blue-500 mb-2 shadow-sm"></div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">In Progress</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{inProgress}</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-4 h-4 rounded-full bg-green-500 mb-2 shadow-sm"></div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">Done</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{done}</div>
        </div>
      </div>
    </div>
  );
};

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [assignee, setAssignee] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [tagFilter, setTagFilter] = useState<TagFilterType>('all');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map((todo: { id: string; text: string; status?: string; completed?: boolean; createdAt: string; tags?: string[]; startDate?: string; deadline?: string; assignee?: string }) => {
        // Handle migration from old completed property to new status property
        let status: Todo['status'] = 'pending';
        if (todo.status) {
          status = todo.status as Todo['status'];
        } else if (todo.completed) {
          status = 'done';
        }
        
        return {
          ...todo,
          status,
          createdAt: new Date(todo.createdAt),
          tags: todo.tags || [],
          startDate: todo.startDate || undefined,
          deadline: todo.deadline || undefined,
          assignee: todo.assignee || undefined
        };
      });
      setTodos(parsedTodos);
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Save dark mode preference and update DOM
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        status: 'pending',
        createdAt: new Date(),
        tags: selectedTags,
        startDate: startDate || undefined,
        deadline: deadline || undefined,
        assignee: assignee.trim() || undefined
      };
      setTodos([todo, ...todos]);
      setNewTodo('');
      setSelectedTags([]);
      setStartDate('');
      setDeadline('');
      setAssignee('');
    }
  };

  const updateTodoStatus = (id: string, newStatus: Todo['status']) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, status: newStatus } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => todo.status !== 'done'));
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const getTagInfo = (tagId: string) => {
    return AVAILABLE_TAGS.find(tag => tag.id === tagId);
  };

  // Get all unique tags from todos
  const getAllTagsFromTodos = () => {
    const allTags = new Set<string>();
    todos.forEach(todo => {
      todo.tags.forEach(tag => allTags.add(tag));
    });
    return Array.from(allTags);
  };

  const filteredTodos = todos.filter(todo => {
    // First filter by status
    let matchesStatus = true;
    if (filter !== 'all') {
      matchesStatus = todo.status === filter;
    }
    
    // Then filter by tag
    let matchesTag = true;
    if (tagFilter !== 'all') {
      matchesTag = todo.tags.includes(tagFilter);
    }
    
    return matchesStatus && matchesTag;
  });

  const pendingCount = todos.filter(todo => todo.status === 'pending').length;
  const inProgressCount = todos.filter(todo => todo.status === 'in-progress').length;
  const doneCount = todos.filter(todo => todo.status === 'done').length;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4 transition-all duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header with Dark Mode Toggle */}
        <div className="text-center mb-12 relative">
          <button
            onClick={toggleDarkMode}
            className="absolute top-0 right-0 p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 border border-slate-200/50 dark:border-slate-700/50"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <SunIcon className="w-6 h-6" />
            ) : (
              <MoonIcon className="w-6 h-6" />
            )}
          </button>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-3">Todo List</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Stay organized and productive</p>
        </div>

        {/* Progress Chart */}
        {todos.length > 0 && <DonutChart todos={todos} />}

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="mb-8 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/20 p-8 transition-all duration-300">
          <div className="space-y-6">
            {/* Task Name Input */}
            <div>
              <label htmlFor="task-name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Task Name
              </label>
              <input
                id="task-name"
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-6 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-200 backdrop-blur-sm"
              />
            </div>

            {/* Assignee Input */}
            <div>
              <label htmlFor="assignee" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Assignee
              </label>
              <div className="relative">
                <input
                  id="assignee"
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Who is responsible for this task?"
                  className="w-full px-6 py-4 pl-12 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 transition-all duration-200 backdrop-blur-sm"
                />
                <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
              </div>
            </div>

            {/* Date Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="start-date" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 transition-all duration-200 backdrop-blur-sm"
                  />
                  <CalendarIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                </div>
              </div>
              
              <div>
                <label htmlFor="deadline" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                  Deadline
                </label>
                <div className="relative">
                  <input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-6 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 transition-all duration-200 backdrop-blur-sm"
                  />
                  <CalendarIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                </div>
              </div>
            </div>

            {/* Tags Dropdown */}
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Tags
              </label>
              <button
                type="button"
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                className="w-full flex items-center justify-between px-6 py-4 border-2 border-slate-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 transition-all duration-200 backdrop-blur-sm"
              >
                <span className={selectedTags.length > 0 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}>
                  {selectedTags.length > 0 
                    ? `${selectedTags.length} tag${selectedTags.length !== 1 ? 's' : ''} selected`
                    : 'Select tags...'
                  }
                </span>
                <ChevronDownIcon className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isTagDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Selected Tags Display */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedTags.map(tagId => {
                    const tagInfo = getTagInfo(tagId);
                    return tagInfo ? (
                      <span
                        key={tagId}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${tagInfo.color} shadow-sm`}
                      >
                        {tagInfo.label}
                        <button
                          type="button"
                          onClick={() => toggleTag(tagId)}
                          className="ml-1 hover:opacity-70 transition-opacity"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {/* Dropdown Menu */}
              {isTagDropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white/95 dark:bg-slate-700/95 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                  {AVAILABLE_TAGS.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-600 flex items-center justify-between transition-colors duration-200 ${
                        selectedTags.includes(tag.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${tag.color}`}>
                        {tag.label}
                      </span>
                      {selectedTags.includes(tag.id) && (
                        <CheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add Button */}
            <button
              type="submit"
              disabled={!newTodo.trim()}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <PlusIcon className="w-6 h-6" />
              Add Task
            </button>
          </div>
        </form>

        {/* Todo List */}
        {todos.length > 0 && (
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/20 overflow-hidden transition-all duration-300">
            {/* Filters */}
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
              {/* Status Filters */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-3">
                  {(['all', 'pending', 'in-progress', 'done'] as FilterType[]).map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        filter === filterType
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {filterType === 'all' ? 'All' : 
                       filterType === 'in-progress' ? 'In Progress' :
                       filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                    </button>
                  ))}
                </div>
                {doneCount > 0 && (
                  <button
                    onClick={clearCompleted}
                    className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors duration-200 font-medium"
                  >
                    Clear done
                  </button>
                )}
              </div>

              {/* Tag Filters */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Filter by Tag:</h3>
                <div className="flex flex-wrap gap-2">
                  {/* All Tags Button */}
                  <button
                    onClick={() => setTagFilter('all')}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                      tagFilter === 'all'
                        ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    All
                  </button>
                  
                  {/* Tag Filter Buttons */}
                  {getAllTagsFromTodos().map(tagId => {
                    const tagInfo = getTagInfo(tagId);
                    return tagInfo ? (
                      <button
                        key={tagId}
                        onClick={() => setTagFilter(tagId)}
                        className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                          tagFilter === tagId
                            ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-800 shadow-lg'
                            : ''
                        } ${tagInfo.color}`}
                      >
                        {tagInfo.label}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            {/* Todo Items */}
            <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
              {filteredTodos.map((todo) => {
                const statusConfig = STATUS_CONFIG[todo.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={todo.id}
                    className={`flex items-start gap-4 p-6 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-all duration-200 ${statusConfig.bgColor}`}
                  >
                    {/* Status Button */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => updateTodoStatus(todo.id, 'pending')}
                        className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          todo.status === 'pending'
                            ? 'bg-slate-500 border-slate-500 text-white shadow-lg'
                            : 'border-slate-300 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                        title="Mark as Pending"
                      >
                        {todo.status === 'pending' && <ClockIcon className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => updateTodoStatus(todo.id, 'in-progress')}
                        className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          todo.status === 'in-progress'
                            ? 'bg-blue-500 border-blue-500 text-white shadow-lg'
                            : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                        title="Mark as In Progress"
                      >
                        {todo.status === 'in-progress' && <PlayIcon className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => updateTodoStatus(todo.id, 'done')}
                        className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          todo.status === 'done'
                            ? 'bg-green-500 border-green-500 text-white shadow-lg'
                            : 'border-slate-300 dark:border-slate-600 hover:border-green-500 dark:hover:border-green-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                        title="Mark as Done"
                      >
                        {todo.status === 'done' && <CheckIcon className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`block text-slate-900 dark:text-slate-100 text-lg font-medium transition-all duration-200 ${
                            todo.status === 'done' ? 'line-through text-slate-500 dark:text-slate-400' : ''
                          }`}
                        >
                          {todo.text}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.color} shadow-sm`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      
                      {/* Assignee Information */}
                      {todo.assignee && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                          <UserIcon className="w-4 h-4" />
                          <span className="font-medium">{todo.assignee}</span>
                        </div>
                      )}
                      
                      {/* Date Information */}
                      {(todo.startDate || todo.deadline) && (
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {todo.startDate && (
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              <span>Start: {formatDate(todo.startDate)}</span>
                            </div>
                          )}
                          {todo.deadline && (
                            <div className={`flex items-center gap-2 ${
                              isOverdue(todo.deadline) ? 'text-red-600 dark:text-red-400 font-medium' : ''
                            }`}>
                              <CalendarIcon className="w-4 h-4" />
                              <span>
                                Due: {formatDate(todo.deadline)}
                                {isOverdue(todo.deadline) && (
                                  <span className="ml-1 text-red-600 dark:text-red-400">(Overdue)</span>
                                )}
                                {!isOverdue(todo.deadline) && (
                                  <span className="ml-1 text-slate-500 dark:text-slate-400">
                                    ({getDaysUntilDeadline(todo.deadline)} days left)
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Tags Display */}
                      {todo.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {todo.tags.map(tagId => {
                            const tagInfo = getTagInfo(tagId);
                            return tagInfo ? (
                              <span
                                key={tagId}
                                className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${tagInfo.color} shadow-sm`}
                              >
                                {tagInfo.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="flex-shrink-0 p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-700/50 text-sm text-slate-600 dark:text-slate-400">
              {filteredTodos.length} of {todos.length} task{filteredTodos.length !== 1 ? 's' : ''} shown
              {pendingCount > 0 && (
                <span className="ml-4">
                  • {pendingCount} pending
                </span>
              )}
              {inProgressCount > 0 && (
                <span className="ml-4">
                  • {inProgressCount} in progress
                </span>
              )}
              {doneCount > 0 && (
                <span className="ml-4">
                  • {doneCount} done
                </span>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {todos.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <PlusIcon className="w-10 h-10 text-slate-500 dark:text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">No tasks yet</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Add a task above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}