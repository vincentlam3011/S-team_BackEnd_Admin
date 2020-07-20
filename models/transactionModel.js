var db = require('../utils/db');
var moment = require('moment');
module.exports = {
    getTransactionForEmpployer: (id, id_status, id_job) => {
        let sqlQuery = '';
        if(id_status === 0) { // giao dịch bình thường
            sqlQuery = `
            select tr.*, u2.fullname as employee, a.id_job, a.start, a.end, j.deadline, j.start_date, j.end_date
            from transactions as tr, users as u2, applicants as a, (select jo.*, jp.deadline, jt.start_date, jt.end_date from ((jobs as jo left join jobs_production as jp on jo.id_job = jp.id_job) left join jobs_temporal as jt on jo.id_job = jt.id_job)) as j
            where a.id_job = j.id_job and a.id_job like '%${id_job}%' and j.employer = ${id} and a.id_applicant = tr.id_applicant and a.id_user = u2.id_user and (tr.status = 0 or tr.status = 1) order by a.id_applicant desc;`
        }
        else { // giao dịch có hoàn tiền
            sqlQuery = `
            select tr.*, u2.fullname as employee, a.id_job, a.start, a.end, j.deadline, j.start_date, j.end_date
            from transactions as tr, users as u2, applicants as a, (select jo.*, jp.deadline, jt.start_date, jt.end_date from ((jobs as jo left join jobs_production as jp on jo.id_job = jp.id_job) left join jobs_temporal as jt on jo.id_job = jt.id_job)) as j
            where a.id_job = j.id_job and a.id_job like '%${id_job}%' and j.employer = ${id} and a.id_applicant = tr.id_applicant and a.id_user = u2.id_user and (tr.status = 2 or tr.status = 3) order by a.id_applicant desc;`
        }
        return db.query(sqlQuery);
    },
    getTransactionForEmployee: (id_user, id_status, id_job) => {
        let sqlQuery = '';
        if(id_status === 0) { // giao dịch bình thường
            sqlQuery = `
            select tr.*, u1.fullname as employer, a.id_job, a.start, a.end, j.deadline, j.start_date, j.end_date
            from transactions as tr, users as u1, applicants as a, (select jo.*, jp.deadline, jt.start_date, jt.end_date from ((jobs as jo left join jobs_production as jp on jo.id_job = jp.id_job) left join jobs_temporal as jt on jo.id_job = jt.id_job)) as j
            where a.id_job = j.id_job and a.id_job like '%${id_job}%' and j.employer = u1.id_user and a.id_applicant = tr.id_applicant and (tr.status = 0 or tr.status = 2) and a.id_user = ${id_user} order by a.id_applicant desc;`
        }
        else { // giao dịch có hoàn tiền
            sqlQuery = `
            select tr.*, u1.fullname as employer, a.id_job, a.start, a.end, j.deadline, j.start_date, j.end_date
            from transactions as tr, users as u1, applicants as a, (select jo.*, jp.deadline, jt.start_date, jt.end_date from ((jobs as jo left join jobs_production as jp on jo.id_job = jp.id_job) left join jobs_temporal as jt on jo.id_job = jt.id_job)) as j
            where a.id_job = j.id_job and a.id_job like '%${id_job}%' and j.employer = u1.id_user and a.id_applicant = tr.id_applicant and (tr.status = 1 or tr.status = 3) and a.id_user = ${id_user} order by a.id_applicant desc;`
        }
        
        return db.query(sqlQuery);
    },
    getTransactionByIdTransaction: (id_transaction)=>{
        let sql= `select * from transactions where id_transaction = ${id_transaction}`
        return db.query(sql);
    },
    getPayment: (id_transaction) => { // thay đổi trạng thái thành đã nhận thanh toán xong
        let today = new Date();
        let todayString = moment().format('YYYY-MM-DD, h:mm:ss a');
        let sqlQuery = `
        update transactions set status = 1, paid_date = '${todayString}' where id_transaction = ${id_transaction}
        `
        return db.query(sqlQuery);
    },
    getRefund: (id_applicant, id_report, id_transaction, amount, refundPercentage, reason) => { // cập nhật lại số tiền mà người làm có thể nhận
        let finalAmount = amount * (100 - refundPercentage) / 100;
        let sqlQuery = `
        update transactions set refund = ${refundPercentage}, messageNotice = '${reason}', status = 2 where id_transaction = ${id_transaction};
        select u.email, u.fullname, employer.email as employer_email j.title from users as u, users as employer, jobs as j, applicants as a where a.id_applicant = ${id_applicant} and a.id_user = u.id_user and a.id_job = j.id_job and j.employer = employer.id_user;
        update reports set status = 1, solution = 'Hoàn tiền ${refundPercentage}%' where id_report = ${id_report};
        update applicants set id_status = 0 where id_applicant = ${id_applicant};
        delete from accepted where id_applicant = ${id_applicant};
        `
        return db.query(sqlQuery);
    } 
}