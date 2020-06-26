var db = require('../utils/db');

module.exports = {
    getApplicantsByJobId: (id, id_status) => {
        let sqlQueryApplicants = `select u.id_user, u.fullname, u.email, u.dial, a.proposed_price, a.attachment, a.introduction_string from users as u, applicants as a, jobs as j
        where j.id_job = a.id_job and a.id_user = u.id_user and j.id_job = ${id} and a.id_status=${id_status} order by a.proposed_price asc;`
        return db.query(sqlQueryApplicants);
    },
}