var db = require('../utils/db');

module.exports = {
    getBasicStats: () => {
        let avgAppPerJob = `select avg(APJ.a_count) as value from (select count(a.id_applicant) as a_count from jobs as j, applicants as a where j.id_job = a.id_job group by a.id_job) as APJ;`;
        let avgJobPerDay = `select avg(t1.count) as value from (select count(id_job) as count from jobs group by date(post_date)) as t1;`;
        let totalActiveUsers = `select count(id_user) as value from users where account_status > 0;`;
        let totalBusinessUsers = `select count(id_user) as value from users where isBusinessUser = 1 and account_status > 0;`;
        let avgNewUsersPerDay = `select avg(t1.count) as value from (select count(id_user) as count from users group by date(createDate)) as t1;`;
        return db.query(avgAppPerJob + avgJobPerDay + totalActiveUsers + totalBusinessUsers + avgNewUsersPerDay);
    },
    getPercentageStats: () => {
        /* % người được tuyển / người đăng ký */
        let totalApplicants = `select sum(t1.count) as value from (select id_job, count(id_applicant) as count from applicants group by id_job) as t1;`;
        let totalAcceptants = `select sum(t1.count) as value from (select id_job, count(id_applicant) as count from accepted group by id_job) as t1;`;

        /* % công việc theo phân loại */
        let totalJobs = `select count(id_job) as value from jobs;`;
        let totalTemporalJobs = `select count(id_job) as value from jobs where job_type = 0 group by job_type;`;

        /* % người làm đc đánh giá tốt */
        let totalFeedbacks = `select count(ac.id_applicant) as value from accepted as ac where ac.rating_fromEmployer is not null;`;
        let totalGoodFeedbacks = `select count(ac.id_applicant) as value from accepted as ac where ac.rating_fromEmployer is not null and ac.rating_fromEmployer >= 4;`;

        /* % người tuyển được đánh giá tốt */
        let totalFeedbacksForEmployer = `select count(t1.employer) as value from (select j.employer, avg(ac.rating_fromEmployee) as avgRating from jobs as j, accepted as ac where j.id_job = ac.id_job and ac.rating_fromEmployee is not null group by ac.id_job) as t1;`;
        let totalGoodFeedbacksForEmployer = `select count(t1.employer) as value from (select j.employer, avg(ac.rating_fromEmployee) as avgRating from jobs as j, accepted as ac where j.id_job = ac.id_job and ac.rating_fromEmployee is not null and ac.rating_fromEmployee >= 4 group by ac.id_job) as t1;`;

        /* % công việc hoàn thành */
        let totalCompletedJobs = `select count(id_job) as value from jobs where id_status = 3;`
        return db.query(totalApplicants + totalAcceptants + totalJobs + totalTemporalJobs + totalFeedbacks + totalGoodFeedbacks + totalFeedbacksForEmployer + totalGoodFeedbacksForEmployer + totalCompletedJobs);
    },
    getAnnualJobsChartData: () => {
        return db.query(`SELECT
        sum(case when MONTH(post_date) = 1 THEN 1 ELSE 0 END) AS 'Jan',
        sum(case when MONTH(post_date) = 2 THEN 1 ELSE 0 END) AS 'Feb',
        sum(case when MONTH(post_date) = 3 THEN 1 ELSE 0 END) AS 'Mar',
        sum(case when MONTH(post_date) = 4 THEN 1 ELSE 0 END) AS 'Apr',
        sum(case when MONTH(post_date) = 5 THEN 1 ELSE 0 END) AS 'May',
        sum(case when MONTH(post_date) = 6 THEN 1 ELSE 0 END) AS 'Jun',
        sum(case when MONTH(post_date) = 7 THEN 1 ELSE 0 END) AS 'Jul',
        sum(case when MONTH(post_date) = 8 THEN 1 ELSE 0 END) AS 'Aug',
        sum(case when MONTH(post_date) = 9 THEN 1 ELSE 0 END) AS 'Sep',
        sum(case when MONTH(post_date) = 10 THEN 1 ELSE 0 END) AS 'Oct',
        sum(case when MONTH(post_date) = 11 THEN 1 ELSE 0 END) AS 'Nov',
        sum(case when MONTH(post_date) = 12 THEN 1 ELSE 0 END) AS 'Dec'
        FROM jobs
        WHERE post_date BETWEEN Date_add(NOW(), interval - 12 month) AND  NOW();`);
    },
    getAnnualUsersChartData: () => {
        return db.query(`SELECT
        sum(case when MONTH(createDate) = 1 THEN 1 ELSE 0 END) AS 'Jan',
        sum(case when MONTH(createDate) = 2 THEN 1 ELSE 0 END) AS 'Feb',
        sum(case when MONTH(createDate) = 3 THEN 1 ELSE 0 END) AS 'Mar',
        sum(case when MONTH(createDate) = 4 THEN 1 ELSE 0 END) AS 'Apr',
        sum(case when MONTH(createDate) = 5 THEN 1 ELSE 0 END) AS 'May',
        sum(case when MONTH(createDate) = 6 THEN 1 ELSE 0 END) AS 'Jun',
        sum(case when MONTH(createDate) = 7 THEN 1 ELSE 0 END) AS 'Jul',
        sum(case when MONTH(createDate) = 8 THEN 1 ELSE 0 END) AS 'Aug',
        sum(case when MONTH(createDate) = 9 THEN 1 ELSE 0 END) AS 'Sep',
        sum(case when MONTH(createDate) = 10 THEN 1 ELSE 0 END) AS 'Oct',
        sum(case when MONTH(createDate) = 11 THEN 1 ELSE 0 END) AS 'Nov',
        sum(case when MONTH(createDate) = 12 THEN 1 ELSE 0 END) AS 'Dec'
        FROM users
        WHERE createDate BETWEEN Date_add(NOW(), interval - 12 month) AND  NOW();`)
    },
    getPendingReports: () => {
        return db.query(`select count(id_report) as value from reports where status = 0;`);
    }
}