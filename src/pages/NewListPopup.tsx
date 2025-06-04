import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import "../styles/AuthForm.css";

interface Props {
  setShowPopup: (show: boolean) => void;
  refreshTaskLists: () => void;
}

const NewListPopup: React.FC<Props> = ({ setShowPopup, refreshTaskLists }) => {
  const [listName, setListName] = useState("");

  const handleCreateList = async () => {
    const user = auth.currentUser;
    console.log("User:", user);
    console.log("List name:", listName);
    if (!user || !listName.trim()) return;
  
    try {
      const docRef = await addDoc(collection(db, "lists"), {
        name: listName.trim(),
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      console.log("List created with ID:", docRef.id);
  
      refreshTaskLists();
      setShowPopup(false);
    } catch (error) {
      console.error("Error creating list:", error);
      alert("Error creating list");
    }
  };
  

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <h3>Create New List</h3>
        <input
          type="text"
          placeholder="List name"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
        />
        <button onClick={handleCreateList}>Create</button>
        <button onClick={() => setShowPopup(false)}>Cancel</button>
      </div>
    </div>
  );
};

export default NewListPopup;
