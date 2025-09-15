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

    return (
        <>
            <h2><i className="fa-solid fa-book-open-reader"></i> Full Text Review</h2>

            <StudyCard />
        </>
    )
}