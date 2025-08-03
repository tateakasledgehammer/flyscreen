export default function Overview() {
    return (
        <>
            <h1><i className="fa-solid fa-house-chimney"></i> Your Homepage</h1>
            {/* Add class and styling for the homepage cards + progress bar */}
            <div>
                <h3 href="Overview.jsx">Overview</h3>
                <p>Study Title: ...</p>
                <p>Study Type: ...</p>
                <p>Study commenced on: ...</p>
                <p>Reviewers: ...</p>
            </div>
            <div>
                <h3 href="Import.jsx">Import Your Studies</h3>
                <p>Number of imported studies: ...</p>
            </div>
            <div>   
                <h3 href="Setup.jsx">Set Up Your Review</h3>
                <p>Study Details: ...</p>
                <p>Reviewer settings: ...</p>
                <p>Tags: ...</p>
                <p>Inclusion & Exclusion criteria: ...</p>
            </div>
            <div>
                <h3 href="TAScreening.jsx">Title & Abstract Screening</h3>
                <p>Unscreened: ...</p>
                <p>One Vote: ...</p>
                <p>Approved: ...</p>
                <p>Conflicts: ...</p>
                <p>Rejected: ...</p>
            </div>
            <div>    
                <h3 href="FullTextScreening.jsx">Full Text Screening</h3>
                {/* ? copy above rather than double up */}
                <p>Unscreened: ...</p>
                <p>One Vote: ...</p>
                <p>Approved: ...</p>
                <p>Conflicts: ...</p>
                <p>Rejected: ...</p>
            </div>
            <div>
                <h3 href="IncludedStudies.jsx">Manage Your Included Studies</h3>
            </div>
        </>
    )
}