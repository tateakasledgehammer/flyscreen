import { useState, useEffect } from "react"

export default function Landing() {
    
    return (
        <div className="page-container">
            <h1>Welcome to...<br></br>FLYSCREEN ACADEMICS <i className="fa-regular fa-paper-plane"></i></h1>
            <div>
                <h3><i className="fa-solid fa-star-half-stroke"></i> Predictive scores to save you time</h3>
                    <p>Systematic reviews and the like typically take <strong>12 to 18 months</strong> to complete. This involves hours upon hours of valuable staff and student time on menial tasks such as screening studies in a search that are irrelevant to the topic and any learning. It is vital that this time gets reduced to <strong>increase staff productivity, student engagement, and allow all to contribute to global knowledge more effectively</strong></p>
                    <p>Flyscreen Academics gives you scores with each study that you screen to give you information on its relevance before you have even started reading.</p>
                <h3><i className="fa-solid fa-chart-bar"></i> Enhanced filtering process to help you work with your research</h3>
                    <p>Sort between all your tags, exclusion criteria, and key word searches to give you more control of your review.</p>
                <h3><i className="fa-solid fa-chart-line"></i> Streamlined process to get work done now</h3>
                    <p>Clear step by step process with intuitive design to help you get straight into the zone to get this over with!</p>
            </div>
        </div>
    )
}