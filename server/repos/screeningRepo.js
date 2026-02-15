const { db, upsertScreening } = require("../db");

module.exports = {
    getVotesForStudyStage: db.prepare(`
        SELECT s.user_id, s.vote
        FROM screenings s
        JOIN studies st ON st.id = s.study_id
        WHERE study_id = ? AND stage = ? AND st.project_id = ?   
    `),

    getAllScreeningsForProject: db.prepare(`
        SELECT s.study_id, s.stage, s.vote, s.user_id
        FROM screenings s
        JOIN studies st ON st.id = s.study_id
        WHERE st.project_id = ?

    `),

    saveVote: (voteData) => {
        upsertScreening.run(voteData);
    },

    transactionalVote: (fn) => db.transaction(fn)
};