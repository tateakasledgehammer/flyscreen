import { useState, useEffect } from "react"

export default function Import() {
    const [studies, setStudies] = useState([])
    const [fileName, setFileName] = useState('')
    const [error, setError] = useState('')
    const [uploadTimestamp, setUploadTimestamp] = useState('')
    const [uploadHistory, setUploadHistory] = useState([])

    useEffect(() => {
        const savedStudies = localStorage.getItem('studies');
        if (savedStudies) setStudies(JSON.parse(savedStudies));

        const savedFileName = localStorage.getItem('fileName');
        if (savedFileName) setFileName(savedFileName);

        const savedTimestamp = localStorage.getItem('uploadTimestamp');
        if (savedTimestamp) setUploadTimestamp(savedTimestamp);
        
        const savedUploadHistory = localStorage.getItem('uploadHistory');
        if (savedUploadHistory) setUploadHistory(JSON.parse(savedUploadHistory))
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

    function handleFileUpload(e) {
        const file = e.target.files[0];

        if (!file) {
            setError("No files uploaded");
            return;
        }

        if (!file.name.toLowerCase().endsWith('.ris')) {
            setError("Please upload a .ris file");
            return;
        }

        setError('')

        setFileName(file.name)
        localStorage.setItem('fileName', file.name)

        const reader = new FileReader();

        reader.onload = (e) => {
            
            const risFileContent = e.target.result;
            const parsedStudies = parseRIS(risFileContent);

            setStudies(parsedStudies);
            localStorage.setItem('studies', JSON.stringify(parsedStudies))

            const timeOfUpload = new Date().toLocaleString();
            setUploadTimestamp(timeOfUpload);
            localStorage.setItem('uploadTimestamp', timeOfUpload)

            const newEntryDetails = {
                fileName: file.name,
                studyCount: parsedStudies.length,
                timestamp: timeOfUpload
            }

            const updatedUploadHistory = [...uploadHistory, newEntryDetails];
            setUploadHistory(updatedUploadHistory);
            localStorage.setItem('uploadHistory', JSON.stringify(updateUploadHistory));
            
        }

        reader.readAsText(file)
    }


    function handleClear() {
        setStudies([]);
        setFileName('');
        setUploadTimestamp('');
        setUploadHistory([]);

        localStorage.removeItem('studies');
        localStorage.removeItem('fileName');
        localStorage.removeItem('uploadTimestamp');
        localStorage.removeItem('uploadHistory')
    }

    return (
        <>
            <h1><i className="fa-solid fa-upload"></i> Import Your Studies</h1>

            <input type="file" accept=".ris" onChange={handleFileUpload} />
            {error && (<p style={{ color: "red" }}>{error}</p>)}

            <h3>Uploaded Files</h3>
            
            {uploadHistory.length === 0 ? (<p>No uploads yet.</p>) : (
                <ul>
                    {uploadHistory.map((entry, index) => (
                        <li>
                            <strong>Uploaded File: </strong>
                            {entry.fileName} - {entry.studyCount} studies uploaded - {entry.timestamp}
               
                        </li>
                    ))}
                </ul>
            )}                

            <button onClick={handleClear}>Clear studies</button>
        </>
    )
}