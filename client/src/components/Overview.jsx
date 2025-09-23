export default function Overview(props) {
    const { studies, setStudies, savedStudies, backgroundInformationForReview, studyTags } = props

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
                    <li>Study Details: ...</li>
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

                    <li>Inclusion & Exclusion criteria: ...</li>
                </ul>
            </div>
            <div className="homepage-section">
                <h3>Title & Abstract Screening</h3>
                <ul>
                    <li>Unscreened: {studies.length}</li>
                    <li>One Vote: ...</li>
                    <li>Approved: ...</li>
                    <li>Conflicts: ...</li>
                    <li>Rejected: ...</li>
                </ul>
            </div>
            <div className="homepage-section">    
                <h3>Full Text Screening</h3>
                {/* ? copy above rather than double up */}
                <ul>
                    <li>Unscreened: ...</li>
                    <li>One Vote: ...</li>
                    <li>Approved: ...</li>
                    <li>Conflicts: ...</li>
                    <li>Rejected: ...</li>
                </ul>
            </div>
            <div className="homepage-section">
                <h3>Manage Your Included Studies</h3>
            </div>
        </div>
    )
}