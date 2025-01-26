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

      if (response.ok) {
        if (data.exists) {
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

      const reviewResponse = await fetch(endpoint, {
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

      if (!reviewResponse.ok) {
        const errorData = await reviewResponse.json();
        console.error("Error submitting review:", errorData.error);
        return;
      }

      const bayesianResponse = await fetch(
        "http://localhost/Sal7ly/php_backend/bayesianhandler.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!bayesianResponse.ok) {
        console.warn("Review submitted but Bayesian update failed");
      }

      alert("Review submitted successfully.");
      setShowReviewForm(false);
      setReviewData({ rating: 0, reviewText: "" });

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
    return <div className="projects-page__warning">You need to be logged in to see this page.</div>;
  }

  if (loading) {
    return <div className="projects-page__loading">Loading...</div>;
  }

  const InfoItem = ({ label, value, isFullWidth }) => (
    <div className={`projects-page__info-item ${isFullWidth ? 'projects-page__info-item--full' : ''}`}>
      <dt className="projects-page__info-label">{label}:</dt>
      <dd className="projects-page__info-value">{value || 'N/A'}</dd>
    </div>
  );
  
  return (
    <div className="projects-page">
      <aside className="projects-page__sidebar">
        <h2 className="projects-page__sidebar-heading">Active Projects</h2>
        <ul className="projects-page__project-list">
          {activeProjects.map((project) => (
            <li
              key={project.id}
              className={`projects-page__project-item ${
                selectedProject?.id === project.id ? "projects-page__project-item--active" : ""
              }`}
              onClick={() => setSelectedProject(project)}
            >
              {project.display_name}
            </li>
          ))}
        </ul>
        <button 
          className="projects-page__new-project-btn" 
          onClick={() => navigate(user.userType === "craftsman" ? "/showrequests" : "/request")}
        >
          New Project
        </button>

        <h2 className="projects-page__sidebar-heading">Finished Projects</h2>
        <ul className="projects-page__project-list">
          {finishedProjects.map((project) => (
            <li
              key={project.id}
              className="projects-page__project-item projects-page__project-item--finished"
              onClick={() => setSelectedProject(project)}
            >
              {project.display_name}
            </li>
          ))}
        </ul>
      </aside>

      <main className="projects-page__workspace">
        {selectedProject ? (
          <>
            <div className="projects-page__workspace-header">
              <h2 className="projects-page__workspace-heading">
                <span className="projects-page__workspace-icon">📋</span>
                Project Details
              </h2>
              <div className="projects-page__project-meta">
                <span className="projects-page__project-id">ID: #{selectedProject.id}</span>
                <span className="projects-page__project-status">
                  {finishedProjects.some(p => p.id === selectedProject.id) ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>

            <div className="projects-page__info-container">
              <div className="projects-page__info-box">
                <h3 className="projects-page__info-box-heading">
                  <span className="projects-page__info-icon">📨</span>
                  Request Details
                </h3>
                <div className="projects-page__info-content">
                  <InfoItem label="Service" value={selectedProject.request?.service} />
                  <InfoItem label="Location" value={selectedProject.request?.location} />
                  <InfoItem 
                    label="Details" 
                    value={selectedProject.request?.details}
                    isFullWidth
                  />
                  <InfoItem label="Request Date" value={selectedProject.request?.created_at} />
                </div>
              </div>

              <div className="projects-page__info-box">
                <h3 className="projects-page__info-box-heading">
                  <span className="projects-page__info-icon">👷</span>
                  Craftsman Details
                </h3>
                <div className="projects-page__info-content">
                  <InfoItem label="Name" value={selectedProject.craftsman?.name} />
                  <InfoItem label="Email" value={selectedProject.craftsman?.email} />
                  <InfoItem label="Mobile" value={selectedProject.craftsman?.mobile} />
                  <InfoItem label="Category" value={selectedProject.craftsman?.category} />
                </div>
              </div>

              <div className="projects-page__info-box">
                <h3 className="projects-page__info-box-heading">
                  <span className="projects-page__info-icon">👤</span>
                  Client Details
                </h3>
                <div className="projects-page__info-content">
                  <InfoItem label="Name" value={selectedProject.user?.name} />
                  <InfoItem label="Email" value={selectedProject.user?.email} />
                  <InfoItem label="Mobile" value={selectedProject.user?.mobile} />
                </div>
              </div>

              <div className="projects-page__info-box">
                <h3 className="projects-page__info-box-heading">
                  <span className="projects-page__info-icon">✉️</span>
                  Application Details
                </h3>
                <div className="projects-page__info-content">
                  <InfoItem 
                    label="Message" 
                    value={selectedProject.application?.message}
                    isFullWidth
                  />
                  <InfoItem label="Applied At" value={selectedProject.application?.created_at} />
                </div>
              </div>
            </div>

            <div className="projects-page__actions">
              {selectedProject && !finishedProjects.some(project => project.id === selectedProject.id) ? (
                <button
                  className="projects-page__action-btn projects-page__action-btn--primary"
                  onClick={() => handleMarkAsFinished(selectedProject.id)}
                >
                  Mark as Finished
                </button>
              ) : (
                user.userType === "user" && (
                  <button
                    className="projects-page__action-btn projects-page__action-btn--primary"
                    onClick={() => handleReviewJob(selectedProject.id)}
                  >
                    Review Job
                  </button>
                )
              )}
            </div>
          </>
        ) : (
          <p className="projects-page__empty-state">Select a project to view details</p>
        )}
      </main>

      {showReviewForm && (
        <div className="projects-page__review-modal">
          <div className="projects-page__review-modal-content">
            <h3 className="projects-page__review-modal-heading">
              {hasReview ? "Modify Your Review" : "Submit Your Review"}
            </h3>
            <div className="projects-page__rating-container">
              <div className="projects-page__stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`projects-page__star ${
                      reviewData.rating >= star ? "projects-page__star--selected" : ""
                    }`}
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <div className="projects-page__review-text">
              <label className="projects-page__review-label">Review (Optional):</label>
              <textarea
                className="projects-page__review-textarea"
                value={reviewData.reviewText}
                onChange={(e) =>
                  setReviewData({ ...reviewData, reviewText: e.target.value })
                }
              />
            </div>
            <div className="projects-page__modal-actions">
              <button 
                className="projects-page__action-btn projects-page__action-btn--primary" 
                onClick={handleReviewSubmit}
              >
                {hasReview ? "Modify Rating" : "Submit Review"}
              </button>
              <button
                className="projects-page__action-btn projects-page__action-btn--secondary"
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