import { capitaliseFirstLetter } from "../utils/screeningTools"

export default function Overview(props) {
    const { 
        studies, 
        setStudies, 
        savedStudies, 
        backgroundInformationForReview, 
        studyTags,
        inclusionCriteria,
        exclusionCriteria,
        fullTextExclusionReasons,
        user
    } = props

    function handlePrismaDiagram() {
        alert("This function has not been set up")
    }
    return (
        <div className="page-container">
            <h2><i className="fa-solid fa-house-chimney"></i> Your Homepage</h2>
            {/* Add class and styling for the homepage cards + progress bar */}
            <div className="homepage-section">
                <h3>Overview</h3>
                <ul>
                    <li>Study Title: {backgroundInformationForReview.title || "No title set"}</li>
                    <li>Study Type: {backgroundInformationForReview.studyType || "No study type set"}</li>
                    <li>Reviewers needed for screening: {backgroundInformationForReview.numberOfReviewersForScreening || "Screener number not set"}</li>
                    <li>Reviewers needed for full text view: {backgroundInformationForReview.numberOfReviewersForFullText || "Reviewer number not set"}</li>
                    <li>Reviewers needed for extraction: {backgroundInformationForReview.numberOfReviewersForExtraction || "Extraction number not set"}</li>
                    <li>Primary reviewer: {user.username}</li>
                    <li>Other reviewers: {user.username}</li>
                </ul>
            </div>
            <div className="homepage-section">
                <h3>Import Your Studies</h3>
                <ul>
                    <li>Number of imported studies: {studies.length}</li>
                </ul>
            </div>
            <div className="homepage-section">   
                <h3>Set Up Your Review</h3>
                <ul>
                    {/* Study Tags */}
                    {(!studyTags || studyTags.length === 0) && <li>Tags: No tags provided.</li>}

                    {studyTags && studyTags.length > 0 && (
                    <>
                        <li>Tags: </li>
                        <ul>
                            {(studyTags.map((tag, index) => (
                                <li key={index}>{tag}</li>
                            )))}
                        </ul>
                    </>
                    )}                  

                    {/* Inclusion Criteria */}
                    <li>Inclusion Criteria:</li>

                    {inclusionCriteria && inclusionCriteria.length > 0 && (
                    <>
                        <ul>
                            {(!inclusionCriteria || inclusionCriteria.length === 0) && <li>No inclusion criteria set provided.</li>}

                            {(inclusionCriteria.map((section, index) => (
                                <li key={index}>
                                    {capitaliseFirstLetter(section.category)}: {section.criteria.join(", ")}
                                </li>
                            )))}
                        </ul>
                    </>
                    )}
                    {/* Exclusion Criteria */}
                    <li>Exclusion Criteria:</li>

                    {exclusionCriteria && exclusionCriteria.length > 0 && (
                    <>
                        <ul>
                            {(!exclusionCriteria || exclusionCriteria.length === 0) && <li>No exclusion criteria set provided.</li>}

                            {(exclusionCriteria.map((section, index) => (
                                <li key={index}>
                                    {capitaliseFirstLetter(section.category)}: {section.criteria.join(", ")}
                                </li>
                            )))}
                        </ul>
                    </>
                    )}
                    {/* Full Text Exclusion Criteria */}
                    <li>Full Text Exclusion Criteria:</li>

                    {fullTextExclusionReasons && fullTextExclusionReasons.length > 0 && (
                    <>
                        <ul>
                            {(!fullTextExclusionReasons || fullTextExclusionReasons.length === 0) && <li>No exclusion criteria set provided.</li>}

                            {(fullTextExclusionReasons.map((criteria, index) => (
                                <li key={index}>{criteria}</li>
                            )))}
                        </ul>
                    </>
                    )}



                </ul>
            </div>
            <div className="homepage-section">
                <h3>Title & Abstract Screening</h3>
                <button onClick={handlePrismaDiagram}>See PRISMA Flow Diagram</button>
                <ul>
                    <li>Unscreened: {studies.filter(study => study.status === "No votes").length}</li>
                    <li>One Vote: {studies.filter(study => study.status === "Awaiting second vote").length}</li>
                    <li>Approved: {studies.filter(study => study.status === "Accepted").length}</li>
                    <li>Conflicts: {studies.filter(study => study.status === "Conflict").length}</li>
                    <li>Rejected: {studies.filter(study => study.status === "Rejected").length}</li>
                </ul>
            </div>
            <div className="homepage-section">    
                <h3>Full Text Screening</h3>
                {/* ? copy above rather than double up */}
                <ul>
                    <li>
                        Unscreened: {studies.filter(study => 
                            study.fullTextStatus === "Full Text No Votes" && 
                            study.status === "Accepted"
                            ).length
                        }
                    </li>
                    <li>One Vote: {studies.filter(study => study.fullTextStatus === "Full Text Awaiting Second Vote").length}</li>
                    <li>Approved: {studies.filter(study => study.fullTextStatus === "Full Text Accepted").length}</li>
                    <li>Conflicts: {studies.filter(study => study.fullTextStatus === "Full Text Conflict").length}</li>
                    <li>Rejected: {studies.filter(study => study.fullTextStatus === "Full Text Rejected").length}</li>
                </ul>
            </div>
            <div className="homepage-section">
                <h3>Manage Your Included Studies</h3>
                <ul>
                    <li>Approved: {studies.filter(study => study.fullTextStatus === "Full Text Accepted").length}</li>
                </ul>
            </div>
        </div>
    )
}