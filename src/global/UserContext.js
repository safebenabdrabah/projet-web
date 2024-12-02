import React, { createContext, useState, useEffect, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/Config.js"; // Import your Firebase configuration

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);

        // Fetch user data from Firestore
        const userRef = doc(db, "SignedUpUserData", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.log("No user data found in Firestore.");
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateUserData = async (newData) => {
    if (!user) {
      console.error("No user is logged in.");
      return;
    }

    const userRef = doc(db, "SignedUpUserData", user.uid);

    try {
      await updateDoc(userRef, newData); // Update specific fields
      setUserData((prev) => ({ ...prev, ...newData })); // Update state locally
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  // Function to delete user data
  const deleteUserData = async () => {
    if (!user) {
      console.error("No user is logged in.");
      return;
    }

    const userRef = doc(db, "SignedUpUserData", user.uid);

    try {
      await deleteDoc(userRef); // Delete document from Firestore
      setUserData(null); // Reset state locally
    } catch (error) {
      console.error("Error deleting user data:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        userData,
        loading,
        updateUserData,
        deleteUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
