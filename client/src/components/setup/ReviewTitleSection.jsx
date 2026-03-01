export default function ReviewTitleSection({ 
    background, 
    setBackground, 
    saveBackgroundInfo 
}) {
    return (
        <div>
            <h3>Review Name</h3>
            <input 
                type="text" 
                value={background.title} 
                placeholder="Provide the title of your review..." 
                id="review-title"
                onChange={(e) => 
                    setBackground(prev => ({ ...prev, title: e.target.value }))
                }
                onBlur={saveBackgroundInfo}
            />
        </div>
    )
}