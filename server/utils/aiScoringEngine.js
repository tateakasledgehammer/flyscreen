const OpenAI = require("openai");

module.exports = {
    async scoreStudiesAI(studies, criteria, project_background) {
        const openai = new OpenAI({ 
            apiKey: process.env.OPENAI_API_KEY 
        });

        const studyType = project_background?.study_type || "unspecified study type";
        const projectTitle = project_background?.title || "untitled project";
        const projectContext = project_background?.context || "currently missing further background info"

        const prompt = `
            You are assisting with ${studyType} 
            screening for the project ${projectTitle}.

            Background:
            ${projectContext}

            Task:
            1. Decide if the study matches the inclusion and exclusion criteria & context
            2. Give relevance score from 0 to 1
            3. Give a short explanation

            For each study, return:
            [
                {
                    "id": <study.id>,
                    "score": number,
                    "explanation": string
                }
            ]
            
            Studies:
            ${JSON.stringify(studies, null, 2)}

            Inclusion Criteria:
            ${JSON.stringify(criteria.inclusionCriteria, null, 2)}

            Exclusion Criteria:
            ${JSON.stringify(criteria.exclusionCriteria, null, 2)}

        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }]
        });

        const json = JSON.parse(response.choices[0].message.content);
        
        return json;
    }
}