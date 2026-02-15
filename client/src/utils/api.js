export async function fetchStudiesWithScores(projectId) {
    const res = await fetch(`http://localhost:5005/api/projects/${projectId}/studies-with-scores`, {
        credentials: "include"
    });
    return res.json();
}