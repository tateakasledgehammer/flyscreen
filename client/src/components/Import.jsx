import { useState, useEffect } from "react";
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

    const [scoringMode, setScoringMode] = useState("keyword");
    const [isUploading, setIsUploading] = useState(false);

    const [scoringProgress, setScoringProgress] = useState({ done: 0, total: 0 });

    const [confirmDeleteUploadId, setConfirmDeleteUploadId] = useState(null)
    const [confirmClearAll, setConfirmClearAll] = useState(false);

    useEffect(() => {
        if (projectId) {
            fetchUploads();
        }
    }, [projectId]);

    async function fetchStudiesFromServer() {
        try {
            const res = await fetch(
                `/api/projects/${projectId}/studies-with-scores`,
                { credentials: "include" }
            );
            const data = await res.json();
            setStudies(data);

            const total = data.length;
            const done = data.filter(s => s.score_status === "done").length;

            setScoringProgress({ done, total });

        } catch (err) {
            console.error("Failed to fetch updated studies", err);
        }
    }

    async function getExistingStudies() {
        const res = await fetch(
            `/api/projects/${projectId}/studies-with-scores`,
            { credentials: "include" }
        );
        return await res.json();
    }

    async function fetchUploads() {
        const res = await fetch(
            `/api/projects/${projectId}/uploads`, 
            { credentials: "include" }
        );
        const data = await res.json();
        setUploadHistory(data);
    }

    useEffect(() => {
        if (!projectId) return;

        async function fetchScoringMode() {
            try {
                const res = await fetch(`/api/projects/${projectId}`, {
                    credentials: "include",
                });
                const data = await res.json();
                setScoringMode(data.scoring_mode || "keyword");
            } catch (err) {
                console.error("Failed to fetch scoring mode", err);
            }
        }

        fetchScoringMode();
    }, [projectId]);

    async function handleFileUpload(e) {
        setIsUploading(true);
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

            const res = await fetch(
                `/api/projects/${projectId}/studies/bulk`,
                { 
                    method: "POST",
                    headers: { "Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify({ studies, fileName: file.name })
                }
            );

            console.log("handleFileUpload doing something")
            console.log("Sending bulk upload request to:",
                `/api/projects/${projectId}/studies/bulk`
            );
            console.log("Res status:", res.status);

            setUploadProgress(70);
            console.log("Bulk upload response status:", res.status)

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Upload failed");
            }

            const result = await res.json();
            
            setUploadMessage(`Imported ${result.insertedCount} studies successfully`);

            await fetchStudiesFromServer();
            await fetchUploads();

            setUploadProgress(100);
            setTimeout(() => setUploadProgress(0), 1000);

        } catch (err) {
            console.error("Upload failed:", err);
            setError(err.message || "Failed to upload file");
        } finally {
            setIsLoading(false);
            setIsUploading(false);
        }
    }
    
    async function deleteUpload(uploadId) {
        if (!projectId) return;

        try {
            const res = await fetch(
                `/api/projects/${projectId}/uploads/${uploadId}`, 
                { method: "DELETE", credentials: "include" }
            );
    
            if (!res.ok) {
                const err = await res.json();
                setError(err.error || "Failed to delete upload");
                return;
            }
    
            await fetchUploads();
            await fetchStudiesFromServer();  

        } catch (err) {
            console.error("Delete upload failed:", err);
            setError("Failed to delete upload");

        } finally {
            setConfirmDeleteUploadId(null);
        }      
    }

    async function handleClear() {
        if (!projectId) return;
        setIsLoading(true);
        setConfirmClearAll(false);

        // clear uploads
        try {
            const uploadRes = await fetch(
                `/api/projects/${projectId}/uploads`, 
                { method: "DELETE", credentials: "include" }
            );
            if (!uploadRes.ok) {
                const err = await uploadRes.json();
                throw new Error(err.error || "Failed to clear uploads from the backend");
            }

            const studiesRes = await fetch(
                `api/projects/${projectId}/studies`,
                { method: "DELETE", credentials: "include" }
            );
            if (!studiesRes.ok) {
                const err = await studiesRes.json();
                throw new Error(err.error || "Failed to clear studies from the backend");
            }

            setStudies([]);
            setFileName('');
            setUploadHistory([]);
            setUploadProgress(0);
            setUploadMessage("");

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to clear imports.");

        } finally {
            setIsLoading(false);
        }
    }

    return (
        <>
        <div className="page-container">
            <h1><i className="fa-solid fa-upload"></i> Import Your Studies</h1>
            <h3 style={{ "color": "red" }}>NOTE:</h3>
            <p>
                Ensure that AI scoring is disabled before uploading your files. 
                Otherwise the upload will not work.
            </p>
            <p>
                Flyscreen Academics currently only accepts .ris files.
            </p>

            <br />
            
            <input className="import-input" type="file" accept=".ris" onChange={handleFileUpload} />
            
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

            <br />
            <br />

            <h3>Uploaded Files</h3>
            <br />
            {uploadHistory.length === 0 ? (
                <p>No uploads yet.</p>
            ) : (
                <table className="import-table">
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th>Studies</th>
                        <th>Duplicates</th>
                        <th>Total</th>
                        <th>Uploaded</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {uploadHistory.map((entry) => (
                        <tr key={entry.upload_id}>
                            <td>{entry.file_name}</td>
                            <td>{entry.study_count}</td>
                            <td>{entry.duplicate_count}</td>
                            <td>{entry.duplicate_count + entry.study_count}</td>
                            <td>{new Date(entry.created_at).toLocaleString()}</td>
                            <td>
                                {confirmDeleteUploadId === entry.upload_id ? (
                                    <span style={{ display: "flex", gap: 6 }}>
                                        Delete this upload and all its studies?{" "}
                                        <button onClick={() => deleteUpload(entry.upload_id)}>Yes</button>
                                        <button onClick={() => setConfirmDeleteUploadId(null)}>No</button>
                                    </span>
                                ) : (
                                    <button onClick={() => setConfirmDeleteUploadId(entry.upload_id)}>
                                        Delete
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
                </table>
            )}

            <br />
            <br />
            <br />

            {confirmClearAll ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                    <span style={{ display: "flex", gap: 6, fontSize: "0.88rem" }}>
                        Delete all uploads and studies?{" "}
                        <button style={{ background: "rgb(237,159,159)" }} onClick={handleClear}>Yes, clear all</button>
                        <button onClick={() => setConfirmClearAll(false)}>No</button>
                    </span>
                </div>
            ) : (
                <button 
                    onClick={() => setConfirmClearAll(true)}
                    style={{ background: "rgb(237,159,159" }}
                >
                    Clear imports & studies
                </button>
            )}
            
        </div>
        </>
    )
}