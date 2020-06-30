var db = require('../utils/db');

module.exports = {
    getReportsList:(status, queryName) => {
        if(queryName === '' && status === 3) {
            return db.query(`select r.*, u1.fullname as user1_name, u2.fullname as user2_name from reports as r, users as u1, users as u2 where u1.id_user = r.id_user1 and u2.id_user = r.id_user2 order by report_date desc`);
        }
        else if(status === 3 && queryName !== '') {
            return db.query(`select r.*, u1.fullname as user1_name, u2.fullname as user2_name, match(u1.fullname) against('${queryName}') as fullnameRanking from reports as r, users as u1, users as u2 where match(u1.fullname) against('${queryName}') and u1.id_user = r.id_user1 and u2.id_user = r.id_user2 order by report_date desc`)
        }
        else if(status !== 3 && queryName === '') {
            return db.query(`select r.*, u1.fullname as user1_name, u2.fullname as user2_name from reports as r, users as u1, users as u2 where r.status = ${status} and u1.id_user = r.id_user1 and u2.id_user = r.id_user2 order by report_date desc`)
        }
        else {
            return db.query(`select r.*, u1.fullname as user1_name, u2.fullname as user2_name, match(u1.fullname) against('${queryName}') as fullnameRanking from reports as r, users as u1, users as u2 where match(u1.fullname) against('${queryName}') and u1.id_user = r.id_user1 and u2.id_user = r.id_user2 and r.status = ${status} order by report_date desc`)
        }
    },
    setReportStatus: (id_report, status, solution) => {
        if(status === 0) {
            return db.query(`update reports set status = 0, solution = null where id_report = ${id_report}`)
        }
        else if(status === 1) {
            return db.query(`update reports set status = 1, solution = N'${solution}' where id_report = ${id_report}`)
        }
        else {
            // donothing
            return ;
        }
    }
}