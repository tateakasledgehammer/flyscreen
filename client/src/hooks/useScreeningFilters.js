import { useMemo, useState } from "react";

export default function useScreeningFilters(studies) {
    // pagination
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [currentPage, setCurrentPage] = useState(1);

    // filters
    const [searchFilter, setSearchFilter] = useState("");
    const [sortOption, setSortOption] = useState("score-desc");
    const [tagFilter, setTagFilter] = useState("");
    const [languageFilter, setLanguageFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [highlighted, setHighlighted] = useState(true);

    // search
    const searchWords = useMemo(() => {
        return searchFilter
            .split(" ")
            .map(w => w.trim().toLowerCase())
            .filter(Boolean);
    }, [searchFilter]);

    function matchesSearch(study) {
        if (searchWords.length === 0) return true;
        const text = `
            ${study.title ?? ""} 
            ${study.abstract ?? ""} 
            ${study.keywords ?? ""}
        `.toLowerCase();
        return searchWords.every(w => text.includes(w));
    }

    // filters
    function matchesLanguage(study) {
        return languageFilter === "" || study.language === languageFilter;
    }
    function matchesType(study) {
        return typeFilter === "" || study.type === typeFilter;
    }
    function matchesTag(study) {
        if (tagFilter === "") return true;
        if (!Array.isArray(study.tags)) return false;

        return study.tags.some(t => t.name === tagFilter);
    }

    // sort
    function sortStudies(list) {
        const sorted = [...list];

        if (sortOption === "score-desc") {
            sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        } else if (sortOption === "score-asc") {
            sorted.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
        } else if (sortOption === "year-desc") {
            sorted.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
        } else if (sortOption === "year-asc") {
            sorted.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
        } else if (sortOption === "title-asc") {
            sorted.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortOption === "title-desc") {
            sorted.sort((a, b) => b.title.localeCompare(a.title));
        }

        return sorted;
    }

    const filteredStudies = useMemo(() => {
        return sortStudies(
            studies.filter(study => 
                matchesSearch(study) &&
                matchesLanguage(study) &&
                matchesTag(study) &&
                matchesType(study)
            )
        );
    }, [studies, searchWords, languageFilter, typeFilter, tagFilter, sortOption]);

    // Pagination
    const totalPages = Math.ceil(filteredStudies.length / itemsPerPage);
    
    const paginatedStudies = useMemo(() => {
        return filteredStudies.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
    }, [filteredStudies, currentPage, itemsPerPage]);

    // Clear function
    function clearFilters() {
        setSearchFilter("");
        setSortOption("score-desc");
        setLanguageFilter("");
        setTypeFilter("");
        setTagFilter("");
        setHighlighted(true);
        setCurrentPage(1);
        setItemsPerPage(25);
    }

    return {
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

        clearFilters
    };
}