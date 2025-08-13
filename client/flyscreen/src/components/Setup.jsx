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
        setFullTextExclusionReasons
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

    // Inclusion
    const [newIncludedSectionInput, setNewIncludedSectionInput] = useState('');

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
        setInclusionSection([...inclusionSection, enteredIncludedSection])
        setNewIncludedSectionInput('');
    }

    async function handleDeleteInclusionSection() {

    }

    // Exclusion
    const [newExcludedSectionInput, setNewExcludedSectionInput] = useState('');

    const [exclusionSection, setExclusionSection] = useState([]);

    useEffect(() => {
        localStorage.setItem(
          "exclusionSection",
          JSON.stringify(exclusionSection)
        )
      }, [exclusionSection]);

    async function handleNewExclusionCriteriSection() {

    }

    async function handleDeleteExclusionSection() {
        
    }

    async function handleNewInclusionCriteria() {

    }

    async function handleDeleteInclusionCriteria() {
        
    }

    async function handleDeleteExclusionCriteria() {

    }

    async function handleNewFullTextExclusion() {

    }

    async function handleDeleteFullTextExclusion() {

    }

    return (
        <>
        <h1><i className="fa-solid fa-circle-info"></i> Setup Your Review</h1>

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

                {(!studyTags || studyTags.length === 0) && <p>No tags provided.</p>}

                {studyTags && studyTags.length > 0 && (
                    <ul>
                        {(studyTags.map((tag, index) => (
                            <li key={index}>
                                {tag}
                                <button onClick={() => handleDeleteTag(index)}>X</button>
                            </li>
                        )))}
                    </ul>
                )}

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
                    <h4>Inclusion Criteria</h4>
                    <input 
                        onChange={(e) => setNewIncludedSectionInput(e.target.value)}
                        value={newIncludedSectionInput}
                        type="text" 
                        id="newInclusionSection" 
                        placeholder="New Section (i.e. Population, Intervention...)"></input>
                    <button onClick={handleNewInclusionCriteriaSection}>Add Section</button>
                    {/* Inclusion cards to go in as divs below */}

                    {inclusionSection && inclusionSection.length > 0 && (
                    <div>
                        {(inclusionSection.map((section, index) => (
                            <>
                            <h3 key={index}>{section}</h3>
                            <input />
                            <button>Add Inclusion Criteria</button>
                            </>
                        )))}
                    </div>
                )}
                </div>
                    
                <div>
                    {/* Set up exclusion categories */}
                    <h4>Exclusion Criteria</h4>
                    <input type="text" id="newExclusionSection" placeholder="New Section (i.e. Population, Intervention...)"></input>
                    <button type="button" onClick={handleNewInclusionCriteriaSection}>Add Section</button>
                    {/* Exclusion cards to go in as divs below */}
                    {/* They need their own buttons to add the actual criteria */}
                </div>
            </div>
        </div>    

        <br />
        <hr />

        {/* Set up Full Text exclusion reasons */}
        <div>
            <h3>Set Full Text Exclusion Reasons</h3>
            <input type="text" id="newFullTextExclusionInput" placeholder="New full text exclusion (i.e. incorrect setting)"></input>
            <button onClick={handleNewFullTextExclusion} id="addFullTextCriteriaBtn">Add Criteria</button>
            {/* li of the exclusion reasons */}
        </div>

        </>
    )
}