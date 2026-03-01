export default function StudyTypeSection({ 
    background, 
    setBackground, 
    saveBackgroundInfo
 }) {
    return (
        <div>
        <h3>Study Type</h3>
        <select 
            value={background.study_type}
            id="study-type"
            onChange={(e) => 
                setBackground(prev => ({ ...prev, study_type: e.target.value }))
            }
            onBlur={saveBackgroundInfo}
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
    )
}

