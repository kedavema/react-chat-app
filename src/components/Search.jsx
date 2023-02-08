import React, { useContext, useState } from 'react';
import { collection, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, doc } from "firebase/firestore";
import { db } from '../firebase';
import { AuthContext } from "../context/AuthContext";

const Search = () => {

  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);
  const usersRef = collection(db, "users");

  const {currentUser} = useContext(AuthContext);

  const handleSearch = async () => {
    const q = query(usersRef, where("displayName", "==", username));
    const querySnapshot = await getDocs(q);
    try {
      querySnapshot.forEach((doc) => {
        setUser(doc.data())
      });
    } catch (err) {
      setErr(true);
      console.log(err);
    }
  };

  const handleKey = e => { e.code === "Enter" && handleSearch() };

  const handleSelect = async () => {
    // check wether the groups(chats in firestore) exists. If not, create.
    const combinedId = 
    currentUser.uid > user.uid 
      ? currentUser.uid + user.uid 
      : user.uid + currentUser.uid

    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        // create a chat in chat collections
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        // create user chats
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId+".userInfo"]: {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL
          },
          [combinedId+".date"]: serverTimestamp()
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId+".userInfo"]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL
          },
          [combinedId+".date"]: serverTimestamp()
        });
      }
    } catch (err) {
      console.log(err);
    }
    setUser(null);
    setUsername("");
  }

  return (
    <div className="search">
      <div className="searchForm">
        <input 
          type="text" 
          placeholder="Buscar un usuario..." 
          onChange={e => setUsername(e.target.value)} 
          onKeyDown={handleKey}
          value={username}
        />
        {err && <span>User not found.</span>}
        {user && <div className="userChat" onClick={handleSelect}>
          <img src={user.photoURL} alt="" />
          <div className="userChatInfo">
            <span>{user.displayName}</span>
          </div>
        </div>}
      </div>
    </div>
  )
}

export default Search