export default function ReviewTitleSection({ backgroundInformationForReview, setBackgroundInformationForReview }) {
    return (
        <div>
            <h3>Review Name</h3>
            <input 
                type="text" 
                value={backgroundInformationForReview.title} 
                placeholder="Provide the title of your review..." 
                id="review-title"
                onChange={(e) => 
                    setBackgroundInformationForReview({
                        ...backgroundInformationForReview, 
                        title: e.target.value
                    })
                }
            />
        </div>
    )
}