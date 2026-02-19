import { useState } from "react";
import Navbar from "./Navbar";

export default function Import(props) {
    const { 
        setStudies, 
        projectId
    } = props

    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadHistory, setUploadHistory] = useState([]);
    const [uploadProgress, setUploadProgress] = useState('');

    async function fetchStudiesFromServer() {
        try {
            const res = await fetch(
                `http://localhost:5005/api/projects/${projectId}/studies-with-scores`,
                { credentials: "include" }
            );
            const data = await res.json();
            setStudies(data);
        } catch (err) {
            console.error("Failed to fetch updated studies", err);
        }
    }

    async function handleFileUpload(e) {
        if (!projectId) return setError("No project selected");

        const file = e.target.files[0];
        if (!file) return setError("No files uploaded");
        if (!file.name.toLowerCase().endsWith('.ris')) return setError("Please upload a .ris file");

        setError('')
        setIsLoading(true);
        setFileName(file.name);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(
                `http://localhost:5005/api/projects/${projectId}/studies/bulk`,
                { 
                    method: "POST",
                    credentials: "include",
                    body: formData
                }
            );

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Upload failed");
            }

            const result = await res.json();

            const newEntry = {
                fileName: file.name,
                studyCount: result.importedCount,
                timestamp: new Date().toLocaleString()
            };

            setUploadHistory((prev) => [...prev, newEntry]);
            
            setUploadProgress(
                `Imported ${result.importedCount} studies successfully`
            );

            await fetchStudiesFromServer();
        } catch (err) {
            console.error(err);
            const errData = await res.json();
            setError(errData.error || "Failed to upload file");
        } finally {
            setIsLoading(false);
        }
    }
    
    async function handleClear() {
        if (!projectId) return;

        setIsLoading(true);

        try {
            const res = await fetch(
                `http://localhost:5005/api/projects/${projectId}/studies`, 
                {
                    method: "DELETE",
                    credentials: "include",
                }
            );

            if (!res.ok) {
                let err = await res.json();
                throw new Error(err.error || "Failed to clear studies from the backend");
            }
            
            setStudies([]);
            setFileName('');
            setUploadHistory([]);
            setUploadProgress("");

        } catch (err) {
            console.error(err);
            setError("Failed to clear studies.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
        <Navbar />
        <div className="page-container">
            <h2><i className="fa-solid fa-upload"></i> Import Your Studies</h2>
            <input type="file" accept=".ris" onChange={handleFileUpload} />
            
            {error && (<p style={{ color: "red" }}>{error}</p>)}
            {isLoading && <p>Importing file...</p>}
            {uploadProgress && <p>{uploadProgress}</p>}

            <h3>Uploaded Files</h3>

            {uploadHistory.length === 0 ? (
                <p>No uploads yet.</p>
            ) : (
                <ul>
                    {uploadHistory.map((entry, fileIndex) => (
                        <li key={fileIndex}>
                            <strong>Uploaded File: </strong>
                            {entry.fileName} - {entry.studyCount} studies uploaded - {entry.timestamp}
                        </li>
                    ))}
                </ul>
            )}

            <button onClick={handleClear}>Clear studies</button>
        </div>
        </>
    )
}