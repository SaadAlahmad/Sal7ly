import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import "../css/SentRequests.css";

const SentRequests = () => {
  const { user, loading } = useContext(UserContext);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;

    if (!user || user.userType !== "craftsman") {
      setError("You can't access this page. Please log in.");
      return;
    }

    const fetchRequests = async () => {
      try {
        const response = await fetch("http://localhost/Sal7ly/php_backend/sentrequestshandler.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: user.category,
            city: user.city,
          }),
        });
    
        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Response data:", data);
    
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch requests.");
        }
    
        setRequests(data.requests || []);
      } catch (error) {
        console.error("Error fetching requests:", error);
        setError(error.message);
      }
    };
    
    fetchRequests();
  }, [user, loading]);

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
              <h2>User: {request.name}</h2>
              <p><strong>Details:</strong> {request.details}</p>
              <p><strong>City:</strong> {request.city}</p>
              <p><strong>Location:</strong> {request.location}</p>
              <p><strong>Created At:</strong> {new Date(request.created_at).toLocaleString()}</p>
              <button onClick={() => alert(`Applied to request ID: ${request.id}`)}>
                Apply
              </button>
            </div>
          ))
        ) : (
          <p>No matching requests found.</p>
        )}
      </div>
    </div>
  );
};

export default SentRequests;
