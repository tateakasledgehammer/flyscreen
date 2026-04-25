import { useState, useEffect, useMemo } from "react";
import Navbar from "./Navbar";
import StudyCard from "./StudyCard";
import * as XLSX from "xlsx";


import ScreeningFiltersBar from "./ScreeningFiltersBar";
import PaginationBar from "./PaginationBar";

import useScreeningFilters from "../hooks/useScreeningFilters.jsx";

export default function IncludedScreening({
    user,
    projectId,
    handleAssignTag,
    handleAddNote
}) {
    const [studies, setStudies] = useState([]);
    const [studyTags, setStudyTags] = useState([]);
    const [toggleDetails, setToggleDetails] = useState({});
    const [statusFilter, setStatusFilter] = useState("UNSCREENED");

    async function fetchScreeningSummary() {
        const res = await fetch(`/api/projects/${projectId}/screenings/summary`, {
            credentials: "include"
        });
        return await res.json();
    }

    async function fetchStudies() {
        try {
            const [studiesRes, summary] = await Promise.all([
                fetch(`/api/projects/${projectId}/studies-with-scores`,
                { credentials: "include" }),
                fetchScreeningSummary()
            ]);

            const studies = await studiesRes.json();

            const data = studies.map(s => ({
                ...s,
                screening: summary[s.id] || {
                    TA: { votes: [], myVote: null, status: "UNSCREENED" },
                    FULLTEXT: { votes: [], myVote: null, status: "UNSCREENED" }
                },
                tags: summary[s.id]?.tags || [],
                notes: summary[s.id]?.notes || [],
            }));
                
            setStudies(data);
        } catch (err) {
            console.error("Failed to fetch studies:", err);
        }
    }

    const [exportMsg, setExportMsg] = useState("");

    function handleExport() {
        if (includedStudies.length === 0) {
            setExportMsg("No studies to export...");
            return;
        }

        setExportMsg("");

        const rows = includedStudies.map(study => ({
            "Title":        study.title || "",
            "Authors":      study.authors || "",
            "Year":         study.year || "",
            "Journal":      study.journal || "",
            "Volume":       study.volume || "",
            "Issue":        study.issue || "",
            "DOI":          study.doi || "",
            "Link":         study.link || "",
            "Type":         study.type || "",
            "Language":     study.language || "",
            "Keywords":     study.keywords || "",
            "Abstract":     study.abstract || "",
            "Relevance Score": study.score != null ? study.score.toFixed(2) : "",
            "Tags":         study.tags?.map(t => t.name).join(", ") || "",
            "Notes":        study.notes?.map(n => n.content).join(" | ") || "",
            "Population":   "",
            "Intervention": "",
            "Comparator":   "",
            "Outcome":      "",
            "Study Design": "",
            "Sample Size":  "",
            "Key Findings": "",
            "Risk of Bias": "",
            "Notes (extraction)": "",
        }));
    
        const worksheet = XLSX.utils.json_to_sheet(rows);
    
        // Column widths
        worksheet["!cols"] = [
            { wch: 60 },  // Title
            { wch: 30 },  // Authors
            { wch: 8  },  // Year
            { wch: 25 },  // Journal
            { wch: 8  },  // Volume
            { wch: 8  },  // Issue
            { wch: 30 },  // DOI
            { wch: 30 },  // Link
            { wch: 12 },  // Type
            { wch: 10 },  // Language
            { wch: 40 },  // Keywords
            { wch: 80 },  // Abstract
            { wch: 14 },  // Score
            { wch: 20 },  // Tags
            { wch: 30 },  // Notes
            { wch: 20 },  // Population
            { wch: 20 },  // Intervention
            { wch: 20 },  // Comparator
            { wch: 20 },  // Outcome
            { wch: 20 },  // Study Design
            { wch: 14 },  // Sample Size
            { wch: 40 },  // Key Findings
            { wch: 14 },  // Risk of Bias
            { wch: 30 },  // Notes (extraction)
        ];
    
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Included Studies");
    
        const projectName = "flyscreen_included_studies";
        const date = new Date().toISOString().split("T")[0];
        XLSX.writeFile(workbook, `${projectName}_${date}.xlsx`);
        setExportMsg(`Exported ${includedStudies.length} studies into spreadsheet ${projectName}_${date}.xlsx`);
    }

    useEffect(() => {
        if (!projectId) return;

        fetch(`/api/projects/${projectId}/tags`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                setStudyTags(data.map(t => t.name));
            });
    }, [projectId]);

    useEffect(() => {
        if (projectId) fetchStudies();
    }, [projectId]);

    // Only FT-accepted studies
    const includedStudies = useMemo(() => {
        return studies.filter(
            study => study.screening?.FULLTEXT?.final?.vote === "ACCEPT"
        );
    }, [studies]);

    // criteria
    const [inclusionTerms, setInclusionTerms] = useState([]);
    const [exclusionTerms, setExclusionTerms] = useState([]);
    const [fullTextExclusionReasons, setFullTextExclusionReasons] = useState([]);

    useEffect(() => {
        if (!projectId) return;

        fetch(`/api/projects/${projectId}/criteria`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                setInclusionTerms(data.inclusionCriteria.flatMap(section => section.criteria));
                setExclusionTerms(data.exclusionCriteria.flatMap(section => section.criteria));
                setFullTextExclusionReasons(data.fullTextExclusionReasons ?? []);
            });
    }, [projectId]);

    const {
        filteredStudies,
        paginatedStudies,
        totalPages,
        searchFilter,
        setSearchFilter,
        sortOption,
        setSortOption,
        languageFilter,
        setLanguageFilter,
        typeFilter,
        setTypeFilter,
        tagFilter,
        setTagFilter,
        highlighted,
        setHighlighted,
        itemsPerPage,
        setItemsPerPage,
        currentPage,
        setCurrentPage,
        clearFilters,
        highlightContent,
        getScoreColour
    } = useScreeningFilters(includedStudies)

    return (
        <>
            <div className="page-container">
                <h1>
                    <i className="fa-solid fa-circle-check"></i> Final Included Studies
                </h1>

                <button onClick={handleExport}>
                    <i class="fa-solid fa-file-excel" /> EXPORT FINAL STUDIES
                </button>
                
                {exportMsg && <p style={{ marginTop: 8, fontSize: "0.85rem" }}>{exportMsg}</p>}                

                <br />
                <br />

                <ScreeningFiltersBar
                    searchFilter={searchFilter}
                    setSearchFilter={setSearchFilter}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    languageFilter={languageFilter}
                    setLanguageFilter={setLanguageFilter}
                    typeFilter={typeFilter}
                    setTypeFilter={setTypeFilter}
                    tagFilter={tagFilter}
                    setTagFilter={setTagFilter}
                    itemsPerPage={itemsPerPage}
                    setItemsPerPage={setItemsPerPage}
                    highlighted={highlighted}
                    setHighlighted={setHighlighted}
                    clearFilters={clearFilters}
                    studies={includedStudies}
                    studyTags={studyTags}
                />

                <StudyCard
                    stage="FULLTEXT"
                    studies={paginatedStudies}
                    toggleDetails={toggleDetails}
                    setToggleDetails={setToggleDetails}
                    user={user}
                    projectId={projectId}
                    refreshScreenings={fetchStudies}
                    studyTags={studyTags}
                    handleAssignTag={handleAssignTag}
                    handleAddNote={handleAddNote}
                    highlighted={highlighted}
                    highlightContent={highlightContent}
                    getScoreColour={getScoreColour}
                    inclusionTerms={inclusionTerms}
                    exclusionTerms={exclusionTerms}
                    fullTextExclusionReasons={fullTextExclusionReasons}
                />

                <PaginationBar
                    totalPages={totalPages}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>
        </>
    );
}
