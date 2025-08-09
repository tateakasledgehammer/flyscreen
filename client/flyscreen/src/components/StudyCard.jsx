export function StudyCard() {

    return (
        <>
        <div className="study-card">
            <h4><span className="highlightable">${title}</span></h4>
            <div>
                <p><strong>Study Index: </strong>${index}</p>
                <p className="authors"><strong>Authors: </strong>${authors}</p>
                <p className="year"><strong>Year: </strong>${year}</p>
                <p className="type"><strong>Type: </strong>${type}</p>
                <p className="language"><strong>Language: </strong>${language}</p>
                <p className="journal"><strong>Journal: </strong>${journal}</p>
                <p className="doi"><strong>DOI: </strong>${doi 
                    ? <a href="https://doi.org/${doi}" target="_blank" rel="noopener noreferrer">${doi}</a>
                    : 'N/A'}
                </p>
            </div>

            <div className="expandable">
                <p className="keywords"><strong>Keywords: </strong><span className="highlightable">${keywords}</span></p>
                <p className="abstract"><strong>Abstract: </strong><span className="highlightable">${abstract}</span></p>
            </div>
            
            <button>
                <p>▲ Hide Details</p> {/* event listener needed to change display */}
            </button>
        </div>

        <div className="actions">
            <button>
                <p>ACCEPT</p>
            </button>
            <button>
                <p>REJECT</p>
            </button>
            <button>
                <p>REVERT</p>
            </button>
            <textarea label="Add Note:" placeholder="Enter your note here..."/>
            <select>
                <option value="">Select a tag</option>
            </select>
        </div>
    
    </>
    )
}