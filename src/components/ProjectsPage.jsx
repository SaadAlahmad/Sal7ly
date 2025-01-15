import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import "../css/ProjectsPage.css";

const ProjectsPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [activeProjects, setActiveProjects] = useState([]);
  const [finishedProjects, setFinishedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasReview, setHasReview] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 0,
    reviewText: "",
  });
  
  const handleMarkAsFinished = async (projectId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to mark this project as finished?"
    );
  
    if (!isConfirmed) return;
  
    try {
      const response = await fetch(
        "http://localhost/Sal7ly/php_backend/projecthandler.php",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ projectId }),
        }
      );
  
      if (response.ok) {
        const updatedActiveProjects = activeProjects.filter(
          (project) => project.id !== projectId
        );
  
        const updatedProject = activeProjects.find(
          (project) => project.id === projectId
        );
  
        if (updatedProject) {
          setFinishedProjects((prevProjects) => [...prevProjects, updatedProject]);
          setSelectedProject(updatedProject);
        }
        setActiveProjects(updatedActiveProjects);
        alert("Project marked as finished successfully.");
      } else {
        const errorData = await response.json();
        console.error("Server Error:", errorData.error);
        alert("Failed to mark the project as finished.");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("An error occurred. Please try again.");
    }
  };
    
  const handleReviewJob = async (projectId) => {
    try {
      const response = await fetch(
        `http://localhost/Sal7ly/php_backend/reviewhandler.php?projectId=${projectId}`,
        {
          method: "GET",
        }
      );
  
      const data = await response.json();
      // console.log("Response Data:", data);
  
      if (response.ok) {
        if (data.exists) {
          // console.log("Existing Review Data:", data.review);
  
          setReviewData({
            rating: data.review.rating,
            reviewText: data.review.review_text || "",
          });
        } else {
          setReviewData({
            rating: 0,
            reviewText: "",
          });
        }
        setHasReview(data.exists);
        setShowReviewForm(true);
        setSelectedProject(
          finishedProjects.find((project) => project.id === projectId)
        );
      } else {
        console.error("Error checking review status:", data.error);
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  };
          
  const handleReviewSubmit = async () => {
    if (reviewData.rating < 1 || reviewData.rating > 5) {
        alert("Please provide a valid star rating between 1 and 5.");
        return;
    }

    try {
        const endpoint = "http://localhost/Sal7ly/php_backend/reviewhandler.php";
        const method = hasReview ? "PUT" : "POST";

        // Submit the review (either create or update)
        const response = await fetch(endpoint, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                projectId: selectedProject.id,
                userId: user.id,
                rating: reviewData.rating,
                reviewText: reviewData.reviewText,
            }),
        });

        if (response.ok) {
            // Perform Bayesian calculation after successful review submission
            await fetch("http://localhost/Sal7ly/php_backend/bayesianhandler.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ projectId: selectedProject.id }),
            });

            // Reset form and state
            alert("Review submitted successfully.");
            setShowReviewForm(false);
            setReviewData({ rating: 0, reviewText: "" });
        } else {
            const errorData = await response.json();
            console.error("Error submitting review:", errorData.error);
        }
    } catch (error) {
        console.error("Network Error:", error);
    }
};

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        const response = await fetch(
          "http://localhost/Sal7ly/php_backend/projecthandler.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: user.id, userType: user.userType }),
          }
        );

        const data = await response.json();

        if (response.ok) {
          const active = Array.isArray(data.activeProjects) ? data.activeProjects : [];
          const finished = Array.isArray(data.finishedProjects)
            ? data.finishedProjects
            : [];
          setActiveProjects(active);
          setFinishedProjects(finished);
        } else {
          console.error("Error fetching projects:", data.error);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  if (!user) {
    return <div className="warning">You need to be logged in to see this page.</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="projects-page">
      <aside className="sidebar">
        <h2>Active Projects</h2>
        <ul>
          {activeProjects.map((project) => (
            <li
              key={project.id}
              className={`project-item ${selectedProject?.id === project.id ? "active" : ""}`}
              onClick={() => setSelectedProject(project)}
            >
              {project.display_name}
            </li>
          ))}
        </ul>
        <button className="new-project-btn" onClick={() => navigate(user.userType === "craftsman" ? "/showrequests" : "/request")}>
          New Project
        </button>

        <h2>Finished Projects</h2>
        <ul>
          {finishedProjects.map((project) => (
            <li
              key={project.id}
              className="project-item finished"
              onClick={() => setSelectedProject(project)}
            >
              {project.display_name}
            </li>
          ))}
        </ul>
      </aside>

      <main className="workspace">
        {selectedProject ? (
          <>
            <h2>Project Details</h2>
            <div className="info-container">
              <div className="info-box">
                <h3>Request Information</h3>
                <p>
                  <strong>Request ID:</strong> {selectedProject.request?.id || "N/A"}
                </p>
                <p>
                  <strong>Service:</strong> {selectedProject.request?.service || "N/A"}
                </p>
                <div className="whtSpc">
                  <p>
                    <strong>Details:</strong> {selectedProject.request?.details || "N/A"}
                  </p>
                </div>
                <p>
                  <strong>Location:</strong> {selectedProject.request?.location || "N/A"}
                </p>
                <p>
                  <strong>Request Date:</strong> {selectedProject.request?.created_at || "N/A"}
                </p>
              </div>

              <div className="info-box">
                <h3>Applicant Information</h3>
                <p>
                  <strong>Craftsman Name:</strong> {selectedProject.craftsman?.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {selectedProject.craftsman?.email || "N/A"}
                </p>
                <p>
                  <strong>Mobile:</strong> +{selectedProject.craftsman?.mobile || "N/A"}
                </p>
                <p>
                  <strong>Category:</strong> {selectedProject.craftsman?.category || "N/A"}
                </p>
              </div>

              <div className="info-box">
                <h3>User Information</h3>
                <p>
                  <strong>User Name:</strong> {selectedProject.user?.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {selectedProject.user?.email || "N/A"}
                </p>
                <p>
                  <strong>Mobile:</strong> +{selectedProject.user?.mobile || "N/A"}
                </p>
              </div>

              <div className="info-box">
                <h3>Application Information</h3>
                <div className="whtSpc">
                  <p>
                    <strong>Message:</strong> {selectedProject.application?.message || "N/A"}
                  </p>
                </div>
                <p>
                  <strong>Applied At:</strong> {selectedProject.application?.created_at || "N/A"}
                </p>
              </div>
            </div>
            <div className="actions">
              {selectedProject && !finishedProjects.some(project => project.id === selectedProject.id) ? (
                <button
                  className="action-btn primary"
                  onClick={() => handleMarkAsFinished(selectedProject.id)}
                >
                  Mark as Finished
                </button>
              ) : (
                user.userType === "user" && (
                  <button
                    className="action-btn primary"
                    onClick={() => handleReviewJob(selectedProject.id)}
                  >
                    Review Job
                  </button>
                )
              )}
              <button className="action-btn secondary">View More Details</button>
            </div>
          </>
        ) : (
          <p>Select a project to view its details.</p>
        )}
      </main>
      {showReviewForm && (
        <div className="review-modal">
          <div className="review-modal-content">
            <h3>{hasReview ? "Modify Your Review" : "Submit Your Review"}</h3>
            <div className="rating-container">
              <label>Rating:</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`star ${reviewData.rating >= star ? "selected" : ""}`}
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="review-text">
              <label>Review (Optional):</label>
              <textarea
                value={reviewData.reviewText}
                onChange={(e) =>
                  setReviewData({ ...reviewData, reviewText: e.target.value })
                }
              />
            </div>
            <div className="modal-actions">
              <button className="action-btn primary" onClick={handleReviewSubmit}>
                {hasReview ? "Modify Rating" : "Submit Review"}
              </button>
              <button
                className="action-btn secondary"
                onClick={() => setShowReviewForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;