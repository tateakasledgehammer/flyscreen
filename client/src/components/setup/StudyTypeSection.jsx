export default function StudyTypeSection({ backgroundInformationForReview, setBackgroundInformationForReview }) {
    return (
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
    )
}

