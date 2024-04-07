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

enum ViewMode {
  Grid,
  List,
}
  
export function HomePage(props: Props) {
    
    const [projects, setProjects] = React.useState<Project[]>(props.projectsManager.projectsList)
    const [viewMode, setViewMode] = React.useState<ViewMode>(ViewMode.Grid);

    props.projectsManager.onProjectCreated = () => {setProjects([...props.projectsManager.projectsList])}
    // props.projectsManager.onProjectDeleted = () => { setProjects([...props.projectsManager.projectsList]) }

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

    React.useEffect(() => {
      getFirestoreProjects()
    }, [])
  
    const projectCards = projects.map((project) => (
      <Router.Link to={`/project/${project.id}`} key={project.id}>
          <HomePageProjectCard project={project} />
      </Router.Link>
  ));

  const toggleViewMode = () => {
    setViewMode(viewMode === ViewMode.Grid ? ViewMode.List : ViewMode.Grid);
};



return (
    <div className="homepage" style={{ width: "100vw", display: "flow", justifyContent: "center", flexDirection: "column", padding: "100px", gap: "15px", overflowY: "scroll" }}>
          <div style={{ display: "flex", justifyContent: "center" }}> {/* Add margin bottom to separate the logo from the project list */}
            <img id="homepage-company-logo" src="./assets/company-logo.svg" alt="Construction Company" />
        </div>

        <div className="">
        <button onClick={toggleViewMode}>{viewMode === ViewMode.Grid ? "List View" : "Grid View"}</button>
        </div>

        
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

interface GridProjectsViewProps {
projects: Project[];
}

function GridProjectsView({ projects }: GridProjectsViewProps) {
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

interface ListProjectsViewProps {
  projects: Project[];
}

function ListProjectsView({ projects }: ListProjectsViewProps) {
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