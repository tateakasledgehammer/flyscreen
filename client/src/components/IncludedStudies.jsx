import { formatAuthors } from "../utils/screeningTools";
import StudyCard from "./StudyCard";

export default function IncludedStudies(props) {
    const {
        studies,
    } = props;

    const acceptedStudies = studies.filter(
        (study) => study.fullTextStatus === "Full Text Accepted"
    );

    return (
        <>
            <h2><i className="fa-solid fa-list-check"></i> Manage Included Studies</h2>
            <div className="filter-notice">
                <h3>Your Included Studies ({acceptedStudies.length})</h3>
                <button>Export studies</button>
            </div>
            {/*
                <ul>
                    {acceptedStudies.map((study) => (
                        <>
                            <h4 key={study.id}>"{study.title}"" by <i>{formatAuthors(study.authors)}</i></h4>
                            <p key={study.id}>{study.abstract}</p>
                            <hr />
                        </>
                    ))}
                </ul>
            */}

            <StudyCard 
                studies={acceptedStudies}
            />

        </>
    )
}