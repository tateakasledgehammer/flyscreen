export default function ResearchAreaSection({ backgroundInformationForReview, setBackgroundInformationForReview }) {
    return (
        <div>
            <h3>Area of Research</h3>
            <select 
                onChange={(e) => 
                    setBackgroundInformationForReview({
                        ...backgroundInformationForReview, 
                        researchArea: e.target.value
                    })
                }
                value={backgroundInformationForReview.researchArea} 
                id="research-area"
                    >
                    <option value="">Set research area</option>
                    <option value="arts">Arts & Humanities</option>
                    <option value="food-and-animals">Agriculture, Veterinary & Food sciences</option>
                    <option value="bio-and-chem">Biological & Chemical Sciences</option>
                    <option value="environmental">Environmental Sciences</option>
                    <option value="business-and-economic">Economic, Business & Social Sciences</option>
                    <option value="education">Education</option>
                    <option value="stem">Engineering, Maths, Physics & Technology</option>
                    <option value="medical-and-health">Medical & Health Science</option>
                    <option value="psychology">Psychology</option>
                    <option value="other">Other</option>
            </select>
        </div>
    )
}