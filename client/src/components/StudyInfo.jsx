import { formatAuthors } from "../utils/screeningTools";

export default function StudyInfo(props) {
    const {
        study,
        highlighted,
        inclusionCriteria,
        exclusionCriteria,
        searchWords,
        highlightContent,
        isExpanded,
        handleToggleDetails

    } = props

    if (!study) return null;
    
    return (
        <>
        <div className="title-wrapper">
            <h3 className="study-title">
                {highlighted ? (
                    <span className="highlightable">
                        {highlightContent(study.title, inclusionCriteria, exclusionCriteria, searchWords)}
                    </span>
                ) : 
                    <span className="highlightable">
                        {study.title}
                    </span>
                }
            </h3>
            <div className="percentile-card">XX%</div>
        </div>
        
        <div className="study-info">
            <p><strong>Study Index: </strong>{study.id}</p>
            <p className="authors"><strong>Authors: </strong>{formatAuthors(study.authors)}</p>
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
                    <p className="keywords">
                        <strong>Keywords: </strong>
                        {highlighted ? (
                            <span className="highlightable">
                                {highlightContent(study.keywords, inclusionCriteria, exclusionCriteria, searchWords)}
                            </span>
                        ) : 
                            <span className="highlightable">
                                    {study.keywords}
                            </span>
                        }
                    </p>
                    <p className="abstract">
                        <strong>Abstract: </strong>
                        {highlighted ? (
                            <span className="highlightable">
                                {highlightContent(study.abstract, inclusionCriteria, exclusionCriteria, searchWords)}
                            </span>
                        ) : 
                            <span className="highlightable">
                                    {study.abstract}
                            </span>
                        }
                    </p>
                </div>
            )}
        </div>
        </>
    )
}