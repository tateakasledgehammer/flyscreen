module.exports = {
    scoreStudy(study,criteria) {
        if (!criteria) return { score: 0, explanation: "No criteria defined" };

        const text = `${study.title} ${study.abstract}`.toLowerCase();
        let score = 0;
        let explanation = [];

        const addMatches = (field, weight) => {
            if (!criteria[field]) return;
            const terms = criteria[field].toLowerCase().split(/[, ]+/);

            for (const t of terms) {
                if (t.length > 3 && text.includes(t)) {
                    score += weight;
                    explanation.push(`Matched ${field}: "${t}`);
                }
            }
        };

        addMatches("population", 0.2);
        addMatches("intervention", 0.3);
        addMatches("outcomes", 0.3);
        addMatches("study_design", 0.2);

        // Exclusion penalties
        if (criteria.exclusions) {
            const terms = criteria.exclusions.toLowerCase().split(/[, ]+/);

            for (const t of terms) {
                if (t.length > 3 && text.includes(t)) {
                    score += weight;
                    explanation.push(`Triggered exclusion: "${t}`);
                }
            }
        }

        score = Math.max(0, Math.min(1, score));

        return { score, explanation: explanation.join("; ") };
    }

}