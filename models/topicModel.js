var db = require('../utils/db');

module.exports = {
    getJobTopics: (queryName, status, isFulltext) => {
        if (!queryName.replace(/\s/g, '').length) {
            queryName = '';
        }
        let selectQuery = ``;
        if (isFulltext) {
            selectQuery = `select id_jobtopic, name, status, count from job_topics where match(name) against('${queryName}') `;
        } else {
            selectQuery = `select id_jobtopic, name, status, count from job_topics where name like '%${queryName}%' `;
        }
        if (status == 0 || status == 1) {
            selectQuery += `and status = ${status} `;
        }
        if (isFulltext) {
            selectQuery += `order by (match(name) against('${queryName}')) desc;`
        } else {
            selectQuery += `order by count asc;`
        }
        return db.query(selectQuery);
    },
    getJobTopicById: (id) => {
        return db.query(`select * from job_topics where id_jobtopic = ${id};`);
    },
    setTopicStatus: (id, status) => {
        let resetTopicQuery = `update jobs set job_topic = 7 where job_topic = ${id};`;
        let changeStatusQuery = `update job_topics set status = ${status} where id_jobtopic = ${id};` // set count = 0 ?
        if (status == 0)
            return db.query(resetTopicQuery + changeStatusQuery);
        else
            return db.query(changeStatusQuery);

    },
    updateJobTopic: (id, updates) => {
        let updateQuery = `update job_topics set `;
        let initQuery = updateQuery;
        for (let i = 0; i < updates.length; i++) {
            let field = updates[i].field;
            let value = updates[i].value;
            if (value !== null && value !== '') {
                if (field === 'img') {
                    updateQuery += `${field} = x'${value}'`;
                } else {
                    updateQuery += `${field} = '${value}'`;
                }
                if (i < updates.length - 1) {
                    updateQuery += ', ';
                } else {
                    updateQuery += ' ';
                }
            }
        }
        if (updateQuery === initQuery) {
            return db.query(`select 1;`);
        };
        updateQuery += `where id_jobtopic = ${id};`;
        return db.query(updateQuery);
    },
    addJobTopic: (topic) => {
        let colQuery = `insert into job_topics (name, img, count) `;

        let valQuery = '';

        if(topic.img) {
            valQuery = `values('${topic.name}', x'${topic.img}', 0);`;
        }
        else {
            valQuery = `values('${topic.name}', null, 0);`;
        }
        let query = colQuery + valQuery;
        return db.query(query);
    }
}