import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import ReviewTitleSection from "./setup/ReviewTitleSection";
import StudyTypeSection from "./setup/StudyTypeSection";
import TagSetupSection from "./setup/TagSetupSection";
import CriteriaSetupSection from "./setup/CriteriaSetupSection";
import QuestionTypeSection from "./setup/QuestionTypeSection";
import ResearchAreaSection from "./setup/ResearchAreaSection";
import ReviewerSettingsSection from "./setup/ReviewerSettingsSection";

export default function Setup(props) {
    const { 
        projectId,
        setUser,
        setStudies
    } = props;

    // UI STATES
    const [studyTags, setStudyTags] = useState([])
    const [newTagInput, setNewTagInput] = useState('');

    const [inclusionSection, setInclusionSection] = useState([]);
    const [newIncludedSectionInput, setNewIncludedSectionInput] = useState('');
    const [criteriaInputs, setCriteriaInputs] = useState({});

    const [exclusionSection, setExclusionSection] = useState([]);
    const [newExcludedSectionInput, setNewExcludedSectionInput] = useState('');
    const [exclusionCriteriaInputs, setExclusionCriteriaInputs] = useState({});

    const [fullTextSub, setFullTextSub] = useState([]);
    const [fullTextInput, setFullTextInput] = useState('');

    // Background info
    const [backgroundInformationForReview, setBackgroundInformationForReview] = useState({
      title: "",
      studyType: "",
      questionType: "",
      researchArea: "",
      numberOfReviewersForScreening: 2,
      numberOfReviewersForFullText: 2,
      numberOfReviewersForExtraction: 2,
  });

    // LOAD CRITERIA FROM BACKEND
  useEffect(() => {
    if (!projectId) return;

    async function loadCriteria() {
        try {
            const res = await fetch(`http://localhost:5005/api/projects/${projectId}/criteria`, {
                credentials: "include"
            });
            const data = await res.json();

            if (!data) return;

            // map backend > UI
            if (data.inclusionCriteria) {
                setInclusionSection(
                    data.inclusionCriteria.map(sec => ({
                        name: sec.category,
                        criteria: sec.criteria
                    }))
                );
            }
            if (data.exclusionCriteria) {
                setExclusionSection(
                    data.exclusionCriteria.map(sec => ({
                        name: sec.category,
                        criteria: sec.criteria
                    }))
                );
            }

            if (data.fullTextExclusionReasons) {
                setFullTextSub(data.fullTextExclusionReasons);
            }
        } catch (err) {
            console.error("Failed to load criteria", err)
        }
    }
    
    loadCriteria();
  }, [projectId]);


    // Save criteria to backend when they change

    async function saveCriteriaToBackend() {
        if (!projectId) return;

        const payload = {
            inclusionCriteria: inclusionSection.map(sec => ({
                category: sec.name,
                criteria: sec.criteria
            })),
            exclusionCriteria: exclusionSection.map(sec => ({
                category: sec.name,
                criteria: sec.criteria
            })),
            fullTextExclusionReasons: fullTextSub
        };

        try {
            await fetch(`http://localhost:5005/api/projects/${projectId}/criteria`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
        });

        } catch (err) {
            console.error("Failed to save criteria", err);
        }
    }
    // save when criteria changes
    useEffect(() => {
        saveCriteriaToBackend();
    }, [inclusionSection, exclusionSection, fullTextSub]);

    // TAGS
    function handleNewTag() {        
        const tag = newTagInput.trim();
        if (!tag) return;
        if (studyTags.includes(tag)) {
            return alert("Tag already exists");
        }

        setStudyTags([...studyTags, tag]);
        setNewTagInput('');
    }

    function handleClearTags() {
        setStudyTags([]);
    }

    function handleDeleteTag(index) {
        const amendedStudyTags = studyTags.filter((_, i) => i !== index);
        setStudyTags(amendedStudyTags);
    }

    //
    // Inclusion
    //

    function handleNewInclusionCriteriaSection() {
        const name = newIncludedSectionInput.trim();
        if (!name) return;
        if (inclusionSection.some(sec => sec.name === name)) return alert("Section exists");

        setInclusionSection([...inclusionSection, { name, criteria: [] }])
        setNewIncludedSectionInput('');
    }

    // has an error idk
    // const handleCriteriaInputChange(index, value) {
    //     setCriteriaInputs(prev => ({ ...prev, [index]: value }));
    // }

    function handleNewInclusionCriteria(index) {
        const term = (criteriaInputs[index] || "").trim();
        if (!term) return;

        const updated = [...inclusionSection];
        if (updated[index].criteria.includes(term)) {
            return alert("Inclusion criteria already exists");
        }

        updated[index].criteria.push(term);
        setInclusionSection(updated);

        setCriteriaInputs(prev => ({ ...prev, [index]: "" }));
    }

    async function handleDeleteInclusionCriteria(index, termIndex) {
        const updated = [...inclusionSection];
        updated[index].criteria.splice(termIndex, 1);
        setInclusionSection(updated);
    }

    async function handleDeleteInclusionSection(index) {
        const amendedInclusionSections = inclusionSection.filter((_, i) => i !== index);
        setInclusionSection(amendedInclusionSections);
    }

    async function handleClearInclusionSection() {
        setInclusionSection([]);
    }

    //
    // Exclusion
    //

    function handleNewExclusionCriteriaSection() {
        const name = newExcludedSectionInput.trim();
        if (!name) return;
        if (exclusionSection.some(sec => sec.name === name)) return alert("Section exists");

        setExclusionSection([...exclusionSection, { name, criteria: [] }])
        setNewExcludedSectionInput('');
    }

    function handleNewExclusionCriteria(index) {
        const term = (exclusionCriteriaInputs[index] || "").trim();
        if (!term) return;

        const updated = [...exclusionSection];
        if (updated[index].criteria.includes(term)) {
            return alert("Exclusion criteria already exists");
        }

        updated[index].criteria.push(term);
        setExclusionSection(updated);

        setExclusionCriteriaInputs(prev => ({ ...prev, [index]: "" }));
    }

    async function handleDeleteExclusionCriteria(index, termIndex) {
        const updated = [...exclusionSection];
        updated[index].criteria.splice(termIndex, 1);
        setExclusionSection(updated);
    }

    async function handleDeleteExclusionSection(index) {
        const amendedExclusionSections = exclusionSection.filter((_, i) => i !== index);
        setExclusionSection(amendedExclusionSections);
    }

    async function handleClearExclusionSection() {
        setExclusionSection([]);
    }

    // 
    // Full Text Criteria
    // 

    function handleNewFullTextExclusion() {
        const term = fullTextInput.trim();
        if (!term) return;
        if (fullTextSub.includes(term)) {
            return alert("Criteria already exists");
        }
        setFullTextSub([...fullTextSub, term]);
        setFullTextInput('');
    }

    function handleDeleteFullTextExclusion(index) {
        const amendedFullText = fullTextSub.filter((_, i) => i !== index);
        setFullTextSub(amendedFullText);
    }

    function handleClearFullTextReasons() {
        setFullTextSub([])
        setFullTextInput('')
    }

    //
    // Reset
    //

    function resetApp() {
        setStudies([]);
        setUser(null);
        localStorage.clear();
        window.location.href = "/";
    }

    return (
        <>
        <Navbar />
        <div className="page-container">
        <h2><i className="fa-solid fa-circle-info"></i> Setup Your Review</h2>

        <div className="homepage-section">
                <h3>Clear</h3>
                <button onClick={resetApp}>Reset</button>
                <br />
                <br />
        </div>

        <ReviewTitleSection
            backgroundInformationForReview={backgroundInformationForReview}
            setBackgroundInformationForReview={setBackgroundInformationForReview}
        />
        <StudyTypeSection
            backgroundInformationForReview={backgroundInformationForReview}
            setBackgroundInformationForReview={setBackgroundInformationForReview}
        />
        <QuestionTypeSection
            backgroundInformationForReview={backgroundInformationForReview}
            setBackgroundInformationForReview={setBackgroundInformationForReview}
        />
        <ResearchAreaSection
            backgroundInformationForReview={backgroundInformationForReview}
            setBackgroundInformationForReview={setBackgroundInformationForReview}
        />
        
        <br />
        <hr />

        <ReviewerSettingsSection
            backgroundInformationForReview={backgroundInformationForReview}
            setBackgroundInformationForReview={setBackgroundInformationForReview}
        />

        <br />
        <hr />

        <TagSetupSection
            studyTags={studyTags}
            setStudyTags={setStudyTags}
            newTagInput={newTagInput}
            setNewTagInput={setNewTagInput}
            handleNewTag={handleNewTag}
            handleDeleteTag={handleDeleteTag}
            handleClearTags={handleClearTags}
        />

        <br />
        <hr />

        <CriteriaSetupSection
            // Inclusion
            inclusionSection={inclusionSection}
            newIncludedSectionInput={newIncludedSectionInput}
            setNewIncludedSectionInput={setNewIncludedSectionInput}
            criteriaInputs={criteriaInputs}
            // handleCriteriaInputChange={handleCriteriaInputChange}
            handleNewInclusionCriteriaSection={handleNewInclusionCriteriaSection}
            handleNewInclusionCriteria={handleNewInclusionCriteria}
            handleDeleteInclusionCriteria={handleDeleteInclusionCriteria}
            handleDeleteInclusionSection={handleDeleteInclusionSection}
            handleClearInclusionSection={handleClearInclusionSection}

            // Exclusion
            exclusionSection={exclusionSection}
            newExcludedSectionInput={newExcludedSectionInput}
            setNewExcludedSectionInput={setNewExcludedSectionInput}
            exclusionCriteriaInputs={exclusionCriteriaInputs}
            // handleExclusionCriteriaInputChange={handleExclusionCriteriaInputChange}
            handleNewExclusionCriteria={handleNewExclusionCriteria}
            handleDeleteExclusionCriteria={handleDeleteExclusionCriteria}
            handleDeleteExclusionSection={handleDeleteExclusionSection}
            handleClearExclusionSection={handleClearExclusionSection}

            // Full text
            fullTextSub={fullTextSub}
            fullTextInput={fullTextInput}
            setFullTextInput={setFullTextInput}
            handleNewFullTextExclusion={handleNewFullTextExclusion}
            handleDeleteFullTextExclusion={handleDeleteFullTextExclusion}
            handleClearFullTextReasons={handleClearFullTextReasons}
        />

        </div>
        </>
    )
}