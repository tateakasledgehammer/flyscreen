import { useState, useEffect } from "react"
import Navbar from "./Navbar";
import CreateProject from "./CreateProject";

export default function Dashboard(props) {
    const { projectTitle, setProjectTitle } = props;
    
    return (
        <>
        <Navbar />
        <div className="page-container">
            <h2><i className="fa-solid fa-grip"></i> Dashboard</h2>
            <h3>Your projects:</h3>
            <div className="homepage-section">
                <p>Project 1: <a><strong>[insert project title]</strong></a> with [insert collaborators]</p>
                <p>52% complete</p>
                <div>Selected</div>
            </div>
            <div className="homepage-section">
                <p>Project 2: <a><strong>[insert project title]</strong></a> with [insert collaborators]</p>
                <p>13% complete</p>
                <div>Unselected</div>
            </div>
            <div className="homepage-section">
                <p>Project 3: <a><strong>[insert project title]</strong></a> with [insert collaborators]</p>
                <p>2% complete</p>
                <div>Unselected</div>
            </div>

            <CreateProject 
                projectTitle={projectTitle}
                setProjectTitle={setProjectTitle}
            />
        </div>
        </>
        
    )
}