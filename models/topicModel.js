var db = require('../utils/db');

module.exports = {
    getJobTopics: () => {
        let selectQuery = `select * from job_topics order by count asc`;
        return db.query(selectQuery);
    },
    getJobTopicById: (id) => {
        return db.query(`select * from job_topics where id_jobtopic = ${id};`);
    },
    setTopicStatus: (id, status = 0) => {
        let resetTopicQuery = `update jobs set job_topic = 7 where job_topic = ${id};`;
        let deactTopicQuery = `update job_topics set status = ${status} where id_jobtopic = ${id};` // set count = 0 ?
        return db.query(resetTopicQuery + deactTopicQuery);   
    },
    updateJobTopic: (id) => {
        // return db.query(`update job_topics set name = '${}', img = x'${}'`)
    }
}