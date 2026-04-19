export default function ReviewTitleSection({ 
    background, 
    setBackground, 
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
            />

            <br />
            <br />

            <h3>Background Information</h3>
            <p>
                Provide a few paragraphs of background information to
                <strong> help us help you</strong>. 
                Give us some information on the background, the aim, the 
                inclusion/exclusion criteria and the research context
            </p>
            <br />
            <textarea
                value={background.context}
                placeholder="The aim of this review is to ..."
                id="review-context"
                onChange={(e) => 
                    setBackground(prev => ({ ...prev, context: e.target.value }))
                }
                rows={10}
                style={{
                    width: "80%",
                    padding: "12px",
                    marginLeft: "20px",
                    fontFamily: "Arial",
                    fontSize: "1rem",
                    lineHeight: "1.5",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                    resize: "vertical",
                    boxSizing: "border-box"
                }}
            />
            <br />
            <br />
        </div>
    )
}