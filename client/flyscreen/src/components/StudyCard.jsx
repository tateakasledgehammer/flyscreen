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
    function handleAddNote(studyId) {   }
    function handleAssignTag(studyId, value) {    }

    if (!studies || studies.length === 0) {
        return <p>No studies uploaded.</p>;
    }

    return (
        <div>
            {studies.map((study, index) => {
                const isExpanded = toggleDetails?.[study.id] || false;
                return (
                <div key={study.id} className="study-card">
                    {/* Study information */}
                    <div className="title-wrapper">
                        <h3 className="study-title"><span className="highlightable">{study.title}</span></h3>
                        <div className="percentile-card">77%</div>
                    </div>
                    <div className="study-info">
                        <p><strong>Study Index: </strong>{study.id}</p>
                        <p className="authors"><strong>Authors: </strong>{study.authors}</p>
                        <p className="year"><strong>Year: </strong>{study.year}</p>
                        <p className="type"><strong>Type: </strong>{study.type}</p>
                        <p className="language"><strong>Language: </strong>{study.language}</p>
                        <p className="journal"><strong>Journal: </strong>{study.journal}</p>
                        <p className="volume"><strong>Volume: </strong>{study.volume}</p>
                        <p className="issue"><strong>Issue: </strong>{study.issue}</p>
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
                        <button className="adding-bottom-margin" onClick={() => (handleToggleDetails(study.id))}>
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
                        <button className="accept-btn" onClick={() => (handleAcceptStudy(index))}>ACCEPT</button>
                        <button className="reject-btn" onClick={() => (handleRejectStudy(index))}>REJECT</button>
                        <button onClick={() => (handleRemoveVote(index))}>REVERT</button>
                        <button onClick={() => (handleAddNote(index))}>ADD NOTE</button>
                        <select onChange={(e) => (handleAssignTag(index, e.target.value))}>
                            <option value="">SELECT TAG</option>
                        </select>
                    </div>
                </div>
            )})}
        </div>
    )
}