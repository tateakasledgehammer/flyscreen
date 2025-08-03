const risData = 
`
TY  - JOUR
T1  - What do you know about ADHD?: A comparison between mainstream and special education teachers
KW  - Attention-deficit hyperactivity disorder
KW  - Mainstreaming in education
KW  - Research--Methodology
KW  - Special education teachers--Attitudes
KW  - Special education teachers--In-service training
KW  - Israel
LA  - English
AN  - informit.T2025020600015600171823033
PB  - Edith Cowan University, School of Education
CY  - Perth
SN  - 1835-517X
UR  - https://search.informit.org/doi/10.3316/informit.T2025020600015600171823033
Y1  - 2024/12/01
PY  - 2024
Y2  - 2025/04/03
L1  - https://search.informit.org/doi/pdf/10.3316/informit.T2025020600015600171823033
L2  - https://search.informit.org/doi/full/10.3316/informit.T2025020600015600171823033
N2  - This study investigates the knowledge and attitudes toward Attention-deficit/hyperactivity disorder (ADHD) among a large cohort of mainstream and special education in-service teachers in Israel. Given the pivotal role of teachers in identifying and managing ADHD symptoms within the classroom, it is crucial to ensure they possess adequate knowledge and positive attitudes toward the disorder. Previous studies have indicated a gap in knowledge and attitudes between mainstream and special education teachers, often influenced by factors such as teacher training, personal experience, and demographic characteristics. This study addresses these gaps by utilizing the well-validated ASKAT questionnaire to provide a comprehensive assessment of teachers’ knowledge and attitudes toward ADHD. A total of 538 teachers participated, including 288 mainstream and 250 special education teachers. Results indicated that special education teachers demonstrated higher levels of knowledge and more positive attitudes toward ADHD compared to their mainstream counterparts. A significant positive correlation was found between knowledge and attitudes among mainstream teachers, but not among special education teachers. Additionally, demographic factors such as gender, age, and current teaching experience with ADHD students were significant predictors of teachers’ knowledge and attitudes. The findings highlight the need for targeted professional development programs to enhance ADHD-related knowledge and attitudes, particularly for mainstream teachers. By identifying specific areas where mainstream teachers May lack knowledge or hold less positive attitudes, this research can inform the design of effective interventions. Ultimately, this study underscores the importance of ongoing teacher training to foster more inclusive and supportive educational environments for students with ADHD.
AU  - Sigal, Eden
AU  - Sukenik, Nufar
AD  - Bar Ilan University
AD  - Bar Ilan University
T2  - Australian Journal of Teacher Education (Online)
VL  - 49
IS  - 12
JF  - Australian Journal of Teacher Education (Online)
M3  - Journal Article
SP  - 19
EP  - 41
DP  - Informit
ER  - 
TY  - JOUR
T1  - The pagan ecstatic: The life, music and poetry of Sir Arnold Bax
KW  - Composers
KW  - Music--Influence
KW  - Music--Social aspects
KW  - Poetry--Themes, motives
KW  - Australia
LA  - English
AN  - informit.T2024070100007090094191129
PB  - Quadrant Magazine Limited
CY  - Balmain, N.S.W.
SN  - 0033-5002
UR  - https://search.informit.org/doi/10.3316/informit.T2024070100007090094191129
Y1  - 2024/07/01
PY  - 2024
Y2  - 2025/04/03
L1  - https://search.informit.org/doi/pdf/10.3316/informit.T2024070100007090094191129
L2  - https://search.informit.org/doi/full/10.3316/informit.T2024070100007090094191129
N2  - Readers may recall that the inaugural pages of Quadrant Music, which enjoyed their publication exactly twelve months ago, made reference to an “impulsive young composer”. The fellow in question would later become a Knight Commander of the Royal Victorian Order and the Master of the King’s (then Queen’s) Music-though these were appointments that he found to be more of a discomfort than anything else. To some, he was known as Dermot O’Byrne, a contributor to the Irish Review and, through his poetry, a proponent of Irish republicanism. He was a man of both limit- less passion and subtlety, bathed in Celtic twilight. In appearance, he presented as a dashing English gentleman; in character, he was ticklishly reticent. Eric Coates described him as “a kindly, lovable companion person, tolerant of others and loyal to his friends”. Of himself, in his own words, Bax said: I can’t help being (fundamentally) a very primitive being. I believe in conditions of ecstasy-physical or spiritual-and I get nothing from anything else. I think all the composers who appeal to me-Beethoven, Wagner, Delius, Sibelius-were primitive in that they believed that the secret of the universe was to be solved by ecstatic intuition rather than by thought.
AU  - Voltz, Alexander
AU  - Spurr, Barry
AD  - Composer and Quadrant’s Music Editor, email: alexandervoltz@quadrant.org.au
AD  - Quadrant’s Literary Editor
T2  - Quadrant
VL  - 68
IS  - 7/8
JF  - Quadrant
M3  - Journal Article
SP  - 101
EP  - 110
DP  - Informit
ER  - 
`

function parseRIS(risData) {
    // breaks it down
    const lines = risData.split(/\r?\n/);

    // holds on to the entries
    const records = []; 

    // holds one of the entries
    let entry = {};
    // skip empty lines
    for (let line of lines) {
        if (line.trim() === '') continue; 

        // extract tags (AU, TI, etc.) and the value
        const tag = line.slice(0, 2); 
        const value = line.slice(6).trim(); 

    // TY is the start of a new, so checks to push the value to records then resets
    if (tag === 'TY') {
        entry = { TY: value }; 
    }  else if (tag === 'ER') {
        entry.status = 'unscreened';
        records.push(entry);
        entry = {};
    } else {
        if (!entry[tag]) {
            entry[tag] = [];
        }
        entry[tag].push(value);
        }
    }
};