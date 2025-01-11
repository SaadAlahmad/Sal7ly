import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import "../css/ProjectsPage.css";

const ProjectsPage = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [activeProjects, setActiveProjects] = useState([
    { id: 1, name: "Project Alpha", description: "Description of Project Alpha" },
    { id: 2, name: "Project Beta", description: "Description of Project Beta" },

  ]);
  const [finishedProjects, setFinishedProjects] = useState([
    { id: 3, name: "Project Gamma", description: "Description of Project Gamma" },
    { id: 4, name: "Project Delta", description: "Description of Project Delta" },
  ]);
  const [selectedProject, setSelectedProject] = useState(null);

  if (!user) {
    return <div className="warning">You need to be logged in to see this page.</div>;
  }

  const handleNewProject = () => {
    if (user.userType === "craftsman") {
      navigate("/showrequests");
    } else {
      navigate("/request");
    }
  };

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
              {project.name}
            </li>
          ))}
        </ul>
        <button className="new-project-btn" onClick={handleNewProject}>
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
              {project.name}
            </li>
          ))}
        </ul>
      </aside>

      <main className="workspace">
        {selectedProject ? (
          <>
            <h2>{selectedProject.name}</h2>
            <p>{selectedProject.description}</p>
          </>
        ) : (
          <p>Select a project to view its details.</p>
        )}
      </main>
    </div>
  );
};

export default ProjectsPage;
