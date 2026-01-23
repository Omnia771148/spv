"use client";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./userdetails.css"; // Import the custom styles

export default function UsersPage() {
  // Store only the single logged-in user
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [formData, setFormData] = useState({ name: "", email: "", dateOfBirth: "", phone: "" });
  const [isEditing, setIsEditing] = useState(false);

  // Helper to format date for display and input
  const formatDate = (isoString) => {
    if (!isoString) return "";
    return new Date(isoString).toISOString().split('T')[0];
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUserId = localStorage.getItem("userId");
        if (!storedUserId) {
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/users/${storedUserId}`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          console.error("Failed to fetch user");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleEditClick = () => {
    if (!user) return;
    setFormData({
      name: user.name,
      email: user.email,
      dateOfBirth: user.dateOfBirth ? formatDate(user.dateOfBirth) : "",
      phone: user.phone || ""
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    // Age Validation (18+)
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 18) {
        alert("You must be at least 18 years old.");
        return;
      }
    }

    try {
      const storedUserId = localStorage.getItem("userId");
      const res = await fetch(`/api/users/${storedUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        alert("Failed to update user");
        return;
      }

      const updatedUser = await res.json();
      setUser(updatedUser); // Update the displayed user
      setIsEditing(false);
      alert("User updated successfully!");
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user");
    }
  };

  if (loading) return (
    <div className="user-details-container" style={{ justifyContent: 'center' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="user-details-container" style={{ justifyContent: 'center' }}>
        <h2>Please log in to view details.</h2>
      </div>
    );
  }

  return (
    <div className="user-details-container">
      {/* Back Arrow */}
      <div className="back-arrow" onClick={() => window.history.back()}>
        <i className="fas fa-chevron-left"></i>
      </div>

      <div className="user-card">
        {/* Card Heading */}
        <h2 className="card-title">{isEditing ? "Edit Profile" : "My Profile"}</h2>

        {/* Phone Row (Read-only always, consistent look) */}
        <div className="data-row">
          <div className="data-icon">
            <i className="fas fa-phone-alt"></i>
          </div>
          {isEditing ? (
            <input
              type="text"
              className="input-field"
              value={formData.phone}
              readOnly
            />
          ) : (
            <div className="data-text">{user.phone || "No phone number"}</div>
          )}
        </div>

        {/* Name Row */}
        <div className="data-row">
          <div className="data-icon">
            <i className="fas fa-user"></i>
          </div>
          {isEditing ? (
            <input
              type="text"
              className="input-field"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter Name"
            />
          ) : (
            <div className="data-text">{user.name || "No Name"}</div>
          )}
        </div>

        {/* Email Row */}
        <div className="data-row">
          <div className="data-icon">
            <i className="fas fa-envelope"></i>
          </div>
          {isEditing ? (
            <input
              type="email"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter Email"
            />
          ) : (
            <div className="data-text">{user.email || "No Email"}</div>
          )}
        </div>

        {/* DOB Row */}
        <div className="data-row">
          <div className="data-icon">
            <i className="fas fa-calendar-alt"></i>
          </div>
          {isEditing ? (
            <DatePicker
              selected={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
              onChange={(date) => {
                setFormData({ ...formData, dateOfBirth: date ? date.toISOString().split('T')[0] : '' });
              }}
              placeholderText="DD/MM/YYYY"
              dateFormat="dd/MM/yyyy"
              className="input-field"
              wrapperClassName="w-100"
              strictParsing
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              popperPlacement="bottom-start"
              shouldCloseOnSelect={true}
            />
          ) : (
            <div className="data-text">{user.dateOfBirth ? formatDate(user.dateOfBirth) : "Date of Birth not set"}</div>
          )}
        </div>

        {/* Bottom Actions */}
        {!isEditing ? (
          /* Edit Button (Bottom) */
          <div className="card-bottom-btn" onClick={handleEditClick}>
            <div className="edit-icon-box">
              <i className="fas fa-pen"></i>
            </div>
            <span className="btn-text">Edit my profile</span>
          </div>
        ) : (
          /* Save/Cancel Buttons (Bottom) */
          <div className="action-buttons">
            <button className="save-btn" onClick={handleSave}>Save</button>
            <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
}