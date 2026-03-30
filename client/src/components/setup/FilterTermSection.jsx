export default function FilterTermSection({ 
    filters,
    newFilter,
    setNewFilter,
    addFilter,
    deleteFilter
}) {
    return (
        <div>
            <h3>Define Filter Terms</h3>
            <p>
                Setting filter terms makes it easy for you and your team
                to quickly screen unrelated studies by identifying words
                that present several irrelevant articles. Creating a list
                that those in your team can reference is helpful to speed
                up the screening process!
            </p>
            <p>
                It is a good idea to delete terms once two users have used
                them and they are no longer needed.
            </p>
            
            <div>
                <input 
                    onChange={(e) => setNewFilter(e.target.value)}
                    value={newFilter}
                    placeholder="Enter your filter..." 
                    type="text" 
                >
                </input>
                {/* input gets added to tag list which gets added to list below */}
                <button onClick={addFilter}>Add Filter</button>

                <div className="criteria-section">
                    {(!filters || filters.length === 0) && <p>No filters set.</p>}

                    {filters && filters.length > 0 && (
                        <div className="inclusion-exclusion-criteria">
                            {filters.map(filter => (
                                <h4 key={filter.id}>
                                    {filter.name}
                                    <button onClick={() => deleteFilter(filter.id)}>X</button>
                                </h4>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}