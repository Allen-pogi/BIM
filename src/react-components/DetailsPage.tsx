import * as React from "react"
import * as Router from "react-router-dom"
import {
    IProject,
    ProjectStatus,
    ProjectType,
    ITeam,
    TeamRole,
    toggleModal,
    Project,
    Team
} from "../class/projects";
import { ProjectsManager } from "../class/projectsManager";
import { DetailsPageHeader } from "./DetailsPageHeader";
import { IFCViewer } from "./IFCViewer";
import { getCollection, getProject } from "../firebase";
import * as Firestore from "firebase/firestore"
import { deleteDocument } from "../firebase";
import { TeamsCard } from "./TeamsCard";

interface Props {
    projectsManager: ProjectsManager
}

export function DetailsPage(props: Props) {
    const [editMode, setEditMode] = React.useState<boolean>(false);


    const onEditProject = () => {
        toggleModal("edit-project-modal");
        setEditMode(true);
        
    } 

    
    const updateProject = (e: React.FormEvent) => {
        e.preventDefault();
        const projectForm = document.getElementById("edit-project-form") as HTMLFormElement;
        // Gather form data and update the current project
        const formData = new FormData(projectForm);
        const updatedProjectData: Partial<IProject> = {
         
          projectStatus: formData.get("project-status") as ProjectStatus,
         
        };
        try {
          // Update the current project with the new data

          ///pang update sa database
          const projectsCollection = getProject("/projects",  routeParams.id  as string)
          Firestore.updateDoc(projectsCollection, updatedProjectData)

          //pang update locally para magreflect agad
          props.projectsManager.updateProject(routeParams.id as string, updatedProjectData);
          projectForm.reset();
          toggleModal("edit-project-modal");
          setEditMode(false);
        } catch (err) {
          // Display an error message in case of an exception
          const errorMessage = document.getElementById("err") as HTMLElement;
          errorMessage.textContent = err.toString();
          toggleModal("error-popup");
        }
    }
    
    


    const [projects, setProjects] = React.useState<Project[]>(
        props.projectsManager.projectsList
    );
    props.projectsManager.onProjectCreated = () => {
        setProjects([...props.projectsManager.projectsList]);
    };

    const routeParams = Router.useParams<{ id: string }>()
    if (!routeParams.id) { return (<p>Project ID is needed to see this page</p>) }
    const currentProject = props.projectsManager.getProject(routeParams.id)
    if (!currentProject) { return (<p>The project with ID {routeParams.id} wasn't found.</p>) }

    React.useEffect(() => {}, [currentProject]);

    return (
        
        <div className="page" id="project-details">
            <dialog id="edit-project-modal">
                <form id="edit-project-form">
                <h2>New Project</h2>
                <div className="input-list">
                    
                
                    <div className="form-field-container">
                    <label>
                        <span className="material-icons-round">not_listed_location</span>
                        Status
                    </label>
                    <select name="project-status" style={{color: "black"}}>
                        <option>Pending</option>
                        <option>Active</option>
                        <option>Finished</option>
                        <option>Blocked</option>
                    </select>
                    <p
                                style={{
                                    color: "white",
                                    fontSize: "var(--font-sm)",
                                    marginTop: 5,
                                    fontStyle: "italic"
                                }}
                            >
                                Note: You can only edit project status
                            </p>
                    </div>
                   
                    
              
                    <div
                    style={{
                        display: "flex",
                        margin: "10px 0px 10px auto",
                        columnGap: 10
                    }}
                    >
                   
                    <button onClick={(e) => updateProject(e)}
                        id="submit-new-project-btn"
                        type="button"
                        style={{ backgroundColor: "rgb(18, 145, 18)" }}
                    >
                        Accept
                    </button>
                    </div>
                </div>
                </form>
            </dialog>
            <DetailsPageHeader project={currentProject}/>
            <div className="main-page-content">
                <div style={{ display: "flex", flexDirection: "column", rowGap: 20 }}>
                    <div className="dashboard-card" style={{ padding: "20px 0" }}>
                        <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0px 30px",
                            marginBottom: 10
                        }}
                        >
                        <h4 />
                        <div style={{ display: "flex", alignItems: "center", columnGap: 10 }}>
                <button onClick={onEditProject} >
                <p style={{ width: "100%" }}>
                    <span className="">Edit</span>
                </p>
                </button>
                
            </div>
                        </div>
                        <div style={{ padding: "0 30px" }}>
                        <div
                            style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                            }}
                        >
                            <div className="card-content">
                            <div className="card-property">
                                <p style={{ color: "#969696" }}>Status</p>
                                <p id="project-status" data-project-info="status">{currentProject.projectStatus}</p>
                            </div>
                            <div className="card-property">
                                <p style={{ color: "#969696" }}>Cost</p>
                                <p id="project-cost" data-project-info="cost">{currentProject.projectCost}</p>
                            </div>
                            <div className="card-property">
                                <p style={{ color: "#969696" }}>Type</p>
                                <p id="project-type" data-project-info="type">{currentProject.projectType}</p>
                            </div>
                            <div className="card-property">
                                <p style={{ color: "#969696" }}>Address</p>
                                <p id="project-address" data-project-info="address">{currentProject.projectAddress}</p>
                            </div>
                            <div className="card-property">
                                <p style={{ color: "#969696" }}>Finish Date</p>
                                <p id="project-finish-date" data-project-info="finishDate">{currentProject.projectFinishDate.toDateString()}</p>
                            </div>
                            <div
                                className="card-property"
                                style={{
                                backgroundColor: "#404040",
                                borderRadius: 9999,
                                overflow: "auto"
                                }}
                            >
                                <div
                                id="project-progress"
                                data-project-info="progress"
                                style={{
                                    width: `${currentProject.projectProgress}%`,
                                    backgroundColor: "#468f3f",
                                    padding: "4px 0",
                                    textAlign: "center"
                                }}
                                >
                                    {currentProject.projectProgress}%
                                </div>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    <TeamsCard project={currentProject} projectsManager={props.projectsManager}/>
                </div>  
                <IFCViewer/>
            </div>
        </div>
    )
}