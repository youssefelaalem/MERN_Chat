import axios from "axios";
import { useEffect, useState } from "react";
import { createContext } from "react";
import PropTypes from "prop-types";
import Snackbar from "./Components/Snackbar"; // Import the Snackbar component

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [snackbar, setSnackbar] = useState(null);
  const [id, setId] = useState(null);

  // Function to show snackbar
  const showSnackbar = (message, type) => {
    setSnackbar({ message, type });
  };

  // Function to hide snackbar
  const hideSnackbar = () => {
    setSnackbar(null);
  };

  useEffect(() => {
    axios
      .get("http://localhost:8080/profile")
      .then((response) => {
        setId(response.data.userId);
        setUsername(response.data.username);
      })
      .catch((error) => {
        showSnackbar("Failed to load profile data", "error");
      });
  }, []);

  return (
    <UserContext.Provider
      value={{
        username,
        setUsername,
        id,
        setId,
        showSnackbar, // Provide showSnackbar function
        hideSnackbar, // Provide hideSnackbar function
      }}
    >
      {snackbar && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={hideSnackbar}
        />
      )}
      {children}
    </UserContext.Provider>
  );
}

UserContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};