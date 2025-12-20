"use client";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: "", email: "" });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleEditClick = (user) => {
    setFormData({ name: user.name, email: user.email });
    localStorage.setItem("userId", user._id); // store id
  };

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        alert("Failed to update user");
        return;
      }

      const updatedUser = await res.json();

      setUsers((prev) =>
        prev.map((u) => (u._id === updatedUser._id ? updatedUser : u))
      );
      setFormData({ name: "", email: "" });
      localStorage.removeItem("userId");

      // ✅ show alert
      alert("User updated successfully!");
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user");
    }
  };

  return (
    <div>
      <h1>User Details</h1>
      {users.length === 0 ? (
        <p>No users found</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user._id}>
              <strong>{user.name}</strong> - {user.email} - {user.phone}
              <button onClick={() => handleEditClick(user)}>Edit</button>
            </li>
          ))}
        </ul>
      )}

      {formData.name && (
        <div style={{ marginTop: "20px" }}>
          <h2>Edit User</h2>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Enter new name"
          />
          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Enter new email"
          />
          <button onClick={handleSave}>Save</button>
        </div>
      )}
    </div>
  );
}