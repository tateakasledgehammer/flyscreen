export default function Overview() {
    return (
        <>
            <h1><i className="fa-regular fa-house-chimney"></i> Your Homepage</h1>
            {/* Add class and styling for the homepage cards + progress bar */}
            <div>
                <h3 href="Overview.jsx">Overview</h3>
                <ul>Study Title: ...</ul>
                <ul>Study Type: ...</ul>
                <ul>Study commenced on: ...</ul>
                <ul>Reviewers: ...</ul>
            </div>
            <div>
                <h3 href="Import.jsx">Import Your Studies</h3>
                <ul>Number of imported studies: ...</ul>
            </div>
            <div>   
                <h3 href="Setup.jsx">Set Up Your Review</h3>
                <ul>Study Details: ...</ul>
                <ul>Reviewer settings: ...</ul>
                <ul>Tags: ...</ul>
                <ul>Inclusion & Exclusion criteria: ...</ul>
            </div>
            <div>
                <h3 href="TAScreening.jsx">Title & Abstract Screening</h3>
                <ul>Unscreened: ...</ul>
                <ul>One Vote: ...</ul>
                <ul>Approved: ...</ul>
                <ul>Conflicts: ...</ul>
                <ul>Rejected: ...</ul>
            </div>
            <div>    
                <h3 href="FullTextScreening.jsx">Full Text Screening</h3>
                {/* ? copy above rather than double up */}
                <ul>Unscreened: ...</ul>
                <ul>One Vote: ...</ul>
                <ul>Approved: ...</ul>
                <ul>Conflicts: ...</ul>
                <ul>Rejected: ...</ul>
            </div>
            <div>
                <h3 href="IncludedStudies.jsx">Manage Your Included Studies</h3>
            </div>
        </>
    )
}