import * as React from "react"
import * as Router from "react-router-dom"
import {
    IProject,
    ProjectStatus,
    ProjectType,
    ITeam,
    TeamRole,
    toggleModal,
    Project
} from "../class/projects";
import { ProjectsManager } from "../class/projectsManager";
import { SidebarProject } from "./SidebarProject";
import { DetailsPage } from "./DetailsPage";
import { SearchBox } from "./SearchBox";
import * as Firestore from "firebase/firestore";
import { getCollection } from "../firebase";

interface Props {
    projectsManager: ProjectsManager
}

export function Sidebar(props: Props) {
    // const [projectsManager] = React.useState(new ProjectsManager())
    const [projects, setProjects] = React.useState<Project[]>(props.projectsManager.projectsList)
    props.projectsManager.onProjectCreated = () => {setProjects([...props.projectsManager.projectsList])}

    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const getFirestoreProjects = async () => {
        // const projectsCollenction = Firestore.collection(firebaseDB, "/projects") as Firestore.CollectionReference<IProject>
        const projectsCollenction = getCollection<IProject>("/projects")
        const firebaseProjects = await Firestore.getDocs(projectsCollenction)
        for (const doc of firebaseProjects.docs) {
          const data = doc.data()
          const project: IProject = {
            ...data,
            projectFinishDate: (data.projectFinishDate as unknown as Firestore.Timestamp).toDate()
          }
          try {
            props.projectsManager.newProject(project, doc.id)
          } catch (error) {
  
          }
        }
    }
    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    React.useEffect(() => {
        getFirestoreProjects()
    }, [])

    const projectsCards = projects.map((project) => {
        return (
            <Router.Link to={`/project/${project.id}`} key={project.id}>
                <SidebarProject project={project} isCollapsed={isCollapsed} />
            </Router.Link>
        )
    })

    React.useEffect(() => {
        console.log("Projects state updated", projects)
    }, [projects])

    // React Event listener
    const onNewProject = () => {
        toggleModal("new-project-modal");
    } 

    const onCancelNewProject = () => {
        const projectForm = document.getElementById("new-project-modal") as HTMLFormElement
        if (!(projectForm && projectForm instanceof HTMLDialogElement)) {return}
        projectForm.close();
    }

    const onCloseErrorPopup = () => {
        toggleModal("error-popup");
    }

    const onSubmitNewProject = (e: React.FormEvent) => {
        e.preventDefault();
        const projectForm = document.getElementById("new-project-form") as HTMLFormElement;
        // Gather form data and create a new project
        const formData = new FormData(projectForm);
        const projectData: IProject = {
          projectName: formData.get("project-name") as string,
          projectDescription: formData.get("project-description") as string,
          projectStatus: formData.get("project-status") as ProjectStatus,
          projectCost: formData.get("project-cost") as string,
          projectType: formData.get("project-type") as ProjectType,
          projectAddress: formData.get("project-address") as string,
          projectFinishDate: new Date(formData.get("finishDate") as string),
          projectProgress: formData.get("project-progress") as string
        };
        try {
          const projectsCollection = getCollection<IProject>("/projects")
          Firestore.addDoc(projectsCollection, projectData)
          // Attempt to create a new project
          const project = props.projectsManager.newProject(projectData);
          projectForm.reset();
          toggleModal("new-project-modal");
        } catch (err) {
          // Display an error message in case of an exception
          const errorMessage = document.getElementById("err") as HTMLElement;
          errorMessage.textContent = err;
          toggleModal("error-popup");
        }
    }

    const onProjectSearch = (value: string) => {
        setProjects(props.projectsManager.filterProjects(value))
    }
    
      return (
        <aside id="sidebar" className={isCollapsed ? 'collapsed' : ''}>
            
            <div className="collapse-icon" onClick={toggleCollapse}>
                {isCollapsed ? <span className="material-icons-round">chevron_right</span> : <span className="material-icons-round">chevron_left</span>}
                <span>{isCollapsed ? 'Expand' : 'Collapse'}</span>
            </div>
            
            <dialog id="new-project-modal">
                <form id="new-project-form" onSubmit={onSubmitNewProject}>
                    <h2>New Project</h2>
                    <div className="input-list">
                        <div className="form-field-container">
                            <label style={{color: "grey"}}>
                                <span className="material-icons-round">apartment</span>Name
                            </label>
                            <input style={{color: "black"}}
                            className="input-field"
                                name="project-name"
                                type="text"
                                placeholder="What's the name of your project?"
                            />
                            <p
                                style={{
                                    color: "white",
                                    fontSize: "var(--font-sm)",
                                    marginTop: 5,
                                    fontStyle: "italic"
                                }}
                            >
                                TIP: Give it a short name
                            </p>
                        </div>
                        <div  className="form-field-container">
                            <label style={{color: "grey"}}>
                                <span className="material-icons-round">subject</span>Description
                            </label>
                            <textarea style={{color: "black"}}
                                className="input-field"
                                name="project-description"
                                cols={30}
                                rows={5}
                                placeholder="Project's description"
                                defaultValue={""}
                                
                            />
                        </div>
                        <div className="form-field-container">
                            <label style={{color: "grey"}}>
                                <span className="material-icons-round">not_listed_location</span>
                                Status
                            </label>
                            <select style={{color: "black"}} name="project-status">
                                <option>Pending</option>
                                <option>Active</option>
                                <option>Finished</option>
                                <option>Blocked</option>
                            </select>
                        </div>
                        <div className="form-field-container">
                            <label style={{color: "grey"}}>
                                <span className="material-icons-round">euro</span>Cost
                            </label>
                            <input 
                                className="input-field" style={{color: "black"}} name="project-cost" type="text" placeholder="Project's cost" /
                            >
                        </div>
                        <div className="form-field-container">
                            <label style={{color: "grey"}}>
                                <span className="material-icons-round">category</span>Type
                            </label>
                            <select name="project-type" style={{color: "black"}}>
                                <option>Residential</option>
                                <option>Commercial</option>
                                <option>Institutional</option>
                                <option>Mixed-use</option>
                                <option>Industrial</option>
                                <option>Heavy civil</option>
                            </select>
                        </div>
                        <div className="form-field-container">
                            <label style={{color: "grey"}}>
                                <span className="material-icons-round">place</span>Address
                            </label>
                            <input style={{color: "black"}}
                                name="project-address"
                                type="text"
                                placeholder="Project's address"
                                className="input-field"
                            />
                        </div>
                        <div className="form-field-container">
                            <label style={{color: "grey"}} htmlFor="finishDate">
                                <span className="material-icons-round">calendar_month</span>Finish
                                Date
                            </label>
                            <input style={{color: "black"}} name="finishDate" type="date" />
                        </div>
                        <div className="form-field-container">
                            <label style={{color: "grey"}}>
                                <span className="material-icons-round">published_with_changes</span>
                                Progress
                            </label>
                            <input style={{color: "black"}}
                                name="project-progress"
                                type="text"
                                placeholder="Project's progress from 0 to 100"
                                className="input-field"
                            />
                        </div>
                        <div className="form-field-container">
                            <button onClick={onCancelNewProject}
                                id="cancel-new-project-btn"
                                type="button"
                                style={{ backgroundColor: "transparent" }}
                            >
                                Cancel
                            </button>
                            <button
                                id="submit-new-project-btn"
                                type="submit"
                                style={{ backgroundColor: "rgb(18, 145, 18)" }}
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </form>
            </dialog>
            <dialog id="error-popup">
                <div id="error-message">
                    <p id="err" />
                    <button onClick={onCloseErrorPopup} id="close-error-popup" type="button">
                        Close
                    </button>
                </div>
            </dialog>
            <img
                id="company-logo"
                src="../assets/company-logo.svg"
                alt="Construction Company"
            />
                <div style={{ display: "flex", flexDirection: "column", marginBottom: -15 }}>
    {!isCollapsed && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={onNewProject} id="new-project-btn" className="btn-secondary">
                <p style={{ width: "100%" }}>
                    <span className="material-icons-round">add</span>
                </p>
            </button>
            <SearchBox onChange={(value) => onProjectSearch(value)}/>
        </div>
    )}
    {isCollapsed && (
        <div style={{ marginTop: "auto", marginBottom:10}}>
             <button onClick={onNewProject} id="new-project-btn" className="btn-secondary" style={{ width: "100%", marginBottom: 10 }}>
                <p style={{ width: "100%" }}>
                    <span className="material-icons-round">add</span>
                </p>
            </button>
            <SearchBox onChange={(value) => onProjectSearch(value)}/>
        </div>
    )}
</div>

            {
                projects.length > 0 ?
                    <div id="projects-list" className="nav-buttons">{projectsCards}</div>
                    :
                    <p>There are no projects to display</p>
            }
        </aside>
    );
}