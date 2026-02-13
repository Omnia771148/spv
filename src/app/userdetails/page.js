"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loading from "../loading/page";
import "./userdetails.css"; // Import the custom styles

export default function UsersPage() {
  const router = useRouter();
  // Store only the single logged-in user
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit form state
  const [formData, setFormData] = useState({ name: "", email: "", dateOfBirth: "", phone: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

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
      setLoading(true); // Show brand loader during save
      const storedUserId = localStorage.getItem("userId");
      const res = await fetch(`/api/users/${storedUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        setLoading(false);
        setShowError(true);
        return;
      }

      const updatedUser = await res.json();
      setUser(updatedUser); // Update the displayed user
      setIsEditing(false);
      setLoading(false);
      setShowSuccess(true);
      // Auto-close after 2.5 seconds
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err) {
      setLoading(false);
      console.error("Error updating user:", err);
      setShowError(true);
    }
  };

  if (loading) return <Loading />;

  if (!user) {
    return (
      <div className="user-details-container" style={{ justifyContent: 'center' }}>
        <h2>Please log in to view details.</h2>
      </div>
    );
  }

  return (
    <div className="user-details-container">
      {/* Header - Matching My Orders style */}
      <div className="orders-header">
        <button className="back-button-svg" onClick={() => router.back()}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div className="orders-header-pill">
          <span className="header-icon"><i className={isEditing ? "fas fa-user-edit" : "fas fa-user"}></i></span>
          <h2>{isEditing ? "Edit Profile" : "My Profile"}</h2>
        </div>
      </div>

      <div className="user-card">
        {/* Heading removed from here */}



        {/* Name Row */}
        <div className="data-row">
          <div className="data-icon">
            <i className="fas fa-user-circle"></i>
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
        {/* Phone Row (Read-only always, consistent look) */}
        <div className="data-row">
          <div className="data-icon">
            <i className="fas fa-phone" style={{ transform: "rotate(90deg)" }}></i>
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

        {/* Email Row */}
        <div className="data-row">
          <div className="data-icon">
            <i className="fas fa-envelope-open"></i>
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
            <i className="fas fa-calendar"></i>
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
              <i className="fas fa-user-edit"></i>
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

      {/* Success Popup UI */}
      {showSuccess && (
        <div className="success-popup-overlay">
          <div className="success-popup-card">
            <div className="success-icon-circle">
              <svg viewBox="0 0 24 24" width="44" height="44">
                <path fill="white" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
              </svg>
            </div>
            <h2 className="success-title">Updated!</h2>
            <p className="success-message">
              Your profile has been<br />
              successfully updated.
            </p>
            <button className="success-continue-btn" onClick={() => setShowSuccess(false)}>
              Back
            </button>
          </div>
        </div>
      )}

      {/* Error Popup UI */}
      {showError && (
        <div className="error-popup-overlay">
          <div className="error-popup-card">
            <div className="error-icon-circle">
              <span className="error-icon-cross">✕</span>
            </div>
            <h2 className="error-title">Failed!</h2>
            <p className="error-text">
              Unable to update your profile.<br />
              Please try again later.
            </p>
            <button className="error-retry-btn" onClick={() => setShowError(false)}>
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}