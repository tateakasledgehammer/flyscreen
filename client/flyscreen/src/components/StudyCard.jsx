export default function StudyCard(props) {
    const { studies, setStudies, savedStudies, toggleDetails, setToggleDetails } = props;

    function handleToggleDetails(studyID) {
        setToggleDetails(prev => ({
            ...prev,
            [studyID]: !prev[studyID]
        }));
    }

    function handleAcceptStudy(studyId) {    }
    function handleRemoveVote(studyId) {    }
    function handleRejectStudy(studyId) {    }
    function handleAssignTag(studyId, value) {    }

    if (!studies || studies.length === 0) {
        return <p>No studies uploaded.</p>;
    }

    return (
        <div className="study-card">
            {studies.map((study, index) => {
                const isExpanded = toggleDetails?.[study.id] || false;
                return (
                <div key={study.id} className="study-entry">
                    {/* Study information */}
                    <h3><span className="highlightable">{study.title}</span></h3>
                    <div>
                        <p><strong>Study Index: </strong>{study.id}</p>
                        <p className="authors"><strong>Authors: </strong>{study.authors}</p>
                        <p className="year"><strong>Year: </strong>{study.year}</p>
                        <p className="type"><strong>Type: </strong>{study.type}</p>
                        <p className="language"><strong>Language: </strong>{study.language}</p>
                        <p className="journal"><strong>Journal: </strong>{study.journal}</p>
                        <p className="volume"><strong>Volume: </strong>{study.volume}</p>
                        <p className="issue"><strong>Issue: </strong>{study.issue}</p>
                        <p className="journal"><strong>Journal: </strong>{study.journal}</p>
                        <p className="doi"><strong>DOI: </strong>
                            {(study.doi !== "N/A") ? (
                                <a 
                                    href={`https://doi.org/${study.doi}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {study.doi}
                                </a>
                            ) : ("N/A")}
                        </p>
                    </div>

                    {/* Button to toggle keywords & abstract */}
                    <div>
                        <button onClick={() => (handleToggleDetails(study.id))}>
                            {!isExpanded ? "▲ Hide details" : "▼ Show details"}
                        </button>

                        {!isExpanded && (
                            <div>
                                <p className="keywords"><strong>Keywords: </strong><span className="highlightable">{study.keywords}</span></p>
                                <p className="abstract"><strong>Abstract: </strong><span className="highlightable">{study.abstract}</span></p>
                            </div>
                        )}
                    </div>
                    
                    {/* Actions section */}
                    <div className="actions">
                        <button onClick={() => (handleAcceptStudy(index))}>ACCEPT</button>
                        <button onClick={() => (handleRejectStudy(index))}>REJECT</button>
                        <button onClick={() => (handleRemoveVote(index))}>REVERT</button>
                        <textarea label="Add Note:" placeholder="Enter your note here..."/>
                        <select onChange={(e) => (handleAssignTag(index, e.target.value))}>
                            <option value="">Select a tag</option>
                        </select>
                    </div>
                </div>
            )})}
        </div>
    )
}