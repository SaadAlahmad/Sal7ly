import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import "../css/SentRequests.css";

const SentRequests = () => {
  const { user, loading } = useContext(UserContext);
  const [requests, setRequests] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationText, setApplicationText] = useState("");
  const [modifyText, setModifyText] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [actionCallback, setActionCallback] = useState(null);

  const confirmAction = (type, callback) => {
    setActionType(type);
    setActionCallback(() => callback);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    if (actionCallback) {
      actionCallback();
    }
    setShowConfirmation(false);
  };

  const handleCancelAction = () => {
    setShowConfirmation(false);
    setActionCallback(null);
    setActionType(null);
  };


  const formatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };

  const fetchApplicationsAndRequests = async () => {
    try {
      const [applicationsResponse, requestsResponse] = await Promise.all([
        fetch("http://localhost/Sal7ly/php_backend/fetchApplicationsHandler.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ craftsman_id: user.id, action: "fetch" }),
        }),
        fetch("http://localhost/Sal7ly/php_backend/sentrequestshandler.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: user.category, city: user.city }),
        }),
      ]);
  
      const applicationsData = await applicationsResponse.json();
      const requestsData = await requestsResponse.json();
  
      if (!applicationsResponse.ok) throw new Error(applicationsData.error || "Failed to fetch applications.");
      if (!requestsResponse.ok) throw new Error(requestsData.error || "Failed to fetch requests.");
  
      const applications = applicationsData.applications || [];
      const requests = requestsData.requests || [];
  
      const updatedRequests = requests.map((request) => {
        const existingApplication = applications.find((app) => app.request_id === request.id);
        return { ...request, hasApplication: !!existingApplication };
      });
  
      const applicationsWithRequests = applications.map((app) => {
        const matchingRequest = requests.find((req) => req.id === app.request_id);
        return { ...app, request: matchingRequest || { details: 'No details available' } };
      });
      
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
      setError("You can't access this page. Please log in as a craftsman.");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ craftsman_id: user.id, application_id: applicationId, action: "delete" }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete application.");
      
      await fetchApplicationsAndRequests();
      setApplications((prev) => prev.filter((application) => application.id !== applicationId));
      alert("Application deleted successfully.");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: selectedRequest.id,
          craftsman_id: user.id,
          applicationText,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to apply for the request.");

      await fetchApplicationsAndRequests();
      alert("Application submitted successfully!");
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application: " + error.message);
    }
  };

  const handleModifySubmit = () => {
    confirmAction("modify", async () => {
      if (!modifyText.trim()) {
        alert("Modified text is required.");
        return;
      }
      try {
        const response = await fetch("http://localhost/Sal7ly/php_backend/fetchApplicationsHandler.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            craftsman_id: user.id,
            application_id: selectedApplication.id,
            message: modifyText,
            action: "modify",
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to modify application.");

        setApplications(prevApplications => 
          prevApplications.map(app => 
            app.id === selectedApplication.id 
              ? { ...app, message: modifyText } 
              : app
          )
        );

        alert("Application modified successfully!");
        handleCloseModifyModal();
      } catch (error) {
        console.error("Error modifying application:", error);
        alert("Error modifying application: " + error.message);
      }
    });
  };

  const ConfirmationModal = () => (
    <div className="sent-requests__modal">
      <div className="sent-requests__modal-content sent-requests__modal-content--confirmation">
        <div className="sent-requests__modal-header">
          <h2 className="sent-requests__modal-title">
            Confirm {actionType === "delete" ? "Deletion" : "Modification"}
          </h2>
          <button 
            className="sent-requests__modal-close"
            onClick={handleCancelAction}
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        
        <div className="sent-requests__modal-body">
          <p className="sent-requests__confirmation-message">
            Are you sure you want to {actionType === "delete" ? 
            "permanently delete this application?" : 
            "modify this application?"}
          </p>
        </div>

        <div className="sent-requests__modal-actions">
          <button 
            className="sent-requests__button sent-requests__button--cancel"
            onClick={handleCancelAction}
          >
            Cancel
          </button>
          <button 
            className={`sent-requests__button ${
              actionType === "delete" ? 
              "sent-requests__button--delete" : 
              "sent-requests__button--modify"
            }`}
            onClick={handleConfirm}
          >
            Confirm {actionType === "delete" ? "Delete" : "Modify"}
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="sent-requests__loading">Loading...</div>;

  if (error) return <div className="sent-requests__error">{error}</div>;

  return (
    <div className="sent-requests">
      <h1 className="sent-requests__header">Available Requests</h1> 
      <div className="sent-requests__requests-container">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div className="sent-requests__request-card" key={request.id}>
              <p className="sent-requests__request-id"><strong>ID:</strong> {request.id}</p>
              <h2 className="sent-requests__request-user">User: {request.name}</h2>
              <div className="sent-requests__request-details">
                <p><strong>Details:</strong><br/>{request.details}</p>
              </div>
              <p className="sent-requests__request-city"><strong>City:</strong> {request.city}</p>
              <p className="sent-requests__request-location"><strong>Location:</strong> {request.location}</p>
              <p className="sent-requests__request-date">
                <strong>Created At:</strong> {new Intl.DateTimeFormat('en-GB', formatOptions).format(new Date(request.created_at))}
              </p>
              {request.hasApplication ? (
                <button 
                  className="sent-requests__button sent-requests__button--modify"
                  onClick={() => handleModifyClick(applications.find(app => app.request_id === request.id), request)}
                >
                  Modify
                </button>
              ) : (
                <button 
                  className="sent-requests__button sent-requests__button--apply"
                  onClick={() => handleApplyClick(request)}
                >
                  Apply
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="sent-requests__empty-message">No matching requests found.</p>
        )}
      </div>

      {showModal && (
        <div className="sent-requests__modal">
          <div className="sent-requests__modal-content">
            <div className="sent-requests__modal-header">
              <h2 className="sent-requests__modal-title">Apply for Request</h2>
              <button 
                className="sent-requests__modal-close"
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            
            <div className="sent-requests__modal-body">
              <div className="sent-requests__modal-details-group">
                <div className="sent-requests__modal-details">
                  <p className="sent-requests__modal-id"><strong>ID:</strong> {selectedRequest.id}</p>
                  <p className="sent-requests__modal-user"><strong>User:</strong> {selectedRequest.name}</p>
                  <p className="sent-requests__modal-city"><strong>City:</strong> {selectedRequest.city}</p>
                  <p className="sent-requests__modal-location"><strong>Location:</strong> {selectedRequest.location}</p>
                  <p className="sent-requests__modal-date">
                    <strong>Created At:</strong> {new Intl.DateTimeFormat('en-GB', formatOptions).format(new Date(selectedRequest.created_at))}
                  </p>
                </div>

                <div className="sent-requests__modal-details">
                  <p><strong>Details:</strong></p>
                  <p>{selectedRequest.details}</p>
                </div>
              </div>

              <textarea
                className="sent-requests__modal-textarea"
                value={applicationText}
                onChange={(e) => setApplicationText(e.target.value)}
                placeholder="Enter your application text here..."
              />
            </div>

            <div className="sent-requests__modal-actions">
              <button 
                className="sent-requests__button sent-requests__button--cancel"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button 
                className="sent-requests__button sent-requests__button--apply"
                onClick={handleApplicationSubmit}
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
      {showModifyModal && (
        <div className="sent-requests__modal">
          <div className="sent-requests__modal-content">
            <div className="sent-requests__modal-header">
              <h2 className="sent-requests__modal-title">Modify Application</h2>
              <button 
                className="sent-requests__modal-close"
                onClick={handleCloseModifyModal}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            
            <div className="sent-requests__modal-body">
              <div className="sent-requests__modal-details-group">
                <div className="sent-requests__modal-details">
                  <p className="sent-requests__modal-id"><strong>Request ID:</strong> {selectedRequest.id}</p>
                  <p className="sent-requests__modal-user"><strong>User:</strong> {selectedRequest.name}</p>
                  <p className="sent-requests__modal-city"><strong>City:</strong> {selectedRequest.city}</p>
                  <p className="sent-requests__modal-location"><strong>Location:</strong> {selectedRequest.location}</p>
                  <p className="sent-requests__modal-date">
                    <strong>Created At:</strong> {new Intl.DateTimeFormat('en-GB', formatOptions).format(new Date(selectedRequest.created_at))}
                  </p>
                </div>

                <div className="sent-requests__modal-details">
                  <p><strong>Original Application:</strong></p>
                  <p>{selectedApplication?.message}</p>
                </div>
              </div>

              <textarea
                className="sent-requests__modal-textarea"
                value={modifyText}
                onChange={(e) => setModifyText(e.target.value)}
                placeholder="Modify your application message..."
              />
            </div>

            <div className="sent-requests__modal-actions">
              <button 
                className="sent-requests__button sent-requests__button--cancel"
                onClick={handleCloseModifyModal}
              >
                Cancel
              </button>
              <button 
                className="sent-requests__button sent-requests__button--modify"
                onClick={handleModifySubmit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sent-requests__applications-container">
        <h2 className="sent-requests__applications-header">Your Applications</h2>
        {applications.length > 0 ? (
          applications.map((app) => (
            <div className="sent-requests__application-card" key={app.id}>
              <p className="sent-requests__application-id"><strong>Request ID:</strong> {app.request_id}</p>
              <div className="sent-requests__application-details">
                <p><strong>Request Details:</strong></p>{app.request.details}
              </div>
              <div className="sent-requests__application-message">
                <p><strong>Application Message:</strong></p>{app.message}
              </div>
              <p className="sent-requests__application-date">
                <strong>Application Date:</strong> {new Intl.DateTimeFormat('en-GB', formatOptions).format(new Date(app.created_at))}
              </p>
              <div className="sent-requests__application-actions">
                <button 
                  className="sent-requests__button sent-requests__button--modify"
                  onClick={() => handleModifyClick(app)}
                >
                  Modify
                </button>
                <button 
                  className="sent-requests__button sent-requests__button--delete"
                  onClick={() => confirmAction("delete", () => handleDeleteApplication(app.id))}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="sent-requests__empty-message">You have not applied for any requests yet.</p>
        )}
      </div>

      {showConfirmation && <ConfirmationModal />}
    </div>
  );
};

export default SentRequests;  