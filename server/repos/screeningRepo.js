const { db, upsertScreening } = require("../db");

module.exports = {
    getVotesForStudyStage: db.prepare(`
        SELECT user_id, vote
        FROM screenings
        WHERE study_id = ? AND stage = ?    
    `),

    getAllScreenings: db.prepare(`
        SELECT study_id, stage, vote, user_id
        FROM screenings
    `),

    saveVote: (voteData) => {
        upsertScreening.run(voteData);
    },

    transactionalVote: (fn) => db.transaction(fn)
};