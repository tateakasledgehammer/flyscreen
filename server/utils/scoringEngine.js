module.exports = {
    scoreStudy(study, criteria) {
        if (!criteria) return { score: 0, explanation: "No criteria defined" };

        const text = `${study.title} ${study.abstract}`.toLowerCase();
        let score = 0;
        let explanation = [];

        for (const section of criteria.inclusionCriteria || []) {
            for (const term of section.criteria) {
                if (text.includes(term.toLowerCase())) {
                    score +=0.2;
                    explanation.push(`Matched inclusion term: ${term}`)
                }
            }
        }
        for (const section of criteria.exclusionCriteria || []) {
            for (const term of section.criteria) {
                if (text.includes(term.toLowerCase())) {
                    score -=0.3;
                    explanation.push(`Matched exclusion term: ${term}`)
                }
            }
        }

        if (score < 0) score = 0;
        
        return { 
            score, 
            explanation: explanation.join("; ") };
    }
}