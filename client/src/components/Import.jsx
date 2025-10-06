import { useState, useEffect } from "react"

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

    useEffect(() => {
        const savedFileName = localStorage.getItem('fileName');
        if (savedFileName) setFileName(savedFileName);

        const savedTimestamp = localStorage.getItem('uploadTimestamp');
        if (savedTimestamp) setUploadTimestamp(savedTimestamp);
        
        const savedUploadHistory = localStorage.getItem('uploadHistory');
        if (savedUploadHistory) setUploadHistory(JSON.parse(savedUploadHistory));
    }, [])

    useEffect(() => {
        localStorage.setItem('studies', JSON.stringify(studies));
    }, [studies])

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

    function handleProbabilityScore(entry) {
        const abstract = (entry.AB && entry.AB[0] || 'N/A');
        const keywords = (entry.KW ? entry.KW.join(', ') : 'N/A');
        const mainString = (abstract + " " + keywords).toLowerCase();

        let score = 0;
        let details = {};

        if (mainString.length < 10) {
            return {
                score: 0, 
                details: "Insufficient information available for study"    
            };
        }

        if (!inclusionCriteria || inclusionCriteria.length === 0 && 
            (!exclusionCriteria || exclusionCriteria.length === 0)) {
            return {
                score: 0,
                details: "No criteria set, unable to score"
            };
        }

        let inclusionMatches = {};
        if (inclusionCriteria && Array.isArray(inclusionCriteria)) {
            inclusionCriteria.forEach(section => {
                const foundIncludedWords = section.criteria.filter(w => 
                    mainString.includes(w.toLowerCase())
                );

                inclusionMatches[section.category] = 
                    foundIncludedWords.length > 0 ? foundIncludedWords : ["N/A"];

                if (foundIncludedWords.length > 0) {
                    score += 1;
                }
            });
        }

        let exclusionMatches = {};
        if (exclusionCriteria && Array.isArray(exclusionCriteria)) {
            exclusionCriteria.forEach(section => {
                const foundExcludedWords = section.criteria.filter(w => 
                    mainString.includes(w.toLowerCase())
                );

                exclusionMatches[section.category] = 
                    foundExcludedWords.length > 0 ? foundExcludedWords : ["N/A"];

                if (foundExcludedWords.length > 0) {
                    score -= 1;
                }
            });
        }

        return {
            score,
            details: {
                inclusionMatches,
                exclusionMatches
            }
        }
    }

    function handleStudyDetails(records) {
        return records.map((entry) => ({
            id: (entry.id || crypto.randomUUID()),
            title: (entry.TI && entry.TI[0] || entry.T1 && entry.T1[0] || 'N/A'),
            year: (entry.PY && entry.PY[0] || 'N/A'),
            type: (entry.M3 && entry.M3[0] || 'N/A'),
            authors: entry.AU ? entry.AU.join(', ') : 'N/A',
            doi: (entry.DO && entry.DO[0] || 'N/A'),
            link: (entry.UR && entry.UR[0] || 'N/A'),
            journal: (entry.T2 && entry.T2[0] || 'N/A'),
            volume: (entry.VL && entry.VL[0] || ''),
            issue: (entry.IS && entry.IS[0] || ''),
            abstract: (entry.AB && entry.AB[0] || 'N/A'),
            keywords: entry.KW ? entry.KW.join(', ') : 'N/A',
            language: (entry.LA && entry.LA[0] || 'N/A'),
            votes: { accept: [], reject: [] },
            status: "No votes",
            tagStatus: "",

            fullTextVotes: { accept: [], reject: []},
            fullTextStatus: "Full Text No Votes",
            notes: [],
            probabilityScore: handleProbabilityScore(entry),
        }));
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
        reader.onload = (e) => {
            try {
                const parsedStudies = parseRIS(e.target.result);
                const studiesInDetail = handleStudyDetails(parsedStudies);

                setStudies(prev => {
                    const fullStudies = [...prev, ...studiesInDetail];
                    localStorage.setItem('studies', JSON.stringify(fullStudies));
                    return fullStudies;
                });

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
            
            } catch (err) {
                setError('Error parsing the file');
                console.log(err);
            } finally {
                setIsLoading(false);
            }    
        };
        reader.readAsText(file);
    }
    
    function handleClear() {
        setStudies([]);
        setFileName('');
        setUploadTimestamp('');
        setUploadHistory([]);
        setIsLoading(false);

        localStorage.removeItem('studies');
        localStorage.removeItem('fileName');
        localStorage.removeItem('uploadTimestamp');
        localStorage.removeItem('uploadHistory')
    }

    return (
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

            <button onClick={handleClear}>Clear studies</button>
        </div>
    )
}