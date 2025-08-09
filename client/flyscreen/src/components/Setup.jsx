import { useState } from "react"

export default function Setup(props) {
    const { isAuthenticated } = props;

    // general background
    const [reviewTitle, setReviewTitle] = useState(''); 
    const [studyType, setStudyType] = useState('');
    const [questionType, setQuestionType] = useState('');
    const [researchArea, setResearchArea] = useState('');

    // information about reviewers
    const [screenerNo, setScreenerNo] = useState(1);
    const [fullTextScreenerNo, setFullTextScreenerNo] = useState(1);
    const [dataExtractionScreenerNo, setDataExtractionScreenerNo] = useState(1);
    
    // tags & criteria
    const [studyTags, setStudyTags] = useState([]);
    const [inclusionSection, setInclusionSection] = useState([]);
    const [inclusionCriteria, setInclusionCriteria] = useState([]);
    const [exclusionSection, setExclusionSection] = useState([]);
    const [exclusionCriteria, setExclusionCriteria] = useState([]);
    const [fullTextExclusionReasons, setFullTextExclusionReasons] = useState([]);

    async function handleNewTag() {
        

    }

    async function handleDeleteTag() {

    }

    async function handleNewInclusionCriteriaSection() {

    }

    async function handleDeleteInclusionSection() {

    }

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
            <input onChange={(e) => {
                setReviewTitle(e.target.value);
                console.log('New Review Title: ', e.target.value);
            }} type="text" value={reviewTitle} placeholder="Provide the title of your review..." id="titleReview"></input>
        </div>

        {/* Study Type */}
        <div>
            <h3>Study Type</h3>
            <select onChange={(e) => {
                setStudyType(e.target.value);
                console.log('Selected Study Type: ', e.target.value)
            }} value={studyType} id="study-type" name="study-type">
                <option value={null}>Set study type</option>
                <option value="systematic-review">Systematic Review</option>
                <option value="scoping-review">Scoping Review</option>
                <option value="literature-review">Literature Review</option>
                <option value="rapid-review">Rapid Review</option>
                <option value="umbrella-review">Umbrella Review</option>
                <option value="other-review">Other</option>
            </select>
        </div>

        {/* Question Type */}
        <div>
            <h3>Question Type</h3>
            <select onChange={(e) => {
                setQuestionType(e.target.value);
                console.log('Selected question type: ', e.target.value)
            }} value={questionType} id="question-type" name="question-type">
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
            <select onChange={(e) => {
                setResearchArea(e.target.value);
                console.log('Research area: ', e.target.value);
            }} value={researchArea} id="research-area">
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
            <select onChange={(e) => {
                setScreenerNo(e.target.value);
                console.log('Screener Number needed: '. e.target.value)
            }} value={screenerNo} id="screener-no" data-storage-key="screenerNo">
                <option value="1">1</option>
                <option value="2">2</option>
            </select>

            <p>Reviewers required for full text screening</p>
            <select onChange={(e) => {
                setFullTextScreenerNo(e.target.value);
                console.log('Full Text Screener Number needed: '. e.target.value)
            }} value={fullTextScreenerNo} id="full-text-screener-no" data-storage-key="fullTextScreenerNo">
                <option value="1">1</option>
                <option value="2">2</option>
            </select>

            <p>Reviewers required for data extraction</p>
            <select onChange={(e) => {
                setDataExtractionScreenerNo(e.target.value);
                console.log('Data Extraction Screener Number needed: '. e.target.value)
            }} value={dataExtractionScreenerNo} id="data-extraction-screener-no" data-storage-key="dataExtractionNo">
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
                <input placeholder="Enter your tag..." type="text"></input>
                {/* input gets added to tag list which gets added to list below */}
                <button onClick={handleNewTag}>Add Tag</button>

                <ul>{studyTags}</ul>

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
                    <input type="text" id="newInclusionSection" placeholder="New Section (i.e. Population, Intervention...)"></input>
                    <button onClick={handleNewInclusionCriteriaSection}>Add Section</button>
                    {/* Inclusion cards to go in as divs below */}
                </div>
                    
                <div>
                    {/* Set up exclusion categories */}
                    <h4>Exclusion Criteria</h4>
                    <input type="text" id="newExclusionSection" placeholder="New Section (i.e. Population, Intervention...)"></input>
                    <button onClick={handleNewInclusionCriteriaSection}>Add Section</button>
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