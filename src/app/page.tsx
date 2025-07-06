'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, CheckIcon, XMarkIcon, ChevronDownIcon, ClockIcon, PlayIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

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
  { id: 'work', label: 'Work', color: 'bg-blue-100 text-blue-800' },
  { id: 'personal', label: 'Personal', color: 'bg-green-100 text-green-800' },
  { id: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
  { id: 'shopping', label: 'Shopping', color: 'bg-purple-100 text-purple-800' },
  { id: 'health', label: 'Health', color: 'bg-orange-100 text-orange-800' },
  { id: 'finance', label: 'Finance', color: 'bg-yellow-100 text-yellow-800' },
];

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-gray-100 text-gray-800',
    icon: ClockIcon,
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    chartColor: '#6B7280'
  },
  'in-progress': {
    label: 'In Progress',
    color: 'bg-blue-100 text-blue-800',
    icon: PlayIcon,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    chartColor: '#3B82F6'
  },
  done: {
    label: 'Done',
    color: 'bg-green-100 text-green-800',
    icon: CheckIcon,
    bgColor: 'bg-green-50',
    textColor: 'text-green-600',
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

  const radius = 40;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  
  const pendingAngle = (pending / total) * 360;
  const inProgressAngle = (inProgress / total) * 360;
  const doneAngle = (done / total) * 360;

  const inProgressOffset = pendingAngle;
  const doneOffset = pendingAngle + inProgressAngle;

  const completionPercentage = Math.round((done / total) * 100);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Progress Overview</h3>
      
      <div className="flex items-center justify-center mb-4">
        <div className="relative">
          <svg width="120" height="120" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
            />
            
            {/* Done segment */}
            {done > 0 && (
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={STATUS_CONFIG.done.chartColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (doneAngle / 360) * circumference}
                strokeLinecap="round"
                transform="rotate(0 60 60)"
              />
            )}
            
            {/* In Progress segment */}
            {inProgress > 0 && (
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={STATUS_CONFIG['in-progress'].chartColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (inProgressAngle / 360) * circumference}
                strokeLinecap="round"
                transform={`rotate(${doneOffset} 60 60)`}
              />
            )}
            
            {/* Pending segment */}
            {pending > 0 && (
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={STATUS_CONFIG.pending.chartColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (pendingAngle / 360) * circumference}
                strokeLinecap="round"
                transform={`rotate(${doneOffset + inProgressOffset} 60 60)`}
              />
            )}
          </svg>
          
          {/* Center percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{completionPercentage}%</div>
              <div className="text-xs text-gray-500">Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-gray-500 mb-1"></div>
          <div className="text-xs font-medium text-gray-600">Pending</div>
          <div className="text-lg font-bold text-gray-800">{pending}</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 mb-1"></div>
          <div className="text-xs font-medium text-gray-600">In Progress</div>
          <div className="text-lg font-bold text-gray-800">{inProgress}</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mb-1"></div>
          <div className="text-xs font-medium text-gray-600">Done</div>
          <div className="text-lg font-bold text-gray-800">{done}</div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Todo List</h1>
          <p className="text-gray-600">Stay organized and productive</p>
        </div>

        {/* Progress Chart */}
        {todos.length > 0 && <DonutChart todos={todos} />}

        {/* Add Todo Form */}
        <form onSubmit={addTodo} className="mb-6 bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            {/* Task Name Input */}
            <div>
              <label htmlFor="task-name" className="block text-sm font-medium text-black-700 mb-2">
                Task Name
              </label>
              <input
                id="task-name"
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full px-4 py-3 border border-black-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Assignee Input */}
            <div>
              <label htmlFor="assignee" className="block text-sm font-medium text-black-700 mb-2">
                Assignee
              </label>
              <div className="relative">
                <input
                  id="assignee"
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="Who is responsible for this task?"
                  className="w-full px-4 py-3 pl-10 border border-black-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Date Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-black-700 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border border-black-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-black-700 mb-2">
                  Deadline
                </label>
                <div className="relative">
                  <input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-4 py-3 border border-black-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black-400" />
                </div>
              </div>
            </div>

            {/* Tags Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-black-700 mb-2">
                Tags
              </label>
              <button
                type="button"
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 border border-black-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <span className={selectedTags.length > 0 ? 'text-black-900' : 'text-black-500'}>
                  {selectedTags.length > 0 
                    ? `${selectedTags.length} tag${selectedTags.length !== 1 ? 's' : ''} selected`
                    : 'Select tags...'
                  }
                </span>
                <ChevronDownIcon className={`w-5 h-5 text-black-400 transition-transform ${isTagDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Selected Tags Display */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTags.map(tagId => {
                    const tagInfo = getTagInfo(tagId);
                    return tagInfo ? (
                      <span
                        key={tagId}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tagInfo.color}`}
                      >
                        {tagInfo.label}
                        <button
                          type="button"
                          onClick={() => toggleTag(tagId)}
                          className="ml-1 hover:opacity-70"
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
                <div className="absolute z-10 w-full mt-1 bg-white border border-black-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {AVAILABLE_TAGS.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                        selectedTags.includes(tag.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${tag.color}`}>
                        {tag.label}
                      </span>
                      {selectedTags.includes(tag.id) && (
                        <CheckIcon className="w-4 h-4 text-blue-600" />
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
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Task
            </button>
          </div>
        </form>

        {/* Todo List */}
        {todos.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-gray-200">
              {/* Status Filters */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2">
                  {(['all', 'pending', 'in-progress', 'done'] as FilterType[]).map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        filter === filterType
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-800'
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
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    Clear done
                  </button>
                )}
              </div>

              {/* Tag Filters */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Filter by Tag:</h3>
                <div className="flex flex-wrap gap-2">
                  {/* All Tags Button */}
                  <button
                    onClick={() => setTagFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      tagFilter === 'all'
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          tagFilter === tagId
                            ? 'ring-2 ring-offset-2 ring-blue-500'
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
            <div className="divide-y divide-gray-200">
              {filteredTodos.map((todo) => {
                const statusConfig = STATUS_CONFIG[todo.status] || STATUS_CONFIG.pending;
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={todo.id}
                    className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors ${statusConfig.bgColor}`}
                  >
                    {/* Status Button */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => updateTodoStatus(todo.id, 'pending')}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          todo.status === 'pending'
                            ? 'bg-gray-500 border-gray-500 text-white'
                            : 'border-gray-300 hover:border-gray-500'
                        }`}
                        title="Mark as Pending"
                      >
                        {todo.status === 'pending' && <ClockIcon className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => updateTodoStatus(todo.id, 'in-progress')}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          todo.status === 'in-progress'
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300 hover:border-blue-500'
                        }`}
                        title="Mark as In Progress"
                      >
                        {todo.status === 'in-progress' && <PlayIcon className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => updateTodoStatus(todo.id, 'done')}
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          todo.status === 'done'
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                        title="Mark as Done"
                      >
                        {todo.status === 'done' && <CheckIcon className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`block text-gray-800 transition-all ${
                            todo.status === 'done' ? 'line-through text-gray-500' : ''
                          }`}
                        >
                          {todo.text}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      
                      {/* Assignee Information */}
                      {todo.assignee && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                          <UserIcon className="w-3 h-3" />
                          <span className="font-medium">{todo.assignee}</span>
                        </div>
                      )}
                      
                      {/* Date Information */}
                      {(todo.startDate || todo.deadline) && (
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600 mb-2">
                          {todo.startDate && (
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              <span>Start: {formatDate(todo.startDate)}</span>
                            </div>
                          )}
                          {todo.deadline && (
                            <div className={`flex items-center gap-1 ${
                              isOverdue(todo.deadline) ? 'text-red-600 font-medium' : ''
                            }`}>
                              <CalendarIcon className="w-3 h-3" />
                              <span>
                                Due: {formatDate(todo.deadline)}
                                {isOverdue(todo.deadline) && (
                                  <span className="ml-1 text-red-600">(Overdue)</span>
                                )}
                                {!isOverdue(todo.deadline) && (
                                  <span className="ml-1 text-gray-500">
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
                        <div className="flex flex-wrap gap-1">
                          {todo.tags.map(tagId => {
                            const tagInfo = getTagInfo(tagId);
                            return tagInfo ? (
                              <span
                                key={tagId}
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${tagInfo.color}`}
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
                      className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Stats */}
            <div className="p-4 bg-gray-50 text-sm text-gray-600">
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
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
            <p className="text-gray-600">Add a task above to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
