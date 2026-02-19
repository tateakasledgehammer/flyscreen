export default function QuestionTypeSection({ backgroundInformationForReview, setBackgroundInformationForReview }) {
    return (
        <div>
            <h3>Question Type</h3>
            <select
                onChange={(e) => 
                    setBackgroundInformationForReview({
                        ...backgroundInformationForReview, 
                        questionType: e.target.value
                    })
                }
                value={backgroundInformationForReview.questionType} 
                id="question-type"
                >
                    <option value="">Set question type</option>
                    <option value="intervention">Intervention / Treatment</option>
                    <option value="prevention">Prevention</option>
                    <option value="etiology">Etiology</option>
                    <option value="diagnosis">Diagnosis</option>
                    <option value="prognosis">Prognosis</option>
                    <option value="qualitative">Qualitative</option>
            </select>
        </div>
    )
}