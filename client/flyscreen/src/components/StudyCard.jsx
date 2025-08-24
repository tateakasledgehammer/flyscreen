export default function StudyCard(props) {
    const { studies, setStudies, savedStudies } = props;

    function handleToggleDetails() {

    }
    function handleAcceptStudy() {

    }
    function handleRemoveVote() {

    }
    function handleRejectStudy() {
        
    }
    function handleAssignTag() {

    }

    if (!studies || studies.length === 0) {
        return <p>No studies uploaded.</p>;
    }

    return (
        <div className="study-card">
            {(studies.map((study, index) => (
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

                    {/* Button to toggle keywords & abstract */}
                    <button onClick={() => (handleToggleDetails(index))}>
                        <p>▲ Hide Details</p> {/* event listener needed to change display */}
                    </button>

                    {/* Keywords & Abstract */}
                    <div className="expandable">
                        <p className="keywords"><strong>Keywords: </strong><span className="highlightable">{study.keywords}</span></p>
                        <p className="abstract"><strong>Abstract: </strong><span className="highlightable">{study.abstract}</span></p>
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

                </div>
            )))}
        </div>
    )
}