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
import { getCollection } from "../firebase";
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
                <form id="new-project-form">
                <h2>New Project</h2>
                <div className="input-list">
                    <div className="form-field-container">
                    <label>
                        <span className="material-icons-round">apartment</span>Name
                    </label>
                    <input
                        name="project-name"
                        type="text"
                        placeholder={currentProject.projectName}
                        disabled = {true}
                    />
                    <p
                        style={{
                        color: "gray",
                        fontSize: "var(--font-sm)",
                        marginTop: 5,
                        fontStyle: "italic"
                        }}
                    >
                        TIP: Give it a short name
                    </p>
                    </div>
                    <div className="form-field-container">
                    <label>
                        <span className="material-icons-round">subject</span>Description
                    </label>
                    <textarea
                        name="project-description"
                        cols={30}
                        rows={5}
                        placeholder={currentProject.projectDescription}
                        
                        disabled={true}
                    />
                    </div>
                    <div className="form-field-container">
                    <label>
                        <span className="material-icons-round">not_listed_location</span>
                        Status
                    </label>
                    <select name="project-status">
                        <option>Pending</option>
                        <option>Active</option>
                        <option>Finished</option>
                    </select>
                    </div>
                    <div className="form-field-container">
                    <label>
                        <span className="material-icons-round">euro</span>Cost
                    </label>
                    <input name="project-cost" type="text" placeholder={currentProject.projectCost} />
                    </div>
                    <div className="form-field-container">
                    <label>
                        <span className="material-icons-round">category</span>Type
                    </label>
                    <select name="project-type">
                        <option>{currentProject.projectType}</option>
               
                    </select>
                    </div>
                    <div className="form-field-container">
                    <label>
                        <span className="material-icons-round">place</span>Address
                    </label>
                    <input
                        name="project-address"
                        type="text"
                        placeholder={currentProject.projectAddress}
                        disabled = {true}
                    />
                    </div>
                    <div className="form-field-container">
                    <label htmlFor="finishDate">
                        <span className="material-icons-round">calendar_month</span>Finish
                        Date
                        
                    </label>
                    
                    <input name="finishDate" type="date" />
                   
                    </div>
                    <div className="form-field-container">
                        
                    <label>
                        <span className="material-icons-round">published_with_changes</span>
                        Progress
                    </label>
                    <input
                        name="project-progress"
                        type="text"
                        placeholder={currentProject.projectProgress}
                        disabled = {true}
                    />
                    </div>
                    <div
                    style={{
                        display: "flex",
                        margin: "10px 0px 10px auto",
                        columnGap: 10
                    }}
                    >
                   
                    <button onClick={(e) => onEditProject()}
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