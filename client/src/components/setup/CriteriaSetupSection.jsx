export default function CriteriaSetupSection({ 
   inclusionSections,
   exclusionSections,
   setInclusionSections,
   setExclusionSections,
   fullTextReasons,
   setFullTextReasons,
}) {

    //
    // inclusion
    //

    function addInclusionSection() {
        const name = prompt("New inclusion section name:");
        if (!name?.trim()) return;

        setInclusionSections(prev => [
            ...prev,
            { category: name.trim(), criteria: [], type: "inclusion" }
        ])
    }

    function deleteInclusionSection(index) {
        setInclusionSections(prev => prev.filter((_, i) => i !== index));
    }

    function addInclusionCriteria(sectionIndex) {
        const term = prompt("New inclusion term");
        if (!term?.trim()) return;

        setInclusionSections(prev =>
            prev.map((section, i) =>
                i === sectionIndex
                    ? { ...section, criteria: [...section.criteria, term.trim()] }
                    : section
            )
        )
    }

    function deleteInclusionCriteria(sectionIndex, termIndex) {
        setInclusionSections(prev =>
            prev.map((section, i) =>
                i === sectionIndex
                    ? {
                        ...section,
                        criteria: section.criteria.filter((_, j) => j !== termIndex)
                    }
                    : section
            )
        );
    }

    function clearInclusion() {
        setInclusionSections([]);
    }

    //
    // exclusion
    //

    function addExclusionSection() {
        const name = prompt("New exclusion section name:");
        if (!name?.trim()) return;

        setExclusionSections(prev => [
            ...prev,
            { category: name.trim(), criteria: [], type: "exclusion" }
        ])
    }

    function deleteExclusionSection(index) {
        setExclusionSections(prev => prev.filter((_, i) => i !== index));
    }

    function addExclusionCriteria(sectionIndex) {
        const term = prompt("New exclusion term");
        if (!term?.trim()) return;

        setExclusionSections(prev =>
            prev.map((section, i) =>
                i === sectionIndex
                    ? { ...section, criteria: [...section.criteria, term.trim()] }
                    : section
            )
        )
    }

    function deleteExclusionCriteria(sectionIndex, termIndex) {
        setExclusionSections(prev =>
            prev.map((section, i) =>
                i === sectionIndex
                    ? {
                        ...section,
                        criteria: section.criteria.filter((_, j) => j !== termIndex)
                    }
                    : section
            )
        );
    }

    function clearExclusion() {
        setExclusionSections([]);
    }

    //
    // full text reasons
    //

    function addFullTextReason() {
        const name = prompt("New full text reason:");
        if (!name?.trim()) return;

        setFullTextReasons(prev => [
            ...prev,
            name.trim()
        ]);
    }

    function deleteFullTextReason(index) {
        setFullTextReasons(prev => prev.filter((_, i) => i !== index));
    }

    function clearFullTextReasons() {
        setFullTextReasons([]);
    }

    return (
        <>
        <div>
            <h3>Set Inclusion & Exclusion Criteria</h3>
            <p>The terms that you input below will show up highlighted in green (inclusion) or red (exclusion) to help guide your screening process (this can also be toggled off). You are able to add your own subheadings for maximum customisability.</p>

            {/* INCLUSION */}
            <div>
                <h3>Inclusion Criteria</h3>
                <button onClick={addInclusionSection}>Add Inclusion Section (i.e. Population, Intervention...)</button>
                {inclusionSections.length === 0 && <p>No inclusion sections set.</p>}

                {inclusionSections && inclusionSections.length > 0 && (
                    <div className="criteria-section">
                        {(inclusionSections.map((section, index) => (
                            <div key={index}>
                                <h4>
                                    {section.category}
                                    <button onClick={() => deleteInclusionSection(index)}>X</button>
                                </h4>

                                <button onClick={() => addInclusionCriteria(index)}>Add Term</button>
                                
                                {section.criteria.length === 0 && (
                                    <p>No terms for inclusion added.</p>
                                )}

                            <div className="inclusion-exclusion-criteria">
                                {(section.criteria.map((term, termIndex) => (
                                    <div key={termIndex}>
                                        <h4>
                                            {term}
                                            <button onClick={() => deleteInclusionCriteria(index, termIndex)}>X</button>
                                        </h4>
                                    </div>
                                )))}
                            </div>
                            </div>
                        )))}
                    </div>
                )}
                
                <button onClick={clearInclusion}>Clear Inclusion Criteria</button>
            </div>
            {/* EXCLUSION */}
            <div>
                <h3>Exclusion Criteria</h3>
                <button onClick={addExclusionSection}>Add Exclusion Section (i.e. Population, Intervention...)</button>
                {exclusionSections.length === 0 && <p>No Exclusion sections set.</p>}

                {exclusionSections && exclusionSections.length > 0 && (
                    <div className="criteria-section">
                        {(exclusionSections.map((section, index) => (
                            <div key={index}>
                                <h4>
                                    {section.category}
                                    <button onClick={() => deleteExclusionSection(index)}>X</button>
                                </h4>

                                <button onClick={() => addExclusionCriteria(index)}>Add Term</button>
                                
                                {section.criteria.length === 0 && (
                                    <p>No terms for Exclusion added.</p>
                                )}

                            <div className="inclusion-exclusion-criteria">
                                {(section.criteria.map((term, termIndex) => (
                                    <div key={termIndex}>
                                        <h4>
                                            {term}
                                            <button onClick={() => deleteExclusionCriteria(index, termIndex)}>X</button>
                                        </h4>
                                    </div>
                                )))}
                            </div>
                            </div>
                        )))}
                    </div>
                )}
                
                <button onClick={clearExclusion}>Clear Exclusion Criteria</button>
            </div>
            </div>

        <br />
        <hr />

            {/* FULL TEXT */}
            <div>
                <h3>Full Text Exclusion Criteria</h3>
                <button onClick={addFullTextReason}>Add Full Text Exclusion Reason (i.e. primary study, unavailable, incorrect population...)</button>
                {fullTextReasons.length === 0 && <p>No criteria set.</p>}

                    {(fullTextReasons.map((term, index) => (
                        <div key={index}>
                            <h4>
                                {term}
                                <button onClick={() => deleteFullTextReason(index)}>X</button>
                            </h4>
                        </div>
                    )))}
                
                <button onClick={clearFullTextReasons}>Clear Full Text Criteria</button>
            </div>

            <hr />
        </>
    );
}