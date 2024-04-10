import * as React from "react"
import { Project } from "../class/projects"

interface Props {
  project: Project
}

export function HomePageProjectCard(props: Props) {
  return (
    <div className="dashboard-card" 
      style={{ 
        padding: "30px 0px",
        width: "20vw",
        backgroundColor: "#84AFDC",

      }}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0px 30px",
          marginBottom: 10
        }}
      >
        <h2 style={{ color: "#000000", fontWeight: "bold",  }}>{props.project.projectName}</h2>
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
              <h5 style={{ color: "#535353" }}>Status</h5>
              <h5 style={{ color: "#000000", fontWeight: "bold", }} id="project-status" data-project-info="status">{props.project.projectStatus}</h5>
            </div>
            <div className="card-property">
              <h5 style={{ color: "#535353" }}>Type</h5>
              <h5 style={{ color: "#000000", fontWeight: "bold", }}id="project-type" data-project-info="type">{props.project.projectType}</h5>
            </div>
            <div className="card-property">
              <h5 style={{ color: "#535353" }}>Address</h5>
              <h5 style={{ color: "#000000", fontWeight: "bold", }} id="project-address" data-project-info="address" >{props.project.projectAddress}</h5>
            </div>
            <div className="card-property">
              <h5 style={{ color: "#535353" }}>Finish Date</h5>
              <h5 style={{ color: "#000000", fontWeight: "bold", }} id="project-address" data-project-info="address" >{props.project.projectFinishDate.toDateString()}</h5>
            </div>
            
            <div
              className="card-property"
              style={{
                backgroundColor: "#84AFDC",
                borderRadius: 9999,
                overflow: "auto",
                outline: "100",
                border: "1px solid black",
               
              }}
            >
              <div
                id="project-progress"
                data-project-info="progress"
                style={{
                  width: `${props.project.projectProgress}%`,
                  backgroundColor: "#3A2E37",
                  padding: "8px",
                  textAlign: "center",
                  borderRadius: 9999,
                }}
                >
                  {props.project.projectProgress}%
                </div>
            </div>
                       
          </div>
        </div>
      </div>
    </div>
  )
}