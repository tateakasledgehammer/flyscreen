import { useState } from "react";
import Navbar from "./Navbar";
import { parseRIS, validateStudy } from "../utils/risParser";

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
        if (!file.name.toLowerCase().endsWith('.ris')) 
            return setError("Please upload a .ris file");

        setError('')
        setIsLoading(true);
        setFileName(file.name);

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploadProgress(10);
            const text = await file.text();
            setUploadProgress(30);
            const studies = parseRIS(text);
            setUploadProgress(50);

            const validationErrors = [];
            studies.forEach((s, index) => {
                const errs = validateStudy(s);
                if (errs.length > 0) {
                    validationErrors.push(`Study ${index + 1}: ${errs.join(", ")}`)
                }
            });

            if (validationErrors.length > 0) {
                setError("RIS validation failed:\n" + validationErrors.join("\n"));
                setIsLoading(false);
                return;
            }

            const seen = new Set();
            const duplicates = [];

            studies.forEach((s) => {
                const key = `${s.title.toLowerCase()}-${s.year}`;
                if (seen.has(key)) duplicates.push(`${s.title} ${s.year}`);
                seen.add(key);
            });

            if (duplicates.length > 0) {
                const proceed = window.confirm(
                    "Duplicate entries found in the RIS file:\n" +
                    duplicates.join("\n") +
                    "\n\nContinue anyway?"
                );
                if (!proceed) {
                    setIsLoading(false);
                    return;
                }
            }

            // fetchexistingstudies doesnt exist!!
            const existingKeys = new Set(
                (await fetchExistingStudies()).map(
                    (s) => `${s.title.toLowerCase()}-${year}`
                )
            );

            const duplicatesInDB = studies.filter((s) =>
                existingKeys.has(`${s.title.toLowerCase()}-${s.year}`)
            );

            if (duplicatesInDB.length > 0) {
                const proceed = window.confirm(
                    `${duplicatesInDB.length} studies already exist in this project. \nContinue anyway?`
                );
                if (!proceed) {
                    setIsLoading(false);
                    return;
                }
            }

            // formData might not be right
            const res = await fetch(
                `http://localhost:5005/api/projects/${projectId}/studies/bulk`,
                { 
                    method: "POST",
                    headers: { "Content-Type": "application/json"},
                    credentials: "include",
                    body: formData
                }
            );
            setUploadProgress(70);

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Upload failed");
            }

            const result = await res.json();

            const newEntry = {
                
            };
            setUploadHistory((prev) => [
                ...prev, 
                {
                    fileName: file.name,
                    studyCount: result.importedCount,
                    timestamp: new Date().toLocaleString()
                }
            ]);
            
            setUploadProgress(
                `Imported ${result.importedCount} studies successfully`
            );

            await fetchStudiesFromServer();

            setUploadProgress(100);
            setTimeout(() => setUploadProgress(0), 1000);
        } catch (err) {
            console.error("Upload failed:", err);
            setError(err.message || "Failed to upload file");
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

            {uploadProgress > 0 && (
                <div style={{ width: "100%", background: "#eee", height: "10px", marginTop: "10px" }}>
                    <div style ={{ width: `${uploadProgress}`, height: "100%", background: "#4caf50", transition: "width 0.3s" }} />
                </div>   
            )}

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