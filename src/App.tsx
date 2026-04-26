import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'

type Task = {
  id: string
  title: string
  category: string
  dueDate: string
  completed: boolean
}

const defaultCategories = ['Personal', 'Work', 'Home', 'Other']

function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem('todo-tasks')
    if (!stored) return []
    try {
      return JSON.parse(stored) as Task[]
    } catch {
      return []
    }
  })

  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState(defaultCategories[0])
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editCategory, setEditCategory] = useState(defaultCategories[0])

  useEffect(() => {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks))
  }, [tasks])

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filter === 'active') return !task.completed
      if (filter === 'completed') return task.completed
      return true
    })
  }, [tasks, filter])

  const handleAddTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim()) return

    setTasks((current) => [
      {
        id: crypto.randomUUID(),
        title: title.trim(),
        category,
        dueDate,
        completed: false,
      },
      ...current,
    ])
    setTitle('')
    setDueDate('')
    setCategory(defaultCategories[0])
  }

  const toggleComplete = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDueDate(task.dueDate)
    setEditCategory(task.category)
  }

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              title: editTitle.trim(),
              dueDate: editDueDate,
              category: editCategory,
            }
          : task,
      ),
    )
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const deleteTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id))
  }

  const completedCount = tasks.filter((task) => task.completed).length

  return (
    <main className="todo-app">
      <header className="hero-card">
        <div>
          <p className="eyebrow">To-Do List App</p>
          <h1>Keep track of tasks, due dates, and progress.</h1>
          <p className="intro">
            Add tasks quickly, mark them complete, and filter work by status.
            Your list is saved in local storage so it stays after refresh.
          </p>
        </div>
        <div className="stats-card">
          <p>Tasks total</p>
          <strong>{tasks.length}</strong>
          <p>Completed</p>
          <strong>{completedCount}</strong>
        </div>
      </header>

      <section className="task-panel">
        <form className="task-form" onSubmit={handleAddTask}>
          <div className="field-row">
            <label htmlFor="title">Task</label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Add a new task"
            />
          </div>
          <div className="field-row small-grid">
            <div>
              <label htmlFor="dueDate">Due date</label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
            <div>
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {defaultCategories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="primary-button">
            Add task
          </button>
        </form>

        <div className="filters-row">
          <div className="filter-buttons" role="group" aria-label="Task filter">
            {(['all', 'active', 'completed'] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={filter === value ? 'filter-button active' : 'filter-button'}
                onClick={() => setFilter(value)}
              >
                {value === 'all' ? 'All' : value === 'active' ? 'Active' : 'Completed'}
              </button>
            ))}
          </div>
          <p className="filter-summary">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </p>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            {tasks.length === 0
              ? 'No tasks yet. Add your first task to get started.'
              : 'No tasks match this filter. Try another status.'}
          </div>
        ) : (
          <ul className="task-list">
            {filteredTasks.map((task) => (
              <li key={task.id} className={task.completed ? 'task-item completed' : 'task-item'}>
                <div className="task-main">
                  <button
                    type="button"
                    className="check-toggle"
                    aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    onClick={() => toggleComplete(task.id)}
                  >
                    {task.completed ? '✓' : '○'}
                  </button>
                  <div className="task-info">
                    {editingId === task.id ? (
                      <div className="edit-row">
                        <input
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          placeholder="Task title"
                        />
                        <div className="small-grid">
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(event) => setEditDueDate(event.target.value)}
                          />
                          <select
                            value={editCategory}
                            onChange={(event) => setEditCategory(event.target.value)}
                          >
                            {defaultCategories.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="task-title-row">
                          <p className="task-title">{task.title}</p>
                          <span className="task-category">{task.category}</span>
                        </div>
                        <div className="task-meta">
                          <span>{task.dueDate ? `Due ${task.dueDate}` : 'No due date'}</span>
                          <span>{task.completed ? 'Completed' : 'In progress'}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="task-actions">
                  {editingId === task.id ? (
                    <>
                      <button type="button" className="text-button" onClick={() => saveEdit(task.id)}>
                        Save
                      </button>
                      <button type="button" className="text-button" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="text-button" onClick={() => startEdit(task)}>
                        Edit
                      </button>
                      <button type="button" className="text-button danger" onClick={() => deleteTask(task.id)}>
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App
