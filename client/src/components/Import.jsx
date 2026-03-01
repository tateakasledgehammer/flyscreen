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
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadMessage, setUploadMessage] = useState('');

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

    async function getExistingStudies() {
        const res = await fetch(
            `http://localhost:5005/api/projects/${projectId}/studies-with-scores`,
            { credentials: "include" }
        );
        return await res.json();
    }

    async function fetchUploads() {
        const res = await fetch(
            `http://localhost:5005/api/projects/${projectId}/uploads`, 
            { credentials: "include" }
        );
        const data = await res.json();
        setUploadHistory(data);
    }

    async function deleteUpload(uploadId) {
        const proceed = window.confirm("Delete this upload and all its studies");
        if (!proceed) return;

        const res = await fetch(
            `http://localhost:5005/api/projects/${projectId}/uploads`, 
            { 
                method: "DELETE",
                credentials: "include" 
            }
        );

        if (!res.ok) {
            const err = await res.json();
            setError(err.error || "Failed to delete upload");
            return;
        }

        await fetchUploads();
        await fetchStudiesFromServer();           
    }

    async function handleFileUpload(e) {
        if (!projectId) return setError("No project selected");

        const file = e.target.files[0];
        if (!file) return setError("No files uploaded");
        if (!file.name.toLowerCase().endsWith('.ris')) 
            return setError("Please upload a .ris file");

        setError('');
        setIsLoading(true);
        setFileName(file.name);
        setUploadProgress(10);

        try {
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

            // const seen = new Set();
            // const duplicates = [];

            // studies.forEach((s) => {
            //     const key = `${s.title.toLowerCase()}-${s.year}`;
            //     if (seen.has(key)) duplicates.push(`${s.title} ${s.year}`);
            //     seen.add(key);
            // });

            // if (duplicates.length > 0) {
            //     const proceed = window.confirm(
            //         "Duplicate entries found in the RIS file:\n" +
            //         duplicates.join("\n") +
            //         "\n\nContinue anyway?"
            //     );
            //     if (!proceed) {
            //         setIsLoading(false);
            //         return;
            //     }
            // }

            // const existingKeys = new Set(
            //     (await getExistingStudies()).map(
            //         s => `${s.title.toLowerCase()}-${s.year}`
            //     )
            // );

            // const duplicatesInDB = studies.filter(
            //     s => existingKeys.has(`${s.title.toLowerCase()}-${s.year}`)
            // );

            // if (duplicatesInDB.length > 0) {
            //     const proceed = window.confirm(
            //         `${duplicatesInDB.length} studies already exist in this project. \nContinue anyway?`
            //     );
            //     if (!proceed) {
            //         setIsLoading(false);
            //         return;
            //     }
            // }

            const res = await fetch(
                `http://localhost:5005/api/projects/${projectId}/studies/bulk`,
                { 
                    method: "POST",
                    headers: { "Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify({ studies, fileName: file.name })
                }
            );

            setUploadProgress(70);

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Upload failed");
            }

            const result = await res.json();
            
            setUploadMessage(`Imported ${result.importedCount} studies successfully`);

            await fetchStudiesFromServer();
            await fetchUploads();

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
            setUploadMessage("");

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
            {uploadMessage && <p>{uploadMessage}</p>}

            {uploadProgress > 0 && (
                <div style={{ width: "100%", background: "#eee", height: "10px", marginTop: "10px" }}>
                    <div style ={{ 
                        width: `${uploadProgress}%`, 
                        height: "100%", 
                        background: "#4caf50", 
                        transition: "width 0.3s" 
                    }} />
                </div>   
            )}

            <h3>Uploaded Files</h3>

            {uploadHistory.length === 0 ? (
                <p>No uploads yet.</p>
            ) : (
                <ul>
                    {uploadHistory.map((entry) => (
                        <li key={entry.upload_id}>
                            <strong>Uploaded File: </strong>
                            {entry.file_name} - {entry.study_count} studies uploaded - {entry.created_at}
                            <button onClick={() => deleteUpload(entry.upload_id)}>Delete</button>
                        </li>
                    ))}
                </ul>
            )}

            <button onClick={handleClear}>Clear studies</button>
        </div>
        </>
    )
}