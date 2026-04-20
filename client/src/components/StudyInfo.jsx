import { formatAuthors, formatKeywords } from "../utils/screeningTools";

export default function StudyInfo(props) {
    const {
        study,
        highlightContent,
        isExpanded,
        handleToggleDetails,
        searchFilter,
        inclusionTerms,
        exclusionTerms
    } = props;

    if (!study) return null;

    const safeTitle = study.title || "N/A";
    const safeAbstract = study.abstract || "N/A";
    const safeKeywords = formatKeywords(study.keywords) || "N/A";

    const filteredWords = searchFilter
        ? searchFilter.split(" ").map(w => w.trim()).filter(Boolean)
        : [];

    return (
        <>
        <div className="title-wrapper">
            <h3 className="study-title">
                {highlightContent(
                    safeTitle, 
                    inclusionTerms,
                    exclusionTerms,
                    filteredWords
                )}      
            </h3>
        </div>

        <div className="study-info">
            <p><strong>Authors: </strong>{formatAuthors(study.authors)}</p>
            <p><strong>Year: </strong>{study.year}</p>
            <p className="disappear-when-reduced"><strong>Type: </strong>{study.type || "N/A"}</p>
            <p className="disappear-when-reduced"><strong>Language: </strong>{study.language || "N/A"}</p>
            <p className="disappear-when-reduced"><strong>Journal: </strong>{study.journal || "N/A"}</p>
            {/* <p className="disappear-when-reduced"><strong>Volume: </strong>{study.volume}</p> */}
            {/* <p className="disappear-when-reduced"><strong>Issue: </strong>{study.issue}</p> */}
            
            <p>
                <strong>DOI: </strong>
                {study.doi ? (
                    <a 
                        href={`https://doi.org/${study.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {study.doi}
                    </a>
                ) : "N/A"}
            </p>
        </div>

        {/* Button to toggle keywords & abstract */}
        <div>
            <button 
                className="adding-bottom-margin" 
                onClick={() => handleToggleDetails(study.id)}
            >
                {!isExpanded ? "▲ Hide details" : "▼ Show details"}
            </button>
            
            {!isExpanded && (
                <div>
                    <p className="keywords">
                        <strong>Keywords: </strong>
                        {highlightContent(
                            safeKeywords, 
                            inclusionTerms, 
                            exclusionTerms, 
                            filteredWords
                        )}
                    </p>
                    <p className="abstract">
                        <strong>Abstract: </strong>
                        {highlightContent(
                            safeAbstract, 
                            inclusionTerms,
                            exclusionTerms,
                            filteredWords
                        )}
                    </p>
                </div>
            )}
        </div>
        </>
    )
}