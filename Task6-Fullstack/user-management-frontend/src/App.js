import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users", {
        withCredentials: true,
      });
      setUsers(res.data);
    } catch (err) {
      setError("Failed to fetch users. Check server connection.");
    }
  };

  const addUser = async () => {
    if (!name || !email || !age) {
      setError("All fields are required!");
      return;
    }
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/users", { name, email, age }, { withCredentials: true });
      setUsers([...users, res.data]);
      setName("");
      setEmail("");
      setAge("");
    } catch (err) {
      setError("Error adding user. Check server connection.");
    }
  };

  return (
    <div>
      <h1 style={{ color : "blue"}}>User Management System</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" />
      <button onClick={addUser}>Add User</button>

      <ul>
        {users.map((user) => (
          <li key={user._id}>
            {user.name} - {user.email} - {user.age}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
