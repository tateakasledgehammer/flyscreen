export default function ReviewerSettingsSection({ 
    reviewerSettings, 
    setReviewerSettings, 
    saveReviewerSettings, 
 }) {
    return (
        <div>
            <h3>Reviewer Settings</h3>
            <p>Reviewers required for title & abstract screening</p>
            <select
                value={reviewerSettings.screening} 
                id="screener-no"
                onChange={(e) => 
                    setReviewerSettings(prev => ({ ...prev, screening: Number(e.target.value) }))
                }
                onBlur={saveReviewerSettings}
                >
                <option value={1}>1</option>
                <option value={2}>2</option>
            </select>

            <p>Reviewers required for full text screening</p>
            <select
                value={reviewerSettings.fulltext}
                id="full-text-screener-no"
                onChange={(e) => 
                    setReviewerSettings(prev => ({ ...prev, fulltext: Number(e.target.value) }))
                }
                onBlur={saveReviewerSettings}
                >
                <option value={1}>1</option>
                <option value={2}>2</option>
            </select>

            <p>Reviewers required for data extraction</p>
            <select
                value={reviewerSettings.extraction}
                id="data-extraction-screener-no"
                onChange={(e) => 
                    setReviewerSettings(prev => ({ ...prev, extraction: Number(e.target.value) }))
                }
                onBlur={saveReviewerSettings}
                >
                <option value={1}>1</option>
                <option value={2}>2</option>
            </select>

            <button id="invite-reviewer">Invite Reviewer</button>
            {/* Open modal to input email, name, send link to access, backend to update their authentication */}
            
            <div id="reviewerList"></div>
            {/* List of reviewers + their status */}
        </div>
 )
}