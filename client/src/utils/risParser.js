export function parseRIS(text) { 
    const lines = text.split(/\r?\n/);
    const studies = [];
    let current = null;

    const pushCurrent = () => {
        if (current) studies.push(current);
        current = {
            title: "",
            abstract: "",
            authors: [],
            year: null,
            type: "",
            journal: "",
            volume: "",
            issue: "",
            doi: "",
            link: "",
            keywords: [],
            language: ""
        };
    };

    for (let line of lines) {
        const tag = line.substring(0, 2);
        const value = line.substring(6).trim();
        
        switch (tag) {
            case "TY":
                pushCurrent();
                current.type = value;
                break;
            case "T1":
                current.title = value;
                break;
            case "AB":
                current.abstract = value;
                break;
            case "AU":
                current.authors.push(value);
                break;
            case "PY":
                current.year = Number(value);
                break;
            case "JO":
                current.journal = value;
                break;
            case "VL":
                current.volume = value;
                break;
            case "IS":
                current.issue = value;
                break;
            case "DO":
                current.doi = value;
                break;
            case "UR":
                current.link = value;
                break;
            case "KW":
                current.keywords.push(value);
                break;
            case "LA":
                current.language = value;
                break;
            case "ER":
                break;
        }
    }

    if (current) studies.push(current);
    return studies;
}

export function validateStudy(study) {
    const errors = [];

    // if (!study.title || study.title.trim().length === 0)
    //     errors.push("Missing title");

    // if (!study.year || isNaN(study.year))
    //     errors.push("Missing or invalid year");

    // if (!Array.isArray(study.authors) || study.authors.length === 0)
    //     errors.push("Missing authors");

    // if (!study.abstract || study.abstract.trim().length === 0)
    //     errors.push("Missing abstract");

    return errors;
}