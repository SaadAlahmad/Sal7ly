import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import "../css/SentRequests.css";

const SentRequests = () => {
  const { user, setUser, loading } = useContext(UserContext);
  const [requests, setRequests] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationText, setApplicationText] = useState("");
  const [modifyText, setModifyText] = useState("");

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost/Sal7ly/php_backend/logout.php", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setUser(null);
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const fetchApplicationsAndRequests = async () => {
    try {
      // Fetch applications
      const applicationsResponse = await fetch(
        "http://localhost/Sal7ly/php_backend/fetchApplicationsHandler.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ craftsman_id: user.id, action: "fetch" }),
        }
      );

      const applicationsData = await applicationsResponse.json();
      if (!applicationsResponse.ok) {
        throw new Error(
          applicationsData.error || "Failed to fetch applications."
        );
      }
      const applications = applicationsData.applications || [];

      // Fetch requests
      const requestsResponse = await fetch(
        "http://localhost/Sal7ly/php_backend/sentrequestshandler.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: user.category,
            city: user.city,
          }),
        }
      );

      const requestsData = await requestsResponse.json();
      if (!requestsResponse.ok) {
        throw new Error(requestsData.error || "Failed to fetch requests.");
      }
      const requests = requestsData.requests || [];

      // Map requests to include `hasApplication` and applications with `request`
      const updatedRequests = requests.map((request) => {
        const existingApplication = applications.find(
          (app) => app.request_id === request.id
        );
        return { ...request, hasApplication: !!existingApplication };
      });

      const applicationsWithRequests = applications.map((app) => {
        const matchingRequest = requests.find((req) => req.id === app.request_id);
        return { ...app, request: matchingRequest || null };
      });

      // Update state
      setApplications(applicationsWithRequests);
      setRequests(updatedRequests);
    } catch (error) {
      console.error("Error fetching applications and requests:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    if (loading) return;
  
    if (!user || user.userType !== "craftsman") {
      setError("You can't access this page. Please log in.");
      return;
    }
    
    fetchApplicationsAndRequests();
  }, [user, loading]);
  
  const handleApplyClick = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const handleModifyClick = (application) => {
    setSelectedApplication(application);
    setSelectedRequest(application.request);
    setModifyText(application.message);
    setShowModifyModal(true);
  };

  const handleDeleteApplication = async (applicationId) => {
    try {
      const response = await fetch("http://localhost/Sal7ly/php_backend/fetchApplicationsHandler.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ craftsman_id: user.id, application_id: applicationId, action: "delete" }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete application.");
      }
      await fetchApplicationsAndRequests();
      alert("Application deleted successfully.");
      setApplications((prev) =>
        prev.filter((application) => application.id !== applicationId)
      );
    } catch (error) {
      console.error("Error deleting application:", error);
      alert("Error deleting application: " + error.message);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setApplicationText("");
  };

  const handleCloseModifyModal = () => {
    setShowModifyModal(false);
    setModifyText("");
  };

  const handleApplicationSubmit = async () => {
    if (!applicationText.trim()) {
      alert("Application text is required.");
      return;
    }
    try {
      const response = await fetch("http://localhost/Sal7ly/php_backend/applyrequesthandler.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          request_id: selectedRequest.id,
          craftsman_id: user.id,
          applicationText,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to apply for the request.");
      }

      await fetchApplicationsAndRequests();

      alert("Application submitted successfully!");
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application: " + error.message);
    }
  };

  const handleModifySubmit = async () => {
    if (!modifyText.trim()) {
      alert("Modified text is required.");
      return;
    }
    try {
      const response = await fetch("http://localhost/Sal7ly/php_backend/fetchApplicationsHandler.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          craftsman_id: user.id,
          application_id: selectedApplication.id,
          message: modifyText,
          action: "modify",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to modify application.");
      }

      alert("Application modified successfully!");
      handleCloseModifyModal();
    } catch (error) {
      console.error("Error modifying application:", error);
      alert("Error modifying application: " + error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="sent-requests">
      <h1>Available Requests</h1>
      <div className="requests-container">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div className="request-card" key={request.id}>
              <p><strong>ID:</strong> {request.id}</p>
              <h2>User: {request.name}</h2>
              <p><strong>Details:</strong> {request.details}</p>
              <p><strong>City:</strong> {request.city}</p>
              <p><strong>Location:</strong> {request.location}</p>
              <p><strong>Created At:</strong> {new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }).format(new Date(request.created_at))}</p>
              {request.hasApplication ? (
                <button onClick={() => handleModifyClick(applications.find(app => app.request_id === request.id), request)}>
                  Modify
                </button>
              ) : (
                <button onClick={() => handleApplyClick(request)}>
                  Apply
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No matching requests found.</p>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Apply for Request</h2>
            <p><strong>ID:</strong> {selectedRequest.id}</p>
            <h2>User: {selectedRequest.name}</h2>
            <p><strong>Details:</strong> {selectedRequest.details}</p>
            <p><strong>City:</strong> {selectedRequest.city}</p>
            <p><strong>Location:</strong> {selectedRequest.location}</p>
            <p><strong>Created At:</strong> {new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }).format(new Date(selectedRequest.created_at))}</p>
            <textarea
              value={applicationText}
              onChange={(e) => setApplicationText(e.target.value)}
              placeholder="Enter your application text here..."
            />
            <div className="modal-actions">
              <button onClick={handleApplicationSubmit}>Submit Application</button>
              <button onClick={handleCloseModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showModifyModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Modify Application</h2>
            <p><strong>ID:</strong> {selectedRequest.id}</p>
            <h2>User: {selectedRequest.name}</h2>
            <p><strong>Details:</strong> {selectedRequest.details}</p>
            <p><strong>City:</strong> {selectedRequest.city}</p>
            <p><strong>Location:</strong> {selectedRequest.location}</p>
            <p><strong>Created At:</strong> {new Intl.DateTimeFormat('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            }).format(new Date(selectedRequest.created_at))}</p>
            <textarea
              value={modifyText}
              onChange={(e) => setModifyText(e.target.value)}
              placeholder="Modify your application message..."
            />
            <div className="modal-actions">
              <button onClick={handleModifySubmit}>Submit Modification</button>
              <button onClick={handleCloseModifyModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="applications-container">
        <h2>Your Applications</h2>
        {applications.length > 0 ? (
          applications.map((app) => (
            <div className="application-card" key={app.id}>
              <p><strong>Request ID:</strong> {app.request_id}</p>
              <p><strong>Details:</strong> {app.request.details}</p>
              <p><strong>Message:</strong> {app.message}</p>
              <p><strong>Created At:</strong> {new Intl.DateTimeFormat('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              }).format(new Date(app.request.created_at))}</p>
              <button onClick={() => handleModifyClick(app)}>Modify</button>
              <button onClick={() => handleDeleteApplication(app.id)}>Delete</button>
            </div>
          ))
        ) : (
          <p>You have not applied for any requests yet.</p>
        )}
      </div>
    </div>
  );
};

export default SentRequests;
