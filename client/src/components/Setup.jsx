import { useEffect, useState } from "react"

export default function Setup(props) {
    const { 
        isAuthenticated, 
        backgroundInformationForReview, 
        setBackgroundInformationForReview,
        studyTags,
        setStudyTags,
        inclusionCriteria,
        setInclusionCriteria,
        exclusionCriteria,
        setExclusionCriteria,
        fullTextExclusionReasons,
        setFullTextExclusionReasons,
        setSearchFilter,
        setProjectTitle,
        setUser,
        setStudies
    } = props;

    // tags
    const [newTagInput, setNewTagInput] = useState('');

    async function handleNewTag(e) {        
        const enteredTag = newTagInput.trim();
        if (enteredTag === '') return;
        if (studyTags.includes(enteredTag)) {
            alert("Tag already exists");
            return;
        }

        setStudyTags([...studyTags, enteredTag]);
        setNewTagInput('');
    }

    async function handleClearTags() {
        setStudyTags([]);
    }

    async function handleDeleteTag(index) {
        const amendedStudyTags = studyTags.filter((_, i) => i !== index);
        setStudyTags(amendedStudyTags);
        console.log('removed the tag')
    }

    //
    // Inclusion
    //

    // Inclusion sections
    const [newIncludedSectionInput, setNewIncludedSectionInput] = useState('');
    const [criteriaInputs, setCriteriaInputs] = useState({});

    function handleCriteriaInputChange(index, value) {
        setCriteriaInputs(prev => ({
            ...prev,
            [index]: value
        }));
    }

    const [inclusionSection, setInclusionSection] = useState(() => {
        const saved = localStorage.getItem('inclusionSection');
        return saved ? JSON.parse(saved) : [];
    });
    
    useEffect(() => {
        localStorage.setItem("inclusionSection", JSON.stringify(inclusionSection));
      }, [inclusionSection]);

    function handleNewInclusionCriteriaSection(e) {
        const enteredIncludedSection = newIncludedSectionInput.trim();
        if (enteredIncludedSection === '') return;
        if (inclusionSection.includes(enteredIncludedSection)) {
            alert("Inclusion criteria already exists");
            return;
        }
        setInclusionSection([...inclusionSection, { name: enteredIncludedSection, criteria: [] }])
        setNewIncludedSectionInput('');
    }

    async function handleClearInclusionSection() {
        setInclusionSection([]);
        setInclusionCriteria([]);
        setCriteriaInputs({});
    }

    async function handleDeleteInclusionSection(index) {
        const amendedInclusionSections = inclusionSection.filter((_, i) => i !== index);
        setInclusionSection(amendedInclusionSections);
    }

    // Inclusion criteria
    async function handleNewInclusionCriteria(index) {
        const enteredInclusion = (criteriaInputs[index] || "").trim();
        if (!enteredInclusion) return;

        const updated = [...inclusionSection];
        if (updated[index].criteria.includes(enteredInclusion)) {
            alert("Inclusion criteria already exists");
            return;
        }

        updated[index].criteria.push(enteredInclusion);
        setInclusionSection(updated);
        setCriteriaInputs(prev => ({
            ...prev,
            [index]: ""
        }));
    }

    async function handleDeleteInclusionCriteria(index, termIndex) {
        const amendedInclusionCriteria = [...inclusionSection];
        amendedInclusionCriteria[index].criteria.splice(termIndex, 1);
        setInclusionSection(amendedInclusionCriteria)
    }

    //
    // Exclusion
    //

    // Exclusion sections
    const [newExcludedSectionInput, setNewExcludedSectionInput] = useState('');
    const [exclusionCriteriaInputs, setExclusionCriteriaInputs] = useState({});

    function handleExclusionCriteriaInputChange(index, value) {
        setExclusionCriteriaInputs(prev => ({
            ...prev,
            [index]: value
        }));
    }

    const [exclusionSection, setExclusionSection] = useState(() => {
        const saved = localStorage.getItem('exclusionSection');
        return saved ? JSON.parse(saved) : [];
    });
    
    useEffect(() => {
        localStorage.setItem("exclusionSection", JSON.stringify(exclusionSection));
      }, [exclusionSection]);

    function handleNewExclusionCriteriaSection(e) {
        const enteredExcludedSection = newExcludedSectionInput.trim();
        if (enteredExcludedSection === '') return;
        if (exclusionSection.includes(enteredExcludedSection)) {
            alert("Exclusion criteria already exists");
            return;
        }
        setExclusionSection([...exclusionSection, { name: enteredExcludedSection, criteria: [] }])
        setNewExcludedSectionInput('');
    }

    async function handleClearExclusionSection() {
        setExclusionSection([]);
        setExclusionCriteria([]);
        setExclusionCriteriaInputs({});
    }

    async function handleDeleteExclusionSection(index) {
        const amendedExclusionSections = exclusionSection.filter((_, i) => i !== index);
        setExclusionSection(amendedExclusionSections);
    }

    // Exclusion criteria
    async function handleNewExclusionCriteria(index) {
        const enteredExclusion = (exclusionCriteriaInputs[index] || "").trim();
        if (!enteredExclusion) return;

        const updated = [...exclusionSection];
        if (updated[index].criteria.includes(enteredExclusion)) {
            alert("Exclusion criteria already exists");
            return;
        }

        updated[index].criteria.push(enteredExclusion);
        setExclusionSection(updated);
        setExclusionCriteriaInputs(prev => ({
            ...prev,
            [index]: ""
        }));
    }

    async function handleDeleteExclusionCriteria(index, termIndex) {
        const amendedExclusionCriteria = [...exclusionSection];
        amendedExclusionCriteria[index].criteria.splice(termIndex, 1);
        setExclusionSection(amendedExclusionCriteria)
    }

    // 
    // Full Text Criteria
    // 
    const [fullTextInput, setFullTextInput] = useState('')

    function handleFullTextCriteriaInputChange(value) {
        setFullTextInput(value);
    }

    const [fullTextSub, setFullTextSub] = useState(() => {
        const saved = localStorage.getItem('fullTextExclusionReasons');
        return saved ? JSON.parse(saved) : [];
    });
    
    useEffect(() => {
        localStorage.setItem("fullTextExclusionReasons", JSON.stringify(fullTextSub));
      }, [fullTextSub]);

    async function handleNewFullTextExclusion() {
        const enteredFullText = fullTextInput.trim();
        if (enteredFullText === '') return;
        if (fullTextSub.includes(enteredFullText)) {
            alert("Criteria already exists");
            return;
        }
        setFullTextSub([...fullTextSub, enteredFullText])
        setFullTextInput('');
    }

    async function handleDeleteFullTextExclusion(index) {
        const amendedFullText = fullTextSub.filter((_, i) => i !== index);
        setFullTextSub(amendedFullText);
    }

    async function handleClearFullTextReasons() {
        setFullTextSub([])
        setFullTextInput('')
    }

    //
    // Global Inclusion + Exclusion
    //

    useEffect(() => {
        const criteria = inclusionSection.flatMap(section => section.criteria);
        setInclusionCriteria(criteria);
    }, [inclusionSection]);
      
    useEffect(() => {
        const criteria = exclusionSection.flatMap(section => section.criteria);
        setExclusionCriteria(criteria);
    }, [exclusionSection]);

    useEffect(() => {
        const criteria = fullTextSub.flatMap(term => term);
        setFullTextExclusionReasons(criteria);
    }, [fullTextSub]);

    function resetApp() {
        setStudies([]);
        setSearchFilter("")
        setInclusionCriteria([]);
        setExclusionCriteria([]);
        setFullTextExclusionReasons([])
        setBackgroundInformationForReview({})
        setProject(null);
        setUser(null);
        setStudyTags([]);
        localStorage.clear();
        console.log("All data cleared")
    }

    return (
        <>
        <h1><i className="fa-solid fa-circle-info"></i> Setup Your Review</h1>

        <div className="homepage-section">
                <h3>Clear</h3>
                <button onClick={resetApp}>Reset</button>
                <br />
                <br />
        </div>

        {/* Review Title */}
        <div>
            <h3>Review Name</h3>
            <input 
                onChange={(e) => 
                    setBackgroundInformationForReview({
                        ...backgroundInformationForReview, 
                        title: e.target.value
                    })
                }
                type="text" 
                value={backgroundInformationForReview.title} 
                placeholder="Provide the title of your review..." 
                id="review-title"></input>
        </div>

        {/* Study Type */}
        <div>
            <h3>Study Type</h3>
            <select 
                onChange={(e) => 
                    setBackgroundInformationForReview({
                        ...backgroundInformationForReview, 
                        studyType: e.target.value
                    })
                }
                value={backgroundInformationForReview.studyType}
                id="study-type"
                >
                    <option value="">Set study type</option>
                    <option value="Systematic Review">Systematic Review</option>
                    <option value="Scoping Review">Scoping Review</option>
                    <option value="Literature Review">Literature Review</option>
                    <option value="Rapid Review">Rapid Review</option>
                    <option value="Umbrella Review">Umbrella Review</option>
                    <option value="Other">Other</option>
            </select>
        </div>

        {/* Question Type */}
        <div>
            <h3>Question Type</h3>
            <select
                onChange={(e) => 
                    setBackgroundInformationForReview({
                        ...backgroundInformationForReview, 
                        questionType: e.target.value
                    })
                }
                value={backgroundInformationForReview.questionType} 
                id="question-type"
                >
                    <option value={null}>Set question type</option>
                    <option value="intervention">Intervention / Treatment</option>
                    <option value="prevention">Prevention</option>
                    <option value="etiology">Etiology</option>
                    <option value="diagnosis">Diagnosis</option>
                    <option value="prognosis">Prognosis</option>
                    <option value="qualitative">Qualitative</option>
            </select>
        </div>

        {/* Research Area */}
        <div>
            <h3>Area of Research</h3>
            <select 
                onChange={(e) => 
                    setBackgroundInformationForReview({
                        ...backgroundInformationForReview, 
                        researchArea: e.target.value
                    })
                }
                value={backgroundInformationForReview.researchArea} 
                id="research-area"
                    >
                    <option value={null}>Set research area</option>
                    <option value="arts">Arts & Humanities</option>
                    <option value="food-and-animals">Agriculture, Veterinary & Food sciences</option>
                    <option value="bio-and-chem">Biological & Chemical Sciences</option>
                    <option value="environmental">Environmental Sciences</option>
                    <option value="business-and-economic">Economic, Business & Social Sciences</option>
                    <option value="education">Education</option>
                    <option value="stem">Engineering, Maths, Physics & Technology</option>
                    <option value="medical-and-health">Medical & Health Science</option>
                    <option value="psychology">Psychology</option>
                    <option value="other">Other</option>
            </select>
        </div>

        <br />
        <hr />

        {/* Reviewer Settings */}
        <div>
            <h3>Reviewer Settings</h3>
            <p>Reviewers required for title & abstract screening</p>
            <select
                onChange={(e) => 
                    setBackgroundInformationForReview({
                        ...backgroundInformationForReview, 
                        numberOfReviewersForScreening: e.target.value
                    })
                }
                value={backgroundInformationForReview.numberOfReviewersForScreening} 
                id="screener-no"
                >
                    <option value="1">1</option>
                    <option value="2">2</option>
            </select>

            <p>Reviewers required for full text screening</p>
            <select
                onChange={(e) => 
                    setBackgroundInformationForReview({
                        ...backgroundInformationForReview, 
                        numberOfReviewersForFullText: e.target.value
                    })
                }
                value={backgroundInformationForReview.numberOfReviewersForFullText}
                id="full-text-screener-no"
                data-storage-key="fullTextScreenerNo"
                >
                    <option value="1">1</option>
                    <option value="2">2</option>
            </select>

            <p>Reviewers required for data extraction</p>
            <select
                onChange={(e) => 
                    setBackgroundInformationForReview({
                        ...backgroundInformationForReview, 
                        numberOfReviewersForExtraction: e.target.value
                    })
                }
                value={backgroundInformationForReview.numberOfReviewersForExtraction}
                id="data-extraction-screener-no"
                data-storage-key="dataExtractionNo"
                >
                    <option value="1">1</option>
                    <option value="2">2</option>
            </select>

            <button id="invite-reviewer">Invite Reviewer</button>
            {/* Open modal to input email, name, send link to access, backend to update their authentication */}
            
            <div id="reviewerList"></div>
            {/* List of reviewers + their status */}
        </div>

        <br />
        <hr />

        {/* Tag Setup */}
        <div>
            <h3>Define Tags</h3>
            <p>Tags will appear while you are screening and are helpful for you to place into groups to check later - whether it be to look into more, to inform another piece of research, or provide valuable background information.</p>
            <div>
                <input 
                    onChange={(e) => setNewTagInput(e.target.value)}
                    value={newTagInput}
                    placeholder="Enter your tag..." 
                    type="text" 
                >
                </input>
                {/* input gets added to tag list which gets added to list below */}
                <button onClick={handleNewTag}>Add Tag</button>

                <div className="criteria-section">
                    {(!studyTags || studyTags.length === 0) && <p>No tags provided.</p>}

                    {studyTags && studyTags.length > 0 && (
                        <div className="inclusion-exclusion-criteria">
                            {(studyTags.map((tag, index) => (
                                <h4 key={index}>
                                    {tag}
                                    <button onClick={() => handleDeleteTag(index)}>X</button>
                                </h4>
                            )))}
                        </div>
                    )}
                </div>

                <button onClick={handleClearTags}>Clear Tags</button>
            </div>
        </div>

        <br />
        <hr />

        {/* Inclusion / Exclusion Set Up */}
        <div>
            <h3>Set Inclusion & Exclusion Criteria</h3>
            <button id="resetIncExcCriteria">Reset Your Criteria</button>
            {/* Needs a modal to open to confirm okay to delete - only for primary author */}
            <p>The terms that you input below will show up highlighted in green (inclusion) or red (exclusion) to help guide your screening process (this can also be toggled off). You are able to add your own subheadings for maximum customisability.</p>

            <div>
                <div>
                    {/* Set up inclusion categories */}
                    <h3>Inclusion Criteria</h3>
                    <input 
                        onChange={(e) => setNewIncludedSectionInput(e.target.value)}
                        value={newIncludedSectionInput}
                        type="text" 
                        id="newInclusionSection" 
                        placeholder="New Section (i.e. Population, Intervention...)"></input>
                    <button onClick={() => handleNewInclusionCriteriaSection()}>Add Section</button>
                    {/* Inclusion cards to go in as divs below */}

                    {!inclusionSection || inclusionSection.length === 0 && (
                        <p>No criteria categories set.</p>
                    )}

                    {inclusionSection && inclusionSection.length > 0 && (
                        <div className="criteria-section">
                            {(inclusionSection.map((section, index) => (
                                <div key={index}>
                                    <h3>
                                        {section.name}
                                        <button onClick={() => handleDeleteInclusionSection(index)}
                                        >X</button>
                                    </h3>
                                    <input
                                        onChange={(e) => handleCriteriaInputChange(index, e.target.value)}
                                        value={criteriaInputs[index] || ""}
                                        id="newInclusionCriteria"
                                        placeholder="Provide your term for inclusion..."
                                    >
                                    </input>
                                    <button onClick={() => handleNewInclusionCriteria(index)}>Add</button>

                                    {(!section.criteria || section.criteria.length === 0) && (
                                        <p>No terms for inclusion added.</p>
                                    )}

                                    {(section.criteria && section.criteria.length > 0) && (
                                        <div className="inclusion-exclusion-criteria">
                                            {(section.criteria.map((term, termIndex) => (
                                                <div key={termIndex}>
                                                    <h4>
                                                        {term}
                                                        <button onClick={() => handleDeleteInclusionCriteria(index, termIndex)}
                                                        >X</button>
                                                    </h4>
                                                </div>
                                            )))}
                                        </div>
                                    )}


                                </div>
                            )))}
                        </div>
                    )}
                    
                    <button onClick={() => handleClearInclusionSection()}>Clear Inclusion Criteria</button>
                </div>


                <div>
                    {/* Set up exclusion categories */}
                    <h3>Exclusion Criteria</h3>
                    <input 
                        onChange={(e) => setNewExcludedSectionInput(e.target.value)}
                        value={newExcludedSectionInput}
                        type="text" 
                        id="newExclusionSection" 
                        placeholder="New Section (i.e. Population, Intervention...)"></input>
                    <button onClick={() => handleNewExclusionCriteriaSection()}>Add Section</button>

                    {!exclusionSection || exclusionSection.length === 0 && (
                        <p>No criteria categories set.</p>
                    )}

                    {exclusionSection && exclusionSection.length > 0 && (
                        <div className="criteria-section">
                            {(exclusionSection.map((section, index) => (
                                <div key={index}>
                                    <h3>
                                        {section.name}
                                        <button onClick={() => handleDeleteExclusionSection(index)}
                                        >X</button>
                                    </h3>
                                    <input
                                        onChange={(e) => handleExclusionCriteriaInputChange(index, e.target.value)}
                                        value={exclusionCriteriaInputs[index] || ""}
                                        id="newExclusionCriteria"
                                        placeholder="Provide your term for exclusion..."
                                    >
                                    </input>
                                    <button onClick={() => handleNewExclusionCriteria(index)}>Add</button>

                                    {(!section.criteria || section.criteria.length === 0) && (
                                        <p>No terms for exclusion added.</p>
                                    )}

                                    {(section.criteria && section.criteria.length > 0) && (
                                        <div className="inclusion-exclusion-criteria">
                                            {(section.criteria.map((term, termIndex) => (
                                                <div key={termIndex}>
                                                    <h4>
                                                        {term}
                                                        <button onClick={() => handleDeleteExclusionCriteria(index, termIndex)}
                                                        >X</button>
                                                    </h4>
                                                </div>
                                            )))}
                                        </div>
                                    )}


                                </div>
                            )))}
                        </div>
                    )}
                    
                    <button onClick={() => handleClearExclusionSection()}>Clear Exclusion Criteria</button>
                </div>

            </div>
        </div>    

        <br />
        <hr />

        {/* Set up Full Text exclusion reasons */}
        <div>
            {/* Set up exclusion categories */}
            <h3>Full Text Exclusion Criteria</h3>
            <input 
                onChange={(e) => setFullTextInput(e.target.value)}
                value={fullTextInput}
                type="text" 
                placeholder="New full text exclusion reasons (i.e. not a study, unavailable in English..."></input>
            <button onClick={() => handleNewFullTextExclusion()}>Add Reason</button>

            {!fullTextSub || fullTextSub.length === 0 && (
                <p>No criteria set.</p>
            )}

            {fullTextSub && fullTextSub.length > 0 && (
                <div className="criteria-section">
                    <div className="inclusion-exclusion-criteria">
                        {fullTextSub.map((term, index) => (
                            <h4 key={index}>
                                {term}
                                <button onClick={() => handleDeleteFullTextExclusion(index)}
                                >X</button>
                            </h4>
                        ))}
                    </div>
                </div>
            )}
                    
            <button onClick={() => handleClearFullTextReasons()}>Clear Criteria</button>
        </div>
        </>
    )
}