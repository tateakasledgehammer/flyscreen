export default function ReviewerSettingsSection({ backgroundInformationForReview, setBackgroundInformationForReview }) {
    return (
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
 )
}