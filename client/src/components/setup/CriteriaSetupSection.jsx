export default function CriteriaSetupSection({ 
    // Inclusion
    inclusionSection,
    newIncludedSectionInput,
    setNewIncludedSectionInput,
    criteriaInputs,
    handleCriteriaInputChange,
    handleNewInclusionCriteriaSection,
    handleNewInclusionCriteria,
    handleDeleteInclusionCriteria,
    handleDeleteInclusionSection,
    handleClearInclusionSection,

    // Exclusion
    exclusionSection,
    newExcludedSectionInput,
    setNewExcludedSectionInput,
    exclusionCriteriaInputs,
    handleExclusionCriteriaInputChange,
    handleNewExclusionCriteria,
    handleDeleteExclusionCriteria,
    handleDeleteExclusionSection,
    handleClearExclusionSection,

    // Full text
    fullTextSub,
    fullTextInput,
    setFullTextInput,
    handleNewFullTextExclusion,
    handleDeleteFullTextExclusion,
    handleClearFullTextReasons
}) {
    return (
        <>
        <div>
            <h3>Set Inclusion & Exclusion Criteria</h3>
            <p>The terms that you input below will show up highlighted in green (inclusion) or red (exclusion) to help guide your screening process (this can also be toggled off). You are able to add your own subheadings for maximum customisability.</p>

            {/* INCLUSION */}
            <div>
                <div>
                    <h3>Inclusion Criteria</h3>
                    <input 
                        onChange={(e) => setNewIncludedSectionInput(e.target.value)}
                        value={newIncludedSectionInput}
                        type="text" 
                        id="newInclusionSection" 
                        placeholder="New Section (i.e. Population, Intervention...)"
                    />
                    
                    <button onClick={() => handleNewInclusionCriteriaSection()}>Add Section</button>

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

                {/* EXCLUSION */}
                <div>
                    <h3>Exclusion Criteria</h3>
                    <input 
                        onChange={(e) => setNewExcludedSectionInput(e.target.value)}
                        value={newExcludedSectionInput}
                        type="text" 
                        id="newExclusionSection" 
                        placeholder="New Section (i.e. Population, Intervention...)"
                    />

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

        {/* FULL TEXT */}
        <div>
            <h3>Full Text Exclusion Criteria</h3>
            <input 
                onChange={(e) => setFullTextInput(e.target.value)}
                value={fullTextInput}
                type="text" 
                placeholder="New full text exclusion reasons (i.e. not a study, unavailable in English..."
            />
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
    );
}