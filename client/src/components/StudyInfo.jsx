import { formatAuthors, capitaliseFirstLetter } from "../utils/screeningTools";

export default function StudyInfo(props) {
    const {
        study,
        studies,
        hideDetails,
        highlighted,
        inclusionCriteria,
        exclusionCriteria,
        searchWords,
        highlightContent,
        isExpanded,
        handleToggleDetails
    } = props

    if (!study) return null;

    const { score, details } = study.probabilityScore;
    const total = inclusionCriteria.length;
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    let probabilityClass = "low-probability";
    if (percentage >= 67) {
        probabilityClass = "high-probability";
    } else if (percentage >= 34) {
        probabilityClass = "medium-probability";
    }

    return (
        <>
        <div className="title-wrapper">
            <h3 className="study-title">
                {highlighted ? (
                    <span className="highlightable">
                        {highlightContent(
                            study.title, 
                            inclusionCriteria.flatMap(section => section.criteria), 
                            exclusionCriteria.flatMap(section => section.criteria), 
                            searchWords
                        )}
                    </span>
                ) : 
                    <span className="highlightable">
                        {study.title}
                    </span>
                }
            </h3>

            <div className={`percentile-card ${probabilityClass}`}>
                {study.probabilityScore.score}/{inclusionCriteria.length}
                <div className="percentile-contents">
                    <h4>Inclusion Matches:</h4>
                    {Object.entries(study.probabilityScore.details.inclusionMatches).map(([category, terms]) => (
                        <p key={capitaliseFirstLetter(category)}>
                            {capitaliseFirstLetter(category)}: {terms.join(", ")}
                        </p>
                    ))}
                    <h4>Exclusion Matches:</h4>
                    {Object.entries(study.probabilityScore.details.exclusionMatches).map(([category, terms]) => (
                        <p key={category}>
                            {capitaliseFirstLetter(category)}: {terms.join(", ")}
                        </p>
                    ))}
                </div>
            </div>
        </div>

        <div className="study-info">
            {/* <p className="disappear-when-reduced"><strong>Study Index: </strong>{study.id}</p> */}
            <p><strong>Authors: </strong>{formatAuthors(study.authors)}</p>
            <p><strong>Year: </strong>{study.year}</p>
            <p className="disappear-when-reduced"><strong>Type: </strong>{study.type}</p>
            <p className="disappear-when-reduced"><strong>Language: </strong>{study.language}</p>
            <p className="disappear-when-reduced"><strong>Journal: </strong>{study.journal}</p>
            <p className="disappear-when-reduced"><strong>Volume: </strong>{study.volume}</p>
            <p className="disappear-when-reduced"><strong>Issue: </strong>{study.issue}</p>
            <p><strong>DOI: </strong>
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
            
            <input type="file" accept=".pdf" />

            {!isExpanded && (
                <div>
                    <p className="keywords">
                        <strong>Keywords: </strong>
                        {highlighted ? (
                            <span className="highlightable">
                                {highlightContent(
                                    study.keywords, 
                                    inclusionCriteria.flatMap(section => section.criteria), 
                                    exclusionCriteria.flatMap(section => section.criteria), 
                                    searchWords
                                )}
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
                                {highlightContent(
                                    study.abstract, 
                                    inclusionCriteria.flatMap(section => section.criteria), 
                                    exclusionCriteria.flatMap(section => section.criteria), 
                                    searchWords
                                )}
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