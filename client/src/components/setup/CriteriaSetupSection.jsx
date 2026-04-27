import { useState } from "react";

export default function CriteriaSetupSection({ 
   inclusionSections,
   exclusionSections,
   setInclusionSections,
   setExclusionSections,
   fullTextReasons,
   setFullTextReasons,
}) {

    // useStates
    const [newInclusionSection, setNewInclusionSection] = useState("");
    const [newExclusionSection, setNewExclusionSection] = useState("");
    const [newFullTextReason, setNewFullTextReason] = useState("");

    const [newInclusionTerms, setNewInclusionTerms] = useState({});
    const [newExclusionTerms, setNewExclusionTerms] = useState({});

    // inclusion
    function addInclusionSection() {
        if (!newInclusionSection.trim()) return;

        setInclusionSections(prev => [
            ...prev,
            { category: newInclusionSection.trim(), criteria: [], type: "inclusion" }
        ]);

        setNewInclusionSection("");
    }

    function deleteInclusionSection(index) {
        setInclusionSections(prev => prev.filter((_, i) => i !== index));
    }

    function addInclusionCriteria(sectionIndex) {
        const term = newInclusionTerms[sectionIndex] ?? "";
        if (!term?.trim()) return;

        setInclusionSections(prev =>
            prev.map((section, i) =>
                i === sectionIndex
                    ? { ...section, criteria: [...section.criteria, term.trim()] }
                    : section
            )
        );

        setNewInclusionTerms(prev => ({ ...prev, [sectionIndex]: "" }));
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

    // exclusion
    function addExclusionSection() {
        if (!newExclusionSection.trim()) return;

        setExclusionSections(prev => [
            ...prev,
            { category: newExclusionSection.trim(), criteria: [], type: "exclusion" }
        ]);

        setNewExclusionSection("");
    }

    function deleteExclusionSection(index) {
        setExclusionSections(prev => prev.filter((_, i) => i !== index));
    }

    function addExclusionCriteria(sectionIndex) {
        const term = newExclusionTerms[sectionIndex] ?? "";
        if (!term?.trim()) return;

        setExclusionSections(prev =>
            prev.map((section, i) =>
                i === sectionIndex
                    ? { ...section, criteria: [...section.criteria, term.trim()] }
                    : section
            )
        );

        setNewExclusionTerms(prev => ({ ...prev, [sectionIndex]: "" }));
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
        if (!newFullTextReason?.trim()) return;

        setFullTextReasons(prev => [
            ...prev,
            newFullTextReason.trim()
        ]);

        setNewFullTextReason("");
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
            <p>
                The terms that you input below will show up highlighted 
                in green (inclusion) or red (exclusion) to help guide your 
                screening process (this can also be toggled off). You are 
                able to add your own subheadings for maximum customisability.
            </p>

            {/* INCLUSION */}
            <div>
                <br />
                <h3>Inclusion Criteria</h3>

                <div>
                    <input 
                        value={newInclusionSection}
                        onChange={e => setNewInclusionSection(e.target.value)}
                        placeholder="New section name (e.g. Population, Intervention ...)"
                        onKeyDown={e => e.key === "Enter" && addInclusionSection()}
                    />

                    <button onClick={addInclusionSection}>
                        Add Inclusion Section
                    </button>
                </div>

                {inclusionSections.length === 0 && <p>No inclusion sections set.</p>}

                {inclusionSections && inclusionSections.length > 0 && (
                    <div className="criteria-section">
                        {(inclusionSections.map((section, index) => (
                            <div key={index}>
                                <h4>
                                    {section.category}
                                    <button className="criteria-subheading" onClick={() => deleteInclusionSection(index)}>X</button>
                                </h4>

                                <div>
                                <input 
                                    value={newInclusionTerms[index] ?? ""}
                                    onChange={e => setNewInclusionTerms(prev => ({ ...prev, [index]: e.target.value }))}
                                    placeholder="New inclusion term"
                                    onKeyDown={e => e.key === "Enter" && addInclusionCriteria(index)}
                                />

                                <button className="criteria-subheading" onClick={() => addInclusionCriteria(index)}>
                                    Add Term
                                </button>

                                </div>
                                
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

            <br />
            <br />

            </div>

            {/* EXCLUSION */}
            <div>
                <h3>Exclusion Criteria</h3>

                <div>
                    <input 
                        value={newExclusionSection}
                        onChange={e => setNewExclusionSection(e.target.value)}
                        placeholder="New section name (e.g. Population, Intervention ...)"
                        onKeyDown={e => e.key === "Enter" && addExclusionSection()}
                    />

                    <button onClick={addExclusionSection}>
                        Add Exclusion Section
                    </button>
                </div>

                {exclusionSections.length === 0 && <p>No Exclusion sections set.</p>}

                {exclusionSections && exclusionSections.length > 0 && (
                    <div className="criteria-section">
                        {(exclusionSections.map((section, index) => (
                            <div key={index}>
                                <h4>
                                    {section.category}
                                    <button className="criteria-subheading" onClick={() => deleteExclusionSection(index)}>X</button>
                                </h4>

                                <div>
                                    <input 
                                        value={newExclusionTerms[index] ?? ""}
                                        onChange={e => setNewExclusionTerms(prev => ({ ...prev, [index]: e.target.value }))}
                                        placeholder="New exclusion term"
                                        onKeyDown={e => e.key === "Enter" && addExclusionCriteria(index)}
                                    />

                                    <button className="criteria-subheading" onClick={() => addExclusionCriteria(index)}>
                                        Add Term
                                    </button>
                                </div>
                                
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
        <br />

            {/* FULL TEXT */}
            <div>
                <h3>Full Text Exclusion Criteria</h3>

                <div>
                    <input 
                        value={newFullTextReason}
                        onChange={e => setNewFullTextReason(e.target.value)}
                        placeholder="New reason (e.g. secondary research, unavailable, incorrect population...)"
                        onKeyDown={e => e.key === "Enter" && addFullTextReason()}
                    />
                    <button onClick={addFullTextReason}>Add Reason</button>
                </div>

                <br />
                <br />

                {fullTextReasons.length === 0 && <p>No criteria set.</p>}

                <div className="inclusion-exclusion-criteria">
                    {(fullTextReasons.map((term, index) => (
                        <div key={index}>
                            <h4>
                                {term}
                                <button onClick={() => deleteFullTextReason(index)}>X</button>
                            </h4>
                        </div>
                    )))}
                </ div>
                
                <br />
                <button onClick={clearFullTextReasons}>Clear Full Text Criteria</button>
            </div>
        
        <br />

            <hr />
        </>
    );
}