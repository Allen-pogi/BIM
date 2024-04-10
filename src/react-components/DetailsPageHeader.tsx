import * as React from "react"
import {
    Project
} from "../class/projects";

import {
    IProject,
    ProjectStatus,
    ProjectType,
    ITeam,
    TeamRole,
    toggleModal,
   
} from "../class/projects";
import { ProjectsManager } from "../class/projectsManager";

// Define Props interface to describe the props expected by the DetailsPageHeader component
interface Props {
    project: Project // Project object passed as prop
  }  

// DetailsPageHeader Function Component
export function DetailsPageHeader(props: Props) {
    const projectsManager = new ProjectsManager(); // Instantiate ProjectsManager to manage projects

    // Event listener for exporting projects to JSON
    const onExportProjects = () => {
        projectsManager.exportToJSON(); // Call exportToJSON method of ProjectsManager
    }
    // Event listener for exporting projects to JSON
    const onImportProjects = () => {
        projectsManager.importFromJSON() // Call importFromJSON method of ProjectsManager
    }

    // Event listener for creating a new project
    const onNewProject = () => {
        toggleModal("new-project-modal"); // Toggle modal for creating a new project
    };

    // JSX return: Header section of the details page
    return (
        <header>
            <div>
            <h2 id="project-name" data-project-info="name">{props.project.projectName}</h2> 
            <p
                id="project-description"
                data-project-info="description"
                style={{ color: "#969696" }}
            >{props.project.projectDescription}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "8px" }}>
            {/* Button to create a new project */}
            <button onClick={onNewProject} id="import-projects-btn">
                <p>Create Project</p>
                
            </button>
            {/* Button to export projects */}
            <button onClick={onExportProjects} id="export-projects-btn">
                <p>Export</p>
            </button>
            {/* Button to import projects */}
            <button onClick={onImportProjects} id="import-projects-btn">
                <p>Import</p>
            </button>
            </div>
        </header>
    )
}