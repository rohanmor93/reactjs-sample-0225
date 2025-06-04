import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  orderBy,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import NewListPopup from "../pages/NewListPopup";
import "../styles/AuthForm.css";

interface Task {
  id: string;
  text: string;
  completed: boolean;
  userId: string;
}

interface TaskList {
  id: string;
  name: string;
  createdAt: any;
  userId: string;
}

const TaskBoard: React.FC = () => {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  
  // Enhanced UI state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showTaskOptions, setShowTaskOptions] = useState<string | null>(null);
  const [showListOptions, setShowListOptions] = useState<string | null>(null);

  const user = auth.currentUser ;

  // Fetch task lists
  const fetchTaskLists = () => {
    if (!user) return;

    const q = query(
      collection(db, "lists"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lists: TaskList[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          createdAt: data.createdAt,
          userId: data.userId,
        };
      });

      setTaskLists(lists);

      if (!activeListId && lists.length > 0) {
        setActiveListId(lists[0].id);
      }
    });

    return () => unsubscribe();
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchTaskLists();
      } else {
        // Clear task lists and tasks when user logs out
        setTaskLists([]);
        setActiveListId(null);
        setTasks([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch tasks from the active list
  useEffect(() => {
    if (!user || !activeListId) return;

    setLoadingTasks(true);

    const q = query(
      collection(db, "lists", activeListId, "tasks"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks: Task[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          text: data.text,
          completed: data.completed,
          userId: data.userId,
        };
      });

      setTasks(tasks);
      setLoadingTasks(false);
    });

    return () => unsubscribe();
  }, [user, activeListId]);

  // Add a task to current list
  const addTask = async () => {
    if (!newTask.trim() || !user || !activeListId) return;
  
    try {
      await addDoc(collection(db, "lists", activeListId, "tasks"), {
        text: newTask.trim(),
        completed: false,
        createdAt: serverTimestamp(),
        userId: user.uid, // Set the userId to the authenticated user's ID
      });
      setNewTask("");
      setIsAddingTask(false);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };
  

  // Toggle completion status
  const toggleComplete = async (taskId: string, currentStatus: boolean) => {
    if (!user || !activeListId) return;

    const taskRef = doc(db, "lists", activeListId, "tasks", taskId);
    await updateDoc(taskRef, {
      completed: !currentStatus,
    });
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    if (!user || !activeListId) return;

    const taskRef = doc(db, "lists", activeListId, "tasks", taskId);
    await deleteDoc(taskRef);
    setShowTaskOptions(null);
  };

  // Delete a list
  const deleteList = async (listId: string) => {
    if (!user) return;

    const listRef = doc(db, "lists", listId);
    await deleteDoc(listRef);
  };

  // Edit task functionality
  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
    setShowTaskOptions(null);
  };

  const saveEdit = async () => {
    if (!editText.trim() || !user || !activeListId) return;

    const taskRef = doc(db, "lists", activeListId, "tasks", editingTaskId!);
    await updateDoc(taskRef, {
      text: editText.trim(),
    });

    setEditingTaskId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditText('');
  };

  // Keyboard handlers
  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    } else if (e.key === 'Escape') {
      if (action === addTask) {
        setIsAddingTask(false);
        setNewTask('');
      } else {
        cancelEdit();
      }
    }
  };

  // Get active list name
  const getActiveListName = () => {
    const activeList = taskLists.find(list => list.id === activeListId);
    return activeList ? activeList.name : 'Tasks';
  };

  return (
    <div className="task-board">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="app-icon">⛓</div>
          <h1>BlockTask</h1>
        </div>
        <div className="header-right">
          <span className="username">{user?.email}</span>
          <img
            src={`https://picsum.photos/seed/${user?.uid}/40`}
            alt="Profile"
            className="profile-image"
            title={user?.email ?? "User "}
          />
        </div>
      </div>

      <div className="main-container">
        {/* Sidebar - Task Lists */}
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>Your Lists</h3>
          </div>

          {taskLists.length === 0 ? (
            <div className="empty-lists">
              <span className="empty-icon">📋</span>
              <p>No lists found. Create one below.</p>
            </div>
          ) : (
            <div className="lists-container">
              {taskLists.map((list) => (
                <div key={list.id} className="list-item-wrapper">
                  <div
                    className={`list-item ${list.id === activeListId ? 'active' : ''}`}
                    onClick={() => setActiveListId(list.id)}
                  >
                    <span className="list-name">{list.name}</span>
                    <button
                      className="list-options-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowListOptions(showListOptions === list.id ? null : list.id);
                      }}
                    >
                      ⋮
                    </button>
                  </div>
                  
                  {showListOptions === list.id && (
                    <div className="options-dropdown">
                      <button className="option-btn edit-option">
                        ✏️ Rename
                      </button>
                      <button 
                        className="option-btn delete-option"
                        onClick={() => deleteList(list.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            className="create-list-btn"
            onClick={() => setShowPopup(true)}
          >
            ➕ Create New List
          </button>
        </div>

        {/* Main Content - Tasks */}
        <div className="main-content">
          <div className="tasks-container">
            <div className="tasks-header">
              <h2>{getActiveListName()}</h2>
              <div className="task-stats">
                {tasks.length > 0 && (
                  <>
                    {tasks.filter(t => t.completed).length} of {tasks.length} completed
                  </>
                )}
              </div>
            </div>

            {/* Add Task Section */}
            {activeListId && (
              <div className="add-task-section">
                {isAddingTask ? (
                  <div className="add-task-form">
                    <input
                      type="text"
                      placeholder="Enter new task..."
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, addTask)}
                      className="task-input"
                      autoFocus
                    />
                    <button
                      onClick={addTask}
                      disabled={!newTask.trim()}
                      className="add-btn"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingTask(false);
                        setNewTask('');
                      }}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingTask(true)}
                    className="add-task-placeholder"
                  >
                    <div className="add-task-icon">➕</div>
                    <span>Add new task</span>
                  </button>
                )}
              </div>
            )}

            {/* Tasks List */}
            {loadingTasks ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-tasks">
                <div className="empty-emoji">📝</div>
                <p className="empty-title">No tasks in this list yet.</p>
                <p className="empty-subtitle">Add your first task above!</p>
              </div>
            ) : (
              <div className="tasks-list">
                {tasks.map((task) => (
                  <div key={task.id} className="task-item-wrapper">
                    {editingTaskId === task.id ? (
                      <div className="task-edit-form">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, saveEdit)}
                          className="edit-input"
                          autoFocus
                        />
                        <button onClick={saveEdit} className="save-btn">
                          ✔️
                        </button>
                        <button onClick={cancelEdit} className="cancel-edit-btn">
                          ❌
                        </button>
                      </div>
                    ) : (
                      <div className="task-item">
                        <button
                          onClick={() => toggleComplete(task.id, task.completed)}
                          className={`task-checkbox ${task.completed ? 'completed' : ''}`}
                        >
                          {task.completed && <span>✔️</span>}
                        </button>
                        <span className={`task-text ${task.completed ? 'completed' : ''}`}>
                          {task.text}
                        </span>
                        <div className="task-options">
                          <button
                            onClick={() => setShowTaskOptions(showTaskOptions === task.id ? null : task.id)}
                            className="task-options-btn"
                          >
                            ⋮
                          </button>
                          {showTaskOptions === task.id && (
                            <div className="task-options-dropdown">
                              <button
                                onClick={() => startEdit(task)}
                                className="option-btn edit-option"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="option-btn delete-option"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Progress Bar */}
            {tasks.length > 0 && (
              <div className="progress-section">
                <div className="progress-info">
                  <span>Progress</span>
                  <span>{Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPopup && <NewListPopup setShowPopup={setShowPopup} refreshTaskLists={fetchTaskLists} />}
    </div>
  );
};

export default TaskBoard;
