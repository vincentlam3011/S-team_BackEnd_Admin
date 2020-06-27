var db = require('../utils/db');
var convertBlobB64 = require('../middleware/convertBlobB64');
module.exports = {
    getJobsList: (queryArr, multipleTags) => {
        let query = '', count = 0, tags = '';

        for (let e of queryArr) {
            if (count !== 0) {
                query += ' and';
            }
            query += ` j.${e.field} ${e.text}`;
            count++;
        }

        if (multipleTags.length > 0) {
            tags += multipleTags[0];
            multipleTags.forEach((e, i) => {
                if (i !== 0) {
                    tags += `, ${e}`;
                }
            })
        }
        let today = new Date();
        let todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        let finalQuery = `
        select j.*, jri.img, jt.id_tag, job_topics.name as topic_name, t.name as tag_name, t.status as tag_status, p.name as province, d.name as district${multipleTags.length > 0 ? ', matches.relevance as relevance' : ''}
        from (((jobs as j left join job_related_images as jri on j.id_job = jri.id_job) left join jobs_tags as jt on j.id_job = jt.id_job) left join tags as t on t.id_tag = jt.id_tag), users as u, provinces as p, districts as d, job_topics
        ${multipleTags.length > 0 ? ',(SELECT j2.id_job as id,count(j2.id_job) as relevance FROM jobs as j2, jobs_tags as jt2 WHERE j2.id_job = jt2.id_job AND jt2.id_tag IN (' + tags + ') GROUP BY j2.id_job) AS matches' : ''}
        ${queryArr.length > 0 ? ('where ' + query + ' and j.area_province = p.id_province and j.area_district = d.id_district and j.job_topic = job_topics.id_jobtopic') : 'where j.area_province = p.id_province and j.area_district = d.id_district and j.job_topic = job_topics.id_jobtopic'} ${multipleTags.length > 0 ? ' and matches.id = j.id_job' : ''}
        group by j.id_job, jt.id_tag order by j.id_job asc`;
        // console.log(finalQuery);
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

        return db.query(query1 + ` ` + query2 )
    },
    getJobsListByEmployer: (id, queryName, status) => {
        if (!queryName.replace(/\s/g, '').length) {
            queryName = '';
        }
        let query = `select j.*, jri.img, jt.id_tag, t.name as tag_name, t.status as tag_status, p.name as province, d.name as district
                    from (((jobs as j left join job_related_images as jri on j.id_job = jri.id_job) left join jobs_tags as jt on j.id_job = jt.id_job) left join tags as t on t.id_tag = jt.id_tag), users as 
                    u, provinces as p, districts as d
                    where j.area_province = p.id_province and j.area_district = d.id_district and j.employer = u.id_user and u.id_user = ${id} and j.title like '%${queryName}%' `;
        if (status >= -1 && status <= 4) {
            query += ` and j.id_status = ${status} `;
        }
        query += `group by j.id_job, jt.id_tag order by j.id_job asc;`
        return db.query(query);
    },
    getJobsListByApplicant: (id, queryName, status) => {
        if (!queryName.replace(/\s/g, '').length) {
            queryName = '';
        }
        let query = `select j.*, jri.img, jt.id_tag, t.name as tag_name, t.status as tag_status, p.name as province, d.name as district
                    from (((jobs as j left join job_related_images as jri on j.id_job = jri.id_job) left join jobs_tags as jt on j.id_job = jt.id_job) left join tags as t on t.id_tag = jt.id_tag), users as 
                    u, provinces as p, districts as d, applicants as a
                    where j.area_province = p.id_province and j.area_district = d.id_district and j.id_job = a.id_job and a.id_user = u.id_user and u.id_user = ${id} and j.title like '%${queryName}%' `;
        if (status >= -1 && status <= 4) {
            query += ` and j.id_status = ${status} `;
        }
        query += `group by j.id_job, jt.id_tag order by j.id_job asc;`
        return db.query(query);
    },
    setJobStatus: (id, status) => {
        return db.query(`update jobs set id_status = ${status} where id_job = ${id}`);
    },
    getJobStatuses: () => {
        return db.query(`select * from statuses;`);
    }
}