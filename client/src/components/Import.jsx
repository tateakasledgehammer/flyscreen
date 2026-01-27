import { useState, useEffect } from "react";
import Navbar from "./Navbar";

export default function Import(props) {
    const { 
        studies, 
        setStudies, 
        savedStudies,
        inclusionCriteria,
        exclusionCriteria
    } = props

    const [fileName, setFileName] = useState('')
    const [error, setError] = useState('')
    const [uploadTimestamp, setUploadTimestamp] = useState('')
    const [uploadHistory, setUploadHistory] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    useEffect(() => {
        const savedFileName = localStorage.getItem('fileName');
        if (savedFileName) setFileName(savedFileName);

        const savedTimestamp = localStorage.getItem('uploadTimestamp');
        if (savedTimestamp) setUploadTimestamp(savedTimestamp);
        
        const savedUploadHistory = localStorage.getItem('uploadHistory');
        if (savedUploadHistory) setUploadHistory(JSON.parse(savedUploadHistory));
    }, [])

    function parseRIS(content) {
        const lines = content.split(/\r?\n/);
        const records = []; 
        let currentStudy = {};

        // skip empty lines
        lines.forEach(line => {
            if (!line.trim()) return;
            const tag = line.slice(0, 2); 
            const value = line.slice(6).trim(); 
    
        // TY is the start of a new, so checks to push the value to records then resets
        
            if (tag === 'TY') {
                currentStudy = { TY: value };
            } else if (tag === 'ER') {
                records.push(currentStudy);
                currentStudy = {};
            } else {
                if (!currentStudy[tag]) {
                    currentStudy[tag] = [];
                }
                currentStudy[tag].push(value);
            }
        });

        return records;
    };

    function normaliseStudy(entry) {
        return {
            _clientId: crypto.randomUUID(),
            id: null, // backend assigns - clever,
            title: entry.TI?.[0] ?? entry.T1?.[0] ?? "",
            abstract: entry.AB?.[0] ?? "",
            authors: entry.AU ? entry.AU.join(", ") : entry.A1 ? entry.A1.join(",") : "",
            year: entry.PY ? parseInt(entry.PY[0], 10) || null : null,
            type: entry.TY?.[0] ?? null,
            journal: entry.T2?.[0] ?? "",
            volume: entry.VL?.[0] ?? "",
            issue: entry.IS?.[0] ?? "",
            doi: entry.DO?.[0] ?? "",
            link: entry.UR?.[0] ?? "",
            keywords: entry.KW ? entry.KW.join(", ") : "",
            language: entry.LA?.[0] ?? "",

            // screening
            // votes: { accept: [], reject: [] },
            // status: "No Votes",

            // fullTextVotes: { accept: [], reject: [] },
            // fullTextStatus: "Full Text No Votes",

            notes: [],
            tagStatus: "",
        };
    }

    function handleStudyDetails(records) {
        return records.map(entry => {
            return normaliseStudy(entry);
        });
    }

    async function uploadStudiesInBatches(studies, batchSize = 100) {
        for (let i = 0; i < studies.length; i+= batchSize) {
            const batch = studies.slice(i, i + batchSize);

            const response = await fetch("http://localhost:5005/api/studies/bulk", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ studies: batch }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Batch upload failed");
            }

            console.log(
                `Uploaded batch ${i / batchSize + 1} / ${Math.ceil(studies.length / batchSize)}`
            );

            setUploadProgress(`Uploading ${i + batch.length} / ${studies.length}`);
        }
    }

    async function fetchStudiesFromServer() {
        const res = await fetch("http://localhost:5005/api/studies", {
            credentials: "include"
        });
        const data = await res.json();
        setStudies(data)
    }

    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return setError("No files uploaded");
        if (!file.name.toLowerCase().endsWith('.ris')) return setError("Please upload a .ris file");

        setError('')
        setFileName(file.name)
        localStorage.setItem('fileName', file.name)
        setIsLoading(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const parsedStudies = parseRIS(e.target.result);
                const studiesInDetail = handleStudyDetails(parsedStudies);

                const timeOfUpload = new Date().toLocaleString();
                setUploadTimestamp(timeOfUpload);
                localStorage.setItem('uploadTimestamp', timeOfUpload)

                const newEntryDetails = {
                    fileName: file.name,
                    studyCount: parsedStudies.length,
                    timestamp: timeOfUpload
                };
            
                const updatedUploadHistory = [...uploadHistory, newEntryDetails];
                setUploadHistory(updatedUploadHistory);
                localStorage.setItem('uploadHistory', JSON.stringify(updatedUploadHistory));
                
                await uploadStudiesInBatches(studiesInDetail, 100);
                fetchStudiesFromServer();
            } catch (err) {
                setError('Error parsing the file');
                console.log(err);
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsText(file);
    }
    
    async function handleClear() {
        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:5005/api/studies", {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                let errorMessage = "Failed to clear studies from the backend";

                try {
                    const errorData = await response.json();
                    if (errorData && errorData.error) {
                        errorMessage = errorData.error;
                    } else if (typeof errorData === "string") {
                        errorMessage = errorData;
                    }
                } catch {

                }
                throw new Error(errorMessage);
            }
            
            setStudies([]);
            setFileName('');
            setUploadTimestamp('');
            setUploadHistory([]);

            localStorage.removeItem('fileName');
            localStorage.removeItem('uploadTimestamp');
            localStorage.removeItem('uploadHistory');

        } catch (err) {
            console.error("Error clearing studies: ", err);
            setError("Failed to clear studies from backend. Try again.");
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

            <h3>Uploaded Files</h3>
            {isLoading && <p>Importing file...</p>}

            {uploadHistory.length === 0 ? (<p>No uploads yet.</p>) : (
                <ul>
                    {uploadHistory.map((entry, fileIndex) => (
                        <li key={fileIndex}>
                            <strong>Uploaded File: </strong>
                            {entry.fileName} - {entry.studyCount} studies uploaded - {entry.timestamp}
                        </li>
                    ))}
                </ul>
            )}

            {uploadProgress && <p>{uploadProgress}</p>}                

            <button onClick={handleClear}>Clear studies</button>
        </div>
        </>
    )
}