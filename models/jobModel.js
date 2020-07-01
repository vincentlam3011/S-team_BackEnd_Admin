var db = require('../utils/db');
var convertBlobB64 = require('../middleware/convertBlobB64');
module.exports = {
    getJobsList: (queryArr, multipleTags, queryName, queryTitle) => {
        let query = '', count = 0, tags = '';

        for (let e of queryArr) {
            if (count !== 0) {
                query += ' and';
            }
            query += e;
            count++;
        }

        if (queryName.length > 0) {
            if (count !== 0) {
                query += ' and';
            }

            if (queryName.length > 3) {
                let queryEmployerCount = queryName.trim().split(/\s+/).length || 0;
                query += ` j.employer = u.id_user and match(u.fullname) against('${queryName}') > ${queryEmployerCount / 2} `;
            }
            else {
                query += ` j.employer = u.id_user and u.fullname LIKE '%${queryName}%' `;
            }

            count++;
        }

        if (queryTitle.length > 0) {
            if (count !== 0) {
                query += ' and';
            }

            if (queryTitle.length > 3) {
                let queryTitleCount = queryTitle.trim().split(/\s+/).length || 0;
                query += ` round(match(j.title) against('${queryTitle}')) > ${queryTitleCount / 2} `;
            }
            else {
                query += ` j.title LIKE '%${queryTitle}%' `;
            }

            count++;
        }

        let today = new Date();
        let todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        let finalQuery = `
        select j.*, t.name as topic_name, p.name as province, d.name as district
        from jobs as j , users as u, provinces as p, districts as d, job_topics as t        
        ${count > 0 ? ('where ' + query + ' and t.id_jobtopic = j.job_topic and j.area_province = p.id_province and j.area_district = d.id_district') : 'where t.id_jobtopic = j.job_topic and j.area_province = p.id_province and j.area_district = d.id_district'}
        group by j.id_job order by j.id_job asc`;
        return db.query(finalQuery);
    },
    getJobById: (id) => {
        let query1 = `select  distinct  j.*,p.name as province_name, d.name as district_name, job_topics.name as topic_name, u.fullname as name_employer,u.email,u.dial,jt.id_tag,t.name as tag_name, t.status as tag_status, s.name as name_status,  jtp.start_date,jtp.end_date,jtp.salary_type,jp.deadline
            from jobs as j 
            left join jobs_tags as jt
            on  j.id_job= jt.id_job
            left join tags as t on t.id_tag = jt.id_tag
			left join jobs_production as jp on jp.id_job = j.id_job
			left join jobs_temporal as jtp on jtp.id_job = j.id_job,
            statuses as s,users as u, provinces as p, districts as d, job_topics
            where j.id_job=${id} and s.id_status = j.id_status and u.id_user=j.employer and j.area_province = p.id_province and j.area_district = d.id_district and j.job_topic = job_topics.id_jobtopic;`

        let query2 = `select  distinct  j.id_job,jri.img
            from jobs as j 
            left join job_related_images as jri
            on  j.id_job= jri.id_job
            where j.id_job=${id};`

        return db.query(query1 + ` ` + query2)
    },
    getJobsListByEmployer: (id, queryName, status) => {

        let query = `select j.*,t.name as topic_name, p.name as province, d.name as district
                    from jobs as j, users as u, provinces as p, districts as d, job_topics as t
                    where j.job_topic = t.id_jobtopic and j.area_province = p.id_province and j.area_district = d.id_district and j.employer = u.id_user and u.id_user = ${id} `;
        if (status >= -1 && status <= 4) {
            query += ` and j.id_status = ${status} `;
        }

        if (queryName.length > 0) {
            if (queryName.length > 3) {
                let queryNameCount = queryName.trim().split(/\s+/).length || 0;
                query += ` and round(match(j.title) against('${queryName}')) > ${queryNameCount / 2} `
            } else {
                query += ` and j.title like '%${queryName}%' `
            }
        }

        query += `order by j.id_job asc;`
        return db.query(query);
    },
    getJobsListByApplicant: (id, queryName, status, isFulltext, wordsCount) => {
        let query = `select j.*, t.name as topic_name, p.name as province, d.name as district
                    from jobs as j, job_topics as t, users as u, provinces as p, districts as d, applicants as a
                    where j.job_topic = t.id_jobtopic and j.area_province = p.id_province and j.area_district = d.id_district and j.id_job = a.id_job and a.id_user = u.id_user and u.id_user = ${id} `;

        if (status >= -1 && status <= 4) {
            query += ` and j.id_status = ${status} `;
        }

        if (queryName.length > 0) {
            if (queryName.length > 3) {
                let queryNameCount = queryName.trim().split(/\s+/).length || 0;
                query += ` and round(match(j.title) against('${queryName}')) > ${queryNameCount / 2} `
            } else {
                query += ` and j.title like '%${queryName}%' `
            }
        }

        query += `order by j.id_job asc;`
        return db.query(query);
    },
    setJobStatus: (id, status) => {
        return db.query(`update jobs set id_status = ${status} where id_job = ${id}`);
    },
    deleteJobById: (id) => {
        return db.query(`delete from jobs where id_job = ${id}`);
    },
    getJobStatuses: () => {
        return db.query(`select * from statuses;`);
    },
    getJobStatusById: (id) => {
        return db.query(`select id_status from jobs where id_job = ${id};`);
    }
}