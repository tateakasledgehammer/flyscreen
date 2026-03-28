const OpenAI = require("openai");

module.exports = {
    async scoreStudyAI(study, criteria, project_background) {
        const openai = new OpenAI({ 
            apiKey: process.env.OPENAI_API_KEY 
        });

        const studyType = project_background?.study_type || "unspecified study type";
        const projectTitle = project_background?.title || "untitled project";
        const projectContext = project_background?.context || "currently missing further background info"

        const prompt = `
            You are assisting with ${studyType} 
            screening for the project ${projectTitle}.

            Here is some information on the project, the background, context & aim:
            ${projectContext}

            Study:
            Title: ${study.title}
            Abstract: ${study.abstract}
            Keywords: ${study.keywords}
            Year: ${study.year}
            DOI: ${study.doi}

            Inclusion Criteria:
            ${JSON.stringify(criteria.inclusionCriteria, null, 2)}

            Exclusion Criteria:
            ${JSON.stringify(criteria.exclusionCriteria, null, 2)}

            Task:
            1. Decide if the study matches the inclusion criteria
            2. Decide if the study matches the exclusion criteria
            3. Give relevance from 0 to 1
            4. Give a short explanation

            Return JSON only:
            {
                "score": number,
                "explanation": string
            }
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }]
        });

        const json = JSON.parse(response.choices[0].message.content);
        
        console.log("API KEY LOADED?", process.env.OPENAI_API_KEY ? "LOADED" : "MISSING");

        return json;
    }
}