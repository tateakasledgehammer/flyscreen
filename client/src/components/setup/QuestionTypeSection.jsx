export default function QuestionTypeSection({ 
    background, 
    setBackground, 
    saveBackgroundInfo
 }) {
    return (
        <div>
            <h3>Question Type</h3>
            <select
                value={background.question_type} 
                id="question-type"
                onChange={(e) => 
                    setBackground(prev => ({ ...prev, question_type: e.target.value }))
                }
                onBlur={saveBackgroundInfo}
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