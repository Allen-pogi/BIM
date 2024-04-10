import * as React from "react"
import * as Router from "react-router-dom"
import { ProjectsManager } from "../class/projectsManager"
import { IProject, Project } from "../class/projects"
import { HomePageProjectCard } from "./HomePageProjectCard"
import * as Firestore from "firebase/firestore"
import { getCollection } from "../firebase";
import { JSX } from "react";

interface Props {
    projectsManager: ProjectsManager
}

// Enumeration for different view modes
enum ViewMode {
  Grid,
  List,
}
  
export function HomePage(props: Props) {
    // State hooks for managing projects and view mode
    const [projects, setProjects] = React.useState<Project[]>(props.projectsManager.projectsList)
    const [viewMode, setViewMode] = React.useState<ViewMode>(ViewMode.Grid);

    // Event handler for updating projects list when a new project is created
    props.projectsManager.onProjectCreated = () => {setProjects([...props.projectsManager.projectsList])}
    // props.projectsManager.onProjectDeleted = () => { setProjects([...props.projectsManager.projectsList]) }

    // Function to fetch projects from Firestore
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
          // Handle any errors that occur during project creation

        }
      }
    }

    // Fetch projects from Firestore on component mount
    React.useEffect(() => {
      getFirestoreProjects()
    }, [])
  
    const projectCards = projects.map((project) => (
      <Router.Link to={`/project/${project.id}`} key={project.id}>
          <HomePageProjectCard project={project} />
      </Router.Link>
  ));

  // Function to toggle between grid and list view modes
  const toggleViewMode = () => {
    setViewMode(viewMode === ViewMode.Grid ? ViewMode.List : ViewMode.Grid);
};


// JSX rendering for the homepage
return (
    <div className="homepage" style={{ width: "100vw", display: "flow", justifyContent: "center", flexDirection: "column", padding: "100px", gap: "15px", overflowY: "scroll" }}>
          

        <div >
        {/* Button to toggle between grid and list view */}
        <button className="button-for-view" onClick={toggleViewMode}>{viewMode === ViewMode.Grid ? "List View" : "Grid View"}</button>
        </div>

        {/* Rendering projects based on view mode */}
        <div id="projects-list">
            {viewMode === ViewMode.Grid ? (
                <GridProjectsView projects={projects} />
            ) : (
                <ListProjectsView projects={projects} />
            )}
        </div>
    </div>
);
}

// Props interface for GridProjectsView component
interface GridProjectsViewProps {
projects: Project[];
}

// Component for rendering projects in a grid layout
function GridProjectsView({ projects }: GridProjectsViewProps) {
// JSX rendering for grid view
const rows: JSX.Element[] = [];
for (let i = 0; i < projects.length; i += 4) {
    rows.push(
        <div key={i / 4} style={{ display: "flex", justifyContent: "center", gap: "40px", marginBottom: "40px" }}>
            {projects.slice(i, i + 4).map(project => (
                <Router.Link to={`/project/${project.id}`} key={project.id}>
                    <HomePageProjectCard project={project} />
                </Router.Link>
            ))}
        </div>
    );
}
return <>{rows}</>;
}

// Props interface for ListProjectsView component
interface ListProjectsViewProps {
  projects: Project[];
}

// Component for rendering projects in a list layout
function ListProjectsView({ projects }: ListProjectsViewProps) {
  // JSX rendering for list view
  return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          {projects.map(project => (
              <Router.Link to={`/project/${project.id}`} key={project.id}>
                  <HomePageProjectCard project={project} />
              </Router.Link>
          ))}
      </div>
  );
}