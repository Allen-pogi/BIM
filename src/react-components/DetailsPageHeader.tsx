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

interface Props {
    project: Project
  }  

export function DetailsPageHeader(props: Props) {
    const projectsManager = new ProjectsManager();

    // Event listener for exporting projects to JSON
    const onExportProjects = () => {
        projectsManager.exportToJSON();
    }
    // Event listener for exporting projects to JSON
    const onImportProjects = () => {
        projectsManager.importFromJSON()
    }

    const onNewProject = () => {
        toggleModal("new-project-modal");
    };

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
            <button onClick={onNewProject} id="import-projects-btn">
                <p>Create Project</p>
                
            </button>
            <button onClick={onExportProjects} id="export-projects-btn">
                <p>Export</p>
            </button>
            <button onClick={onImportProjects} id="import-projects-btn">
                <p>Import</p>
            </button>
            </div>
        </header>
    )
}