import { useState, useEffect } from "react"

export default function CreateProject(props) {
    const { projectTitle, setProjectTitle } = props;

    const [errors, setErrors] = useState([])
    const [message, setMessage] = useState("")

    async function handleNewProject(e) {
        e.preventDefault();
        setErrors([])
        setMessage("")

        if (!project.trim()) {
            setErrors(["No title input"])
            return
        }

        try {
            const res = await fetch("/create-project", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ 
                    project
                })
            });
            const data = await res.json()

            if (res.ok) {
                setProjectTitle({ projectTitle })
                setMessage("Project created!")
            } else {
                setErrors([data.error || "Something went wrong :("])
            }
        }   catch (err) {
            setErrors(["Failed to connect"]);
        }
    }
    
    return (
        <div className="page-container">

            <h2><i className="fa-solid fa-pencil"></i> Create Project</h2>

                <form id="create-project" onSubmit={handleNewProject}>
                    <fieldset className="new-project">
                        <legend><strong>Create New Project</strong></legend>
                        
                        <label htmlFor="title">Title</label>
                        <input 
                            value={projectTitle}
                            onChange={(e) => setProjectTitle(e.target.value)}
                            type="text" 
                            id="title" 
                            name="title"
                            placeholder="enter your study title..."
                            autoComplete="off"
                        />
                        <button type="submit">Create project</button>
                    </fieldset>
                </form>

            {errors.length > 0 && (
                <ul style={{ color: "red" }}>
                    {errors.map((err, i) => (
                        <li key={i} style={{ color: "red" }}>
                            {err}
                        </li>
                    ))}
                </ul>
            )}

            {message && <p style={{ color: "green" }}>{message}</p>}
        </div>
    )
}