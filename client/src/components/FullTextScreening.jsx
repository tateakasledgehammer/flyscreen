import StudyCard from "./StudyCard";
import { useState, useEffect } from "react";
import { handleSortByOrder } from "../utils/screeningTools";

export default function FullTextScreening(props) {
    const { 
        studies, 
        setStudies, 
        savedStudies, 
        toggleDetails, 
        setToggleDetails, 
        studyTags, 
        setStudyTags, 
        user, 
        setUser, 
        searchFilter, 
        setSearchFilter, 
        inclusionCriteria, 
        setInclusionCriteria, 
        exclusionCriteria, 
        setExclusionCriteria,
    } = props;

    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState("ACCEPTED")

    function toggleStudyStatusShowing(filter) {
        setStatusFilter(filter)
    }

    const filterForAcceptedStudies = studies.filter(study => {
        if (statusFilter === "ACCEPTED") {
            return study.status === "Accepted"
        }
    });

    const sortedStudies = handleSortByOrder(filterForAcceptedStudies);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const screenedStudies = sortedStudies.slice(startIndex, endIndex);

    return (
        <>
            <h2><i className="fa-solid fa-book-open-reader"></i> Full Text Review</h2>

            <StudyCard 
                studies={screenedStudies}
                setStudies={setStudies}
            />
        </>
    )
}