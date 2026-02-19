export default function TagSetupSection({ 
    studyTags,
    setStudyTags,
    newTagInput,
    setNewTagInput,
    handleNewTag,
    handleDeleteTag,
    handleClearTags
}) {
    return (
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
    )
}