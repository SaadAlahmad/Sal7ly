import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import "../css/AdminPage.css";

const AdminPage = () => {
  const { user, loading } = useContext(UserContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && (!user || user.userType !== "admin")) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [craftspeople, setCraftspeople] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [isSavedPopupOpen, setIsSavedPopupOpen] = useState(false);
  const [updatedData, setUpdatedData] = useState({});

  const fetchItems = async (type) => {
    const url = type === "users" 
      ? "http://localhost/Sal7ly/php_backend/adminuserhandler.php" 
      : "http://localhost/Sal7ly/php_backend/admincraftsmanhandler.php";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fetch" }),
      });
      const data = await response.json();

      if (data.success) {
        if (type === "users") {
          setUsers(data.users);
        } else {
          setCraftspeople(data.craftspeople);
        }
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    }
  };

  const handleModifyItem = async (type, id, updatedData) => {
    if (!window.confirm("Are you sure you want to save these changes?")) return;
  
    const url = type === "users"
      ? "http://localhost/Sal7ly/php_backend/adminuserhandler.php"
      : "http://localhost/Sal7ly/php_backend/admincraftsmanhandler.php";
  
    const body = {
      action: "modify",
      id,
      ...updatedData,
    };
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
  
      if (data.success) {
        if (type === "users") {
          setUsers(users.map(user => (user.id === id ? { ...user, ...updatedData } : user)));
        } else {
          setCraftspeople(craftspeople.map(person => (person.id === id ? { ...person, ...updatedData } : person)));
        }
        setIsEditPopupOpen(false);
        alert("Changes saved successfully!");
      } else {
        alert(`Failed to modify ${type}: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error(`Error modifying ${type}:`, error);
      alert("An error occurred while modifying the item.");
    }
  };
  
  const handleDeleteItem = async (type, id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
  
    const url = type === "users"
      ? "http://localhost/Sal7ly/php_backend/adminuserhandler.php"
      : "http://localhost/Sal7ly/php_backend/admincraftsmanhandler.php";
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await response.json();
  
      if (data.success) {
        if (type === "users") {
          setUsers(users.filter(user => user.id !== id));
        } else {
          setCraftspeople(craftspeople.filter(person => person.id !== id));
        }
        alert("Item deleted successfully!");
      } else {
        alert(`Failed to delete ${type}: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert("An error occurred while deleting the item.");
    }
  };
  
  const openEditPopup = (type, item) => {
    setSelectedItem({ type, item });
    setUpdatedData(item);
    setIsEditPopupOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData({ ...updatedData, [name]: value });
  };

  useEffect(() => {
    if (activeTab === "users") fetchItems("users");
    if (activeTab === "craftspeople") fetchItems("craftspeople");
  }, [activeTab]);

  return (
    <div className="admin-page">
      <div className="sidebar">
        <h2>Admin Panel</h2>
        <ul>
          {[{ label: "Dashboard", value: "dashboard" }, { label: "Manage Users", value: "users" }, { label: "Manage Craftspeople", value: "craftspeople" }].map(tab => (
            <li
              key={tab.value}
              className={activeTab === tab.value ? "active" : ""}
              onClick={() => setActiveTab(tab.value)}
            >
              <Link to="#">{tab.label}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
        <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
        {activeTab === "users" && (
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.mobile}</td>
                  <td>
                    <button onClick={() => openEditPopup("users", user)}>Edit</button>
                    <button onClick={() => handleDeleteItem("users", user.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {activeTab === "craftspeople" && (
          <table className="craftspeople-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>City</th>
                <th>Category</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {craftspeople.map(person => (
                <tr key={person.id}>
                  <td>{person.id}</td>
                  <td>{person.name}</td>
                  <td>{person.email}</td>
                  <td>{person.mobile}</td>
                  <td>{person.city}</td>
                  <td>{person.category}</td>
                  <td>{person.verified === 1 ? "Yes" : "No"}</td>
                  <td>
                    <button onClick={() => openEditPopup("craftspeople", person)}>Edit</button>
                    <button onClick={() => handleDeleteItem("craftspeople", person.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isEditPopupOpen && (
        <div className="popup-overlay">
          <div className="edit-popup">
            <h2>Edit {selectedItem.type === "users" ? "User" : "Craftsperson"}</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              {selectedItem.type === "users" && (
                <>
                  <label>
                    Name:
                    <input
                      type="text"
                      name="name"
                      value={updatedData.name || ""}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Email:
                    <input
                      type="email"
                      name="email"
                      value={updatedData.email || ""}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Mobile:
                    <input
                      type="text"
                      name="mobile"
                      value={updatedData.mobile || ""}
                      onChange={handleInputChange}
                    />
                  </label>
                </>
              )}
              {selectedItem.type === "craftspeople" && (
                <>
                  <label>
                    Name:
                    <input
                      type="text"
                      name="name"
                      value={updatedData.name || ""}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Email:
                    <input
                      type="email"
                      name="email"
                      value={updatedData.email || ""}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Mobile:
                    <input
                      type="text"
                      name="mobile"
                      value={updatedData.mobile || ""}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    City:
                    <input
                      type="text"
                      name="city"
                      value={updatedData.city || ""}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Category:
                    <input
                      type="text"
                      name="category"
                      value={updatedData.category || ""}
                      onChange={handleInputChange}
                    />
                  </label>
                  <label>
                    Verified:
                    <input
                      type="checkbox"
                      name="verified"
                      checked={!!updatedData.verified}
                      onChange={(e) =>
                        setUpdatedData({
                          ...updatedData,
                          verified: e.target.checked ? 1 : 0,
                        })
                      }
                    />
                  </label>
                </>
              )}
              <label>
                Password (optional):
                <input
                  type="password"
                  name="password"
                  placeholder="Enter a new password"
                  onChange={handleInputChange}
                />
              </label>
              <div className="popup-buttons">
                <button
                  type="save"
                  onClick={() =>
                    handleModifyItem(selectedItem.type, selectedItem.item.id, updatedData)
                  }
                >
                  Save
                </button>
                <button type="cancel" onClick={() => setIsEditPopupOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isConfirmPopupOpen && (
        <div className="popup-overlay">
          <div className="confirm-popup">
            <p>Are you sure you want to delete this {selectedItem.type}?</p>
            <div className="popup-buttons">
              <button onClick={() => handleDeleteItem(selectedItem.type, selectedItem.item.id)}>Yes</button>
              <button onClick={() => setIsConfirmPopupOpen(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {isSavedPopupOpen && (
        <div className="popup-overlay success">
          <div className="success-popup">
            <p>{selectedItem.type === "users" ? "User" : "Craftsperson"} saved successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
