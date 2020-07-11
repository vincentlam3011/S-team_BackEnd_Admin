var db = require('../utils/db');

module.exports = {
    getReportsList:(status, queryName) => {
        let queryNameCount = queryName.trim().split(/\s+/).length || 0;
        let queryNameText = '';
        if(queryName.length > 3) {
            queryNameText = ` round(match(u1.fullname) against('${queryName}')) > ${queryNameCount/2} `;
        }
        else {
            queryNameText = ` u1.fullname like '%${queryName}%' `;
        }

        if(queryName === '' && status === 3) {
            return db.query(`select r.*, u1.fullname as user1_name, u2.fullname as user2_name from reports as r, users as u1, users as u2 where u1.id_user = r.id_user1 and u2.id_user = r.id_user2 and r.type = 0 order by report_date desc`);
        }
        else if(status === 3 && queryName !== '') {
            return db.query(`select r.*, u1.fullname as user1_name, u2.fullname as user2_name from reports as r, users as u1, users as u2 where ${queryNameText} and u1.id_user = r.id_user1 and u2.id_user = r.id_user2 and r.type = 0 order by report_date desc`)
        }
        else if(status !== 3 && queryName === '') {
            return db.query(`select r.*, u1.fullname as user1_name, u2.fullname as user2_name from reports as r, users as u1, users as u2 where r.status = ${status} and u1.id_user = r.id_user1 and u2.id_user = r.id_user2 and r.type = 0 order by report_date desc`)
        }
        else {
            return db.query(`select r.*, u1.fullname as user1_name, u2.fullname as user2_name from reports as r, users as u1, users as u2 where ${queryNameText} and u1.id_user = r.id_user1 and u2.id_user = r.id_user2 and r.status = ${status} and r.type = 0 order by report_date desc`)
        }
    },
    setReportStatus: (id_report, status, solution) => {
        if(status === 0) {
            return db.query(`update reports set status = 0, solution = null where type = 0 and id_report = ${id_report}`)
        }
        else if(status === 1) {
            return db.query(`
            update reports set status = 1, solution = N'${solution}' where type = 0 and id_report = ${id_report};
            select j.title, u1.email, u2.fullname from users as u1, users as u2, jobs as j, reports as r where r.id_report = ${id_report} and r.id_job = j.id_job and j.employer = u1.id_user and r.id_user2 = u2.id_user;
            `)
        }
        else {
            // donothing
            return ;
        }
    },
    getJobReportsList:(status, queryName) => {
        let queryNameCount = queryName.trim().split(/\s+/).length || 0;
        let queryNameText = '';
        if(queryName.length > 3) {
            queryNameText = ` round(match(u1.fullname) against('${queryName}')) > ${queryNameCount/2} `;
        }
        else {
            queryNameText = ` u1.fullname like '%${queryName}%' `;
        }

        let sqlQuery = '';
        if(queryName === '' && status === 3) {
            sqlQuery = `select r.*, u1.fullname as user1_name, u2.fullname as user2_name, tr.id_transaction, tr.amount from reports as r, users as u1, users as u2, transactions as tr where u1.id_user = r.id_user1 and u2.id_user = r.id_user2 and r.type = 1 and r.id_applicant = tr.id_applicant order by report_date desc`;
        }
        else if(status === 3 && queryName !== '') {
            sqlQuery = `select r.*, u1.fullname as user1_name, u2.fullname as user2_name, tr.id_transaction, tr.amount from reports as r, users as u1, users as u2, transactions as tr where ${queryNameText} and u1.id_user = r.id_user1 and u2.id_user = r.id_user2 and r.type = 1 and r.id_applicant = tr.id_applicant order by report_date desc`;
        }
        else if(status !== 3 && queryName === '') {
            sqlQuery = `select r.*, u1.fullname as user1_name, u2.fullname as user2_name, tr.id_transaction, tr.amount from reports as r, users as u1, users as u2, transactions as tr where r.status = ${status} and u1.id_user = r.id_user1 and u2.id_user = r.id_user2 and r.type = 1 and r.id_applicant = tr.id_applicant order by report_date desc`;
        }
        else {
            sqlQuery = `select r.*, u1.fullname as user1_name, u2.fullname as user2_name, tr.id_transaction, tr.amount from reports as r, users as u1, users as u2, transactions as tr where ${queryNameText} and u1.id_user = r.id_user1 and u2.id_user = r.id_user2 and r.status = ${status} and r.type = 1 and r.id_applicant = tr.id_applicant order by report_date desc`;
        }
        console.log(sqlQuery);
        return db.query(sqlQuery);
    },
    setJobReportStatus: (id_report, status, solution) => {
        if(status === 0) {
            return db.query(`update reports set status = 0, solution = null where type = 1 and id_report = ${id_report}`)
        }
        else if(status === 1) {
            return db.query(`
            update reports set status = 1, solution = N'${solution}' where type = 1 and id_report = ${id_report};
            select j.title, u.email from users as u, jobs as j, reports as r where r.id_report = ${id_report} and r.id_job = j.id_job and u.id_user = j.employer;
            `)
        }
        else {
            // donothing
            return ;
        }
    },
}