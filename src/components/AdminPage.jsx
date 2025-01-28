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
    } else {
      fetchItems("users");
      fetchItems("craftspeople");
      fetchItems("reviews");
      fetchItems("support");
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
  const [reviews, setReviews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [supportInquiries, setSupportInquiries] = useState([]);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const categories = [
    "Plumber",
    "Blacksmith",
    "Electrician",
    "Mechanic",
    "Carpenter",
    "Gardener",
    "Mason",
    "Cleaner",
    "Tailor",
    "Tiler",
  ];
  
  const cities = [
    "Jenin",
    "Tubas",
    "Tulkarem",
    "Nablus",
    "Qalqilya",
    "Salfit",
    "Ramallah and al-Birah",
    "Jericho",
    "Bethlehem",
    "Hebron",
  ];  


  const urlMap = {
    users: "http://localhost/Sal7ly/php_backend/adminuserhandler.php",
    craftspeople: "http://localhost/Sal7ly/php_backend/admincraftsmanhandler.php",
    reviews: "http://localhost/Sal7ly/php_backend/adminreviewhandler.php",
    support: "http://localhost/Sal7ly/php_backend/adminsupporthandler.php",
  };

  const fetchItems = async (type) => {
    try {
      const response = await fetch(urlMap[type], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fetch" }),
      });
      const data = await response.json();

      if (data.success) {
        if (type === "users") setUsers(data.users);
        else if (type === "craftspeople") setCraftspeople(data.craftspeople);
        else if (type === "reviews") setReviews(data.reviews);
        else if (type === "support") setSupportInquiries(data.inquiries);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
    }
  };

  const tabs = [
    { label: "Dashboard", value: "dashboard" },
    { label: "Manage Users", value: "users" },
    { label: "Manage Craftspeople", value: "craftspeople" },
    { label: "Manage Reviews", value: "reviews" },
    { label: "Support Inquiries", value: "support" },
  ];

  const handleModifyItem = async (type, id, updatedData) => {
    if (!window.confirm("Are you sure you want to save these changes?")) return;
    
    const body = {
      action: "modify",
      id,
      ...updatedData,
    };
  
    try {
      const response = await fetch(urlMap[type], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
  
      if (data.success) {
        switch (type) {
          case "users":
            setUsers(users.map(user => user.id === id ? {...user, ...updatedData} : user));
            break;
          case "craftspeople":
            setCraftspeople(craftspeople.map(person => person.id === id ? {...person, ...updatedData} : person));
            break;
          case "reviews":
            setReviews(reviews.map(review => review.id === id ? {...review, ...updatedData} : review));
            break;
        }
        setIsEditPopupOpen(false);
        alert(`${type === "users" ? "User" : type === "craftspeople" ? "Craftsman" : "Review"} saved successfully!`);
      } else {
        alert(`Failed to modify ${type}: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error(`Error modifying ${type}:`, error);
      alert("An error occurred while modifying the item.");
    }
  };
    
  const handleDeleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type === "reviews" ? "review" : type}?`)) return;
    
    try {
      const response = await fetch(urlMap[type], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      });
      const data = await response.json();
  
      if (data.success) {
        switch (type) {
          case "users":
            setUsers(users.filter(user => user.id !== id));
            break;
          case "craftspeople":
            setCraftspeople(craftspeople.filter(person => person.id !== id));
            break;
          case "reviews":
            setReviews(reviews.filter(review => review.id !== id));
            break;
        }
        alert(`${type === "users" ? "User" : type === "craftspeople" ? "Craftsman" : "Review"} deleted successfully!`);
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

  const handleMarkAsFinished = async (id) => {
    try {
      const response = await fetch(urlMap.support, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markFinished", id }),
      });
      const data = await response.json();
      if (data.success) {
        fetchItems("support");
        setIsModalOpen(false);
      } else {
        alert("Failed to mark as finished.");
      }
    } catch (error) {
      console.error("Error marking inquiry as finished:", error);
    }
  };

  const openInquiryModal = (inquiry) => {
    setSelectedInquiry(inquiry);
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase().replace(/\+/g, '');
    // if (!query) return true;
    return (
      String(user.id).includes(query) ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      String(user.mobile).includes(query)
    );
  });

  const filteredCraftspeople = craftspeople.filter(person => {
    const query = searchQuery.toLowerCase().replace(/\+/g, '');
    // if (!query) return true;
    return (
      String(person.id).includes(query) ||
      person.name.toLowerCase().includes(query) ||
      person.email.toLowerCase().includes(query) ||
      String(person.mobile).includes(query) ||
      person.city.toLowerCase().includes(query) ||
      person.category.toLowerCase().includes(query)
    );
  });

  const filteredReviews = reviews.filter(review => {
    const searchLower = searchQuery.toLowerCase();
    // if (!query) return true;
    return (
      review.user_name.toLowerCase().includes(searchLower) ||
      review.request_id.toString().includes(searchLower)
    );
  });

  useEffect(() => {
    if (activeTab === "users") fetchItems("users");
    if (activeTab === "craftspeople") fetchItems("craftspeople");
    if (activeTab === "reviews") fetchItems("reviews");
    if (activeTab === "support") fetchItems("support");
    setSearchQuery("");
  }, [activeTab]);

  const renderSupportTable = (openedStatus) => {
    const filteredInquiries = supportInquiries.filter((inquiry) => inquiry.opened === openedStatus);

    return (
      <table className="admin-table">
        <thead className="admin-table__header">
          <tr>
            <th onClick={() => sortInquiries("name")}>Name</th>
            <th onClick={() => sortInquiries("created_at")}>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody className="admin-table__body">
          {filteredInquiries.map((inquiry) => (
            <tr key={inquiry.id} className="admin-table__row">
              <td className="admin-table__data">{inquiry.name}</td>
              <td className="admin-table__data">{new Date(inquiry.created_at).toLocaleString()}</td>
              <td className="admin-table__actions">
                <button
                  className="admin-table__action-btn admin-table__action-btn--view"
                  onClick={() => openInquiryModal(inquiry)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const sortInquiries = (key) => {
    const sorted = [...supportInquiries].sort((a, b) =>
      a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0
    );
    setSupportInquiries(sorted);
  };

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <h2 className="admin__sidebar-title">Admin Panel</h2>
        <nav className="admin__nav">
          {tabs.map(tab => (
            <div
              key={tab.value}
              className={`admin__nav-item ${
                activeTab === tab.value ? "admin__nav-item--active" : ""
              }`}
              onClick={() => setActiveTab(tab.value)}
            >
              <Link to="#" className="admin__nav-link">{tab.label}</Link>
            </div>
          ))}
        </nav>
      </aside>

      <main className="admin__main">
        <h1 className="admin__main-title">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </h1>

        {activeTab === "dashboard" && (
          <div className="admin__dashboard">
            <div className="admin__dashboard-overview">
              <div className="admin__dashboard-section">
                <h3 className="admin__section-title">📊 Dashboard (Current View)</h3>
                <div className="dashboard-stats">
                  <div className="dashboard-stat">
                    <span className="stat-number">{users.length}</span>
                    <span className="stat-label">Total Users</span>
                  </div>
                  <div className="dashboard-stat">
                    <span className="stat-number">{craftspeople.length}</span>
                    <span className="stat-label">Craftspeople</span>
                  </div>
                  <div className="dashboard-stat">
                    <span className="stat-number">{reviews.length}</span>
                    <span className="stat-label">Reviews</span>
                  </div>
                  <div className="dashboard-stat">
                    <span className="stat-number">
                      {supportInquiries.filter(i => i.opened === 1).length}
                    </span>
                    <span className="stat-label">Open Inquiries</span>
                  </div>
                </div>
                <p className="admin__section-text">
                  Quick look at the management sections.
                </p>
              </div>

              <div className="admin__dashboard-section">
                <h3 className="admin__section-title">👥 Manage Users</h3>
                <ul className="admin__feature-list">
                  <li className="admin__feature-item">View all registered end-users</li>
                  <li className="admin__feature-item">Edit user details</li>
                  <li className="admin__feature-item">Reset user passwords</li>
                  <li className="admin__feature-item">Delete user accounts</li>
                </ul>
              </div>

              <div className="admin__dashboard-section">
                <h3 className="admin__section-title">🛠️ Manage Craftspeople</h3>
                <ul className="admin__feature-list">
                  <li className="admin__feature-item">View service providers</li>
                  <li className="admin__feature-item">Edit craftsperson profiles</li>
                  <li className="admin__feature-item">Verify/unverify craftspeople</li>
                  <li className="admin__feature-item">Update location information</li>
                </ul>
              </div>

              <div className="admin__dashboard-section">
                <h3 className="admin__section-title">⭐ Manage Reviews</h3>
                <ul className="admin__feature-list">
                  <li className="admin__feature-item">Monitor user-submitted reviews</li>
                  <li className="admin__feature-item">Search by user name or request ID</li>
                  <li className="admin__feature-item">Edit review content and ratings</li>
                  <li className="admin__feature-item">Moderate reviews</li>
                </ul>
              </div>
              <div className="admin__dashboard-section">
                <h3 className="admin__section-title">📩 Support Overview</h3>
                <div className="support-overview">
                  <div className="support-progress">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${(supportInquiries.filter(i => i.opened === 0).length / supportInquiries.length * 100 || 0)}%` }}
                    ></div>
                    <div className="progress-stats">
                      <span>
                        {supportInquiries.filter(i => i.opened === 0).length}/
                        {supportInquiries.length} Resolved
                      </span>
                      <span>
                        {Math.round(supportInquiries.filter(i => i.opened === 0).length / supportInquiries.length * 100 || 0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "users" && (
          <div className="admin__section">
            <div className="admin__search">
              <input
                type="text"
                className="admin__search-input"
                placeholder="Search by ID, name, email, or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <table className="admin-table">
              <thead className="admin-table__header">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="admin-table__body">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="admin-table__row">
                    <td className="admin-table__data">{user.id}</td>
                    <td className="admin-table__data">{user.name}</td>
                    <td className="admin-table__data">{user.email}</td>
                    <td className="admin-table__data">+{user.mobile}</td>
                    <td className="admin-table__actions">
                      <button
                        className="admin-table__action-btn admin-table__action-btn--edit"
                        onClick={() => openEditPopup("users", user)}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-table__action-btn admin-table__action-btn--delete"
                        onClick={() => handleDeleteItem("users", user.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === "craftspeople" && (
          <div className="admin__section">
            <div className="admin__search">
              <input
                type="text"
                className="admin__search-input"
                placeholder="Search by ID, name, email, number, city, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <table className="admin-table">
              <thead className="admin-table__header">
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
              <tbody className="admin-table__body">
                {filteredCraftspeople.map(person => (
                  <tr key={person.id} className="admin-table__row">
                    <td className="admin-table__data">{person.id}</td>
                    <td className="admin-table__data">{person.name}</td>
                    <td className="admin-table__data">{person.email}</td>
                    <td className="admin-table__data">+{person.mobile}</td>
                    <td className="admin-table__data">{person.city}</td>
                    <td className="admin-table__data">{person.category}</td>
                    <td className="admin-table__data">
                      {person.verified === 1 ? "Yes" : "No"}
                    </td>
                    <td className="admin-table__actions">
                      <button
                        className="admin-table__action-btn admin-table__action-btn--edit"
                        onClick={() => openEditPopup("craftspeople", person)}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-table__action-btn admin-table__action-btn--delete"
                        onClick={() => handleDeleteItem("craftspeople", person.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === "reviews" && (
          <div className="admin__section">
            <div className="admin__search">
              <input
                type="text"
                className="admin__search-input"
                placeholder="Search by user name or request ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <table className="admin-table">
              <thead className="admin-table__header">
                <tr>
                  <th>User Name</th>
                  <th>Request ID</th>
                  <th>Rating</th>
                  <th>Review Text</th>
                  <th>Created At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="admin-table__body">
                {filteredReviews.map(review => (
                  <tr key={review.id} className="admin-table__row">
                    <td className="admin-table__data">{review.user_name}</td>
                    <td className="admin-table__data">{review.request_id}</td>
                    <td className="admin-table__data">{review.rating}/5</td>
                    <td className="admin-table__data">{review.review_text}</td>
                    <td className="admin-table__data">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="admin-table__data">
                      {review.status === 1 ? "Active" : "Inactive"}
                    </td>
                    <td className="admin-table__actions">
                      <button
                        className="admin-table__action-btn admin-table__action-btn--edit"
                        onClick={() => openEditPopup("reviews", review)}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-table__action-btn admin-table__action-btn--delete"
                        onClick={() => handleDeleteItem("reviews", review.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === "support" && (
          <>
            <div className="admin__section">
              <h3>Opened Inquiries</h3>
              {renderSupportTable(1)}
              <h3>Finished Inquiries</h3>
              {renderSupportTable(0)}
            </div>

            {isModalOpen && selectedInquiry && (
              <div className="popup popup--inquiry">
                <div className="popup__content">
                  <div className="popup__header">
                    <h2>Inquiry Details</h2>
                    <div className="popup__user-info">
                      <p><strong>Name:</strong> {selectedInquiry.name}</p>
                      <p><strong>Email:</strong> {selectedInquiry.email}</p>
                    </div>
                  </div>

                  <div className="popup__message-box">
                    <pre>{selectedInquiry.message}</pre>
                  </div>

                  <div className="popup__footer">
                    <p className="popup__timestamp">
                      <strong>Received:</strong> {new Date(selectedInquiry.created_at).toLocaleString()}
                    </p>
                    <div className="popup__actions">
                      {selectedInquiry.opened === 1 && (
                        <button
                          className="popup__btn popup__btn--mark-finished"
                          onClick={() => handleMarkAsFinished(selectedInquiry.id)}
                        >
                          Mark as Finished
                        </button>
                      )}
                      <button
                        className="popup__btn popup__btn--close"
                        onClick={() => setIsModalOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {isEditPopupOpen && (
          <div className="popup popup--edit">
            <div className="popup__content">
              <h2 className="popup__title">
                Edit {selectedItem.type === "users" ? "User" : selectedItem.type === "craftspeople" ? "Craftsman" : "Review"}
              </h2>
              <form className="popup__form" onSubmit={(e) => e.preventDefault()}>
                {selectedItem.type === "users" && (
                  <>
                    <div className="popup__field-group">
                      <label className="popup__label">
                        Name:
                        <input
                          className="popup__input"
                          type="text"
                          name="name"
                          value={updatedData.name || ""}
                          onChange={handleInputChange}
                        />
                      </label>
                    </div>
                    <div className="popup__field-group">
                      <label className="popup__label">
                        Email:
                        <input
                          className="popup__input"
                          type="email"
                          name="email"
                          value={updatedData.email || ""}
                          onChange={handleInputChange}
                        />
                      </label>
                    </div>
                    <div className="popup__field-group">
                      <label className="popup__label">
                        Mobile:
                        <input
                          className="popup__input"
                          type="text"
                          name="mobile"
                          value={updatedData.mobile || ""}
                          onChange={handleInputChange}
                        />
                      </label>
                    </div>
                    <div className="popup__field-group">
                      <label className="popup__label">
                        Password (optional):
                        <input
                          className="popup__input"
                          type="password"
                          name="password"
                          placeholder="Enter a new password"
                          onChange={handleInputChange}
                        />
                      </label>
                    </div>
                  </>
                )}
                {selectedItem.type === "craftspeople" && (
                  <>
                    <div className="popup__field-group">
                      <label className="popup__label">
                        Name:
                        <input
                          className="popup__input"
                          type="text"
                          name="name"
                          value={updatedData.name || ""}
                          onChange={handleInputChange}
                        />
                      </label>
                    </div>
                    <div className="popup__field-group">
                      <label className="popup__label">
                        Email:
                        <input
                          className="popup__input"
                          type="email"
                          name="email"
                          value={updatedData.email || ""}
                          onChange={handleInputChange}
                        />
                      </label>
                    </div>
                    <div className="popup__field-group">
                      <label className="popup__label">
                        Mobile:
                        <input
                          className="popup__input"
                          type="text"
                          name="mobile"
                          value={updatedData.mobile || ""}
                          onChange={handleInputChange}
                        />
                      </label>
                    </div>
                    <div className="popup__field-group">
                      <label className="popup__label">
                        City:
                        <select
                          className="popup__select"
                          name="city"
                          value={updatedData.city || ""}
                          onChange={handleInputChange}
                        >
                          <option value="">Select City</option>
                          {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    
                    <div className="popup__field-group">
                      <label className="popup__label">
                        Category:
                        <select
                          className="popup__select"
                          name="category"
                          value={updatedData.category || ""}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Category</option>
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="popup__field-group">
                      <label className="popup__label popup__label--checkbox">
                        Verified:
                        <input
                          className="popup__checkbox"
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
                    </div>
                    <div className="popup__field-group">
                      <label className="popup__label">
                        Password (optional):
                        <input
                          className="popup__input"
                          type="password"
                          name="password"
                          placeholder="Enter a new password"
                          onChange={handleInputChange}
                        />
                      </label>
                    </div>
                  </>
                )}
                {selectedItem.type === "reviews" && (
                  <>
                    <div className="popup__field-group">
                      <label className="popup__label">
                        Rating (1-5):
                        <input
                          className="popup__input"
                          type="number"
                          name="rating"
                          min="1"
                          max="5"
                          value={updatedData.rating || ""}
                          onChange={handleInputChange}
                        />
                      </label>
                    </div>
                    <div className="popup__field-group">
                      <label className="popup__label">
                        Review Text:
                        <textarea
                          className="popup__textarea"
                          name="review_text"
                          value={updatedData.review_text || ""}
                          onChange={handleInputChange}
                        />
                      </label>
                    </div>
                    <div className="popup__field-group">
                      <label className="popup__label">
                        Status:
                        <select
                          className="popup__select"
                          name="status"
                          value={updatedData.status || 1}
                          onChange={handleInputChange}
                        >
                          <option value={1}>Active</option>
                          <option value={0}>Inactive</option>
                        </select>
                      </label>
                    </div>
                  </>
                )}
                <div className="popup__actions">
                  <button
                    className="popup__btn popup__btn--save"
                    onClick={() =>
                      handleModifyItem(selectedItem.type, selectedItem.item.id, updatedData)
                    }
                  >
                    Save
                  </button>
                  <button
                    className="popup__btn popup__btn--cancel"
                    onClick={() => setIsEditPopupOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isConfirmPopupOpen && (
          <div className="popup popup--confirm">
            <div className="popup__content">
              <p className="popup__message">
                Are you sure you want to delete this {selectedItem.type === "reviews" ? "review" : selectedItem.type.slice(0, -1)}?
              </p>
              <div className="popup__actions">
                <button
                  className="popup__btn popup__btn--confirm"
                  onClick={() => handleDeleteItem(selectedItem.type, selectedItem.item.id)}
                >
                  Yes
                </button>
                <button
                  className="popup__btn popup__btn--cancel"
                  onClick={() => setIsConfirmPopupOpen(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {isSavedPopupOpen && (
          <div className="popup popup--success">
            <div className="popup__content popup__content--success">
              <p className="popup__message">
                {selectedItem.type === "reviews" ? "Review" : selectedItem.type.slice(0, -1)} saved successfully!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;