import { formatAuthors, capitaliseFirstLetter, handleProbabilityScore } from "../utils/screeningTools";

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
    } = props;

    if (!study) return null;
    console.group("📊 StudyInfo debug");
    console.log("Study title:", study.title);
    console.log("Inclusion criteria:", inclusionCriteria);
    console.log("Exclusion criteria:", exclusionCriteria);
    console.log("Abstract snippet:", study.abstract?.slice(0, 200));
    console.log("Keywords:", study.keywords);
    console.groupEnd();


    // Tracking scores
    const {
        score,
        inclusionMatches,
        exclusionMatches
    } = handleProbabilityScore({
        abstract: study.abstract,
        keywords: study.keywords,
        inclusionCriteria,
        exclusionCriteria
    })

    const totalCriteria = Array.isArray(inclusionCriteria) 
        ? inclusionCriteria.length 
        : 0;

    const percentage = totalCriteria > 0 
        ? Math.round((score / totalCriteria) * 100) 
        : 0;

    // Colours for scores
    let probabilityClass = "low-probability";
    if (percentage >= 67) probabilityClass = "high-probability";
    else if (percentage >= 34) probabilityClass = "medium-probability";

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
                {totalCriteria === 0 ? "N/A" : `${score}/${totalCriteria}`}

                <div className="percentile-contents">
                    <h4>Inclusion Matches:</h4>
                    {Object.keys(inclusionMatches).length === 0 && <p>None</p>}

                    {Object.entries(inclusionMatches).map(([category, terms]) => (
                        <p key={capitaliseFirstLetter(category)}>
                            {capitaliseFirstLetter(category)}: {terms.length > 0 ? terms.join(", "): "None"}
                        </p>
                    ))}
                    <h4>Exclusion Matches:</h4>
                    {Object.keys(exclusionMatches).length === 0 && <p>None</p>}
                    {Object.entries(exclusionMatches).map(([category, terms]) => (
                        <p key={capitaliseFirstLetter(category)}>
                            {capitaliseFirstLetter(category)}: {terms.length > 0 ? terms.join(", "): "None"}
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
            <p>
                <strong>DOI: </strong>
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
                                {highlightContent(
                                    study.keywords, 
                                    inclusionCriteria.flatMap(s => s.criteria), 
                                    exclusionCriteria.flatMap(s => s.criteria), 
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
                                    inclusionCriteria.flatMap(s => s.criteria), 
                                    exclusionCriteria.flatMap(s => s.criteria), 
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