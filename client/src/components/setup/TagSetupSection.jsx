export default function TagSetupSection({ 
    tags,
    newTag,
    setNewTag,
    addTag,
    deleteTag
}) {
    return (
        <div>
            <h3>Define Tags</h3>
            <p>
                Tags will appear while you are screening and are 
                helpful for you to place into groups to check later - 
                whether it be to look into more, to inform another 
                piece of research, or provide valuable background 
                information.
            </p>
            
            <div>
                <input 
                    onChange={(e) => setNewTag(e.target.value)}
                    value={newTag}
                    placeholder="Enter your tag..." 
                    type="text" 
                >
                </input>
                {/* input gets added to tag list which gets added to list below */}
                <button onClick={addTag}>Add Tag</button>

                <div className="criteria-section">
                    {(!tags || tags.length === 0) && <p>No tags provided.</p>}

                    {tags && tags.length > 0 && (
                        <div className="inclusion-exclusion-criteria">
                            {(tags.map((tag, index) => (
                                <h4 key={index}>
                                    {tag.name}
                                    <button onClick={() => deleteTag(tag.id)}>X</button>
                                </h4>
                            )))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}