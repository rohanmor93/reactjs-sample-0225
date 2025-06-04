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
import Navbar from "../components/Navbar";


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
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showTaskOptions, setShowTaskOptions] = useState<string | null>(null);
  const [showListOptions, setShowListOptions] = useState<string | null>(null);
  const [user, setUser] = useState(auth.currentUser);

  // Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Task Lists
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "lists"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lists: TaskList[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        createdAt: doc.data().createdAt,
        userId: doc.data().userId,
      }));

      setTaskLists(lists);

      if (!activeListId && lists.length > 0) {
        setActiveListId(lists[0].id);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch Tasks
  useEffect(() => {
    if (!user || !activeListId) return;

    setLoadingTasks(true);

    const q = query(
      collection(db, "lists", activeListId, "tasks"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().text,
        completed: doc.data().completed,
        userId: doc.data().userId,
      }));
      setTasks(fetchedTasks);
      setLoadingTasks(false);
    });

    return () => unsubscribe();
  }, [user, activeListId]);

  const addTask = async () => {
    if (!newTask.trim() || !user || !activeListId) return;

    try {
      await addDoc(collection(db, "lists", activeListId, "tasks"), {
        text: newTask.trim(),
        completed: false,
        createdAt: serverTimestamp(),
        userId: user.uid,
      });
      setNewTask("");
      setIsAddingTask(false);
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const toggleComplete = async (taskId: string, current: boolean) => {
    if (!user || !activeListId) return;
    const taskRef = doc(db, "lists", activeListId, "tasks", taskId);
    await updateDoc(taskRef, { completed: !current });
  };

  const deleteTask = async (taskId: string) => {
    if (!user || !activeListId) return;
    await deleteDoc(doc(db, "lists", activeListId, "tasks", taskId));
    setShowTaskOptions(null);
  };

  const deleteList = async (listId: string) => {
    if (!user) return;
    await deleteDoc(doc(db, "lists", listId));
    if (activeListId === listId) {
      setActiveListId(null);
    }
  };

  const startEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditText(task.text);
    setShowTaskOptions(null);
  };

  const saveEdit = async () => {
    if (!editText.trim() || !user || !activeListId || !editingTaskId) return;
    const taskRef = doc(db, "lists", activeListId, "tasks", editingTaskId);
    await updateDoc(taskRef, { text: editText.trim() });
    setEditingTaskId(null);
    setEditText("");
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditText("");
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    action: () => void
  ) => {
    if (e.key === "Enter") action();
    else if (e.key === "Escape") {
      if (action === addTask) {
        setIsAddingTask(false);
        setNewTask("");
      } else {
        cancelEdit();
      }
    }
  };

  const getActiveListName = () => {
    return taskLists.find((list) => list.id === activeListId)?.name || "Tasks";
  };

  if (!user) return <div className="loading-container">Loading user...</div>;

  return (
    <div className="task-board">
      
      
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="app-icon">⛓</div>
          <h1>BlockTask</h1>
        </div>
        <div className="header-right">
          <span className="username">{user.email}</span>
          <img
            src={`https://picsum.photos/seed/${user.uid}/40`}
            alt="Profile"
            className="profile-image"
            title={user.email ?? "User"}
          />
        </div>
      </div>
      <Navbar />
      

      <div className="main-container">
        {/* Sidebar */}
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
                    className={`list-item ${list.id === activeListId ? "active" : ""}`}
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
                      <button className="option-btn edit-option">✏️ Rename</button>
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
          <button className="create-list-btn" onClick={() => setShowPopup(true)}>
            ➕ Create New List
          </button>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <div className="tasks-container">
            <div className="tasks-header">
              <h2>{getActiveListName()}</h2>
              <div className="task-stats">
                {tasks.length > 0 &&
                  `${tasks.filter((t) => t.completed).length} of ${tasks.length} completed`}
              </div>
            </div>

            {/* Add Task */}
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
                <button onClick={cancelEdit} className="cancel-btn">
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

            {/* Tasks */}
            {loadingTasks ? (
              <div className="loading-container">
                <div className="spinner" />
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
                        <button onClick={saveEdit} className="save-btn">✔️</button>
                        <button onClick={cancelEdit} className="cancel-edit-btn">❌</button>
                      </div>
                    ) : (
                      <div className="task-item">
                        <button
                          onClick={() => toggleComplete(task.id, task.completed)}
                          className={`task-checkbox ${task.completed ? "completed" : ""}`}
                        >
                          {task.completed && <span>✔️</span>}
                        </button>
                        <span className={`task-text ${task.completed ? "completed" : ""}`}>
                          {task.text}
                        </span>
                        <div className="task-options">
                          <button
                            onClick={() => setShowTaskOptions(
                              showTaskOptions === task.id ? null : task.id
                            )}
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

            {/* Progress */}
            {tasks.length > 0 && (
              <div className="progress-section">
                <div className="progress-info">
                  <span>Progress</span>
                  <span>{Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${(tasks.filter(t => t.completed).length / tasks.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Popup */}
      {showPopup && <NewListPopup setShowPopup={setShowPopup} refreshTaskLists={() => {}} />}
    </div>
  );
};

export default TaskBoard;
