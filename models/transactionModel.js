var db = require('../utils/db');
var moment = require('moment');
module.exports = {
    getTransactionForEmpployer: (id, id_status, id_job) => {
        let sqlQuery = `
        select tr.*, u2.fullname as employee, a.id_job, a.start, a.end, j.deadline, j.start_date, j.end_date
        from transactions as tr, users as u2, applicants as a, (select jo.*, jp.deadline, jt.start_date, jt.end_date from ((jobs as jo left join jobs_production as jp on jo.id_job = jp.id_job) left join jobs_temporal as jt on jo.id_job = jt.id_job)) as j, jobs_time as jti
        where a.id_job = j.id_job and a.id_job like '%${id_job}%' and j.employer = ${id} and a.id_applicant = tr.id_applicant and a.id_user = u2.id_user and tr.status = ${id_status} and jti.id_job = a.id_job order by a.id_applicant desc;`
        return db.query(sqlQuery);
    },
    getTransactionForEmployee: (id_user, id_status, id_job) => {
        let sqlQuery = `
        select tr.*, u1.fullname as employer, a.id_job, a.start, a.end, j.deadline, j.start_date, j.end_date
        from transactions as tr, users as u1, applicants as a, (select jo.*, jp.deadline, jt.start_date, jt.end_date from ((jobs as jo left join jobs_production as jp on jo.id_job = jp.id_job) left join jobs_temporal as jt on jo.id_job = jt.id_job)) as j
        where a.id_job = j.id_job and a.id_job like '%${id_job}%' and j.employer = u1.id_user and a.id_applicant = tr.id_applicant and tr.status = ${id_status} and a.id_user = ${id_user} order by a.id_applicant desc;`
        console.log(sqlQuery);
        return db.query(sqlQuery);
    },
    getTransactionByIdTransaction: (id_transaction)=>{
        let sql= `select * from transactions where id_transaction = ${id_transaction}`
        return db.query(sql);
    },
    getPayment: (data) => { // thay đổi trạng thái thành đã nhận thanh toán xong
        let today = new Date();
        let todayString = moment().format('YYYY-MM-DD, h:mm:ss a');
        let sqlQuery = `
        update transactions set status = 1, paid_date = '${todayString}',refund=${data.refundPercentage},messageNotice='${data.reason}' where id_transaction = ${data.id_transaction}
        `
        return db.query(sqlQuery);
    },    
}