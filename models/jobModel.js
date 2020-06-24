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
        select j.*, jri.img, jt.id_tag, t.name as tag_name, t.status as tag_status, p.name as province, d.name as district${multipleTags.length > 0 ? ', matches.relevance as relevance' : ''}
        from (((jobs as j left join job_related_images as jri on j.id_job = jri.id_job) left join jobs_tags as jt on j.id_job = jt.id_job) left join tags as t on t.id_tag = jt.id_tag), users as u, provinces as p, districts as d
        ${multipleTags.length > 0 ? ',(SELECT j2.id_job as id,count(j2.id_job) as relevance FROM jobs as j2, jobs_tags as jt2 WHERE j2.id_job = jt2.id_job AND jt2.id_tag IN (' + tags + ') GROUP BY j2.id_job) AS matches' : ''}
        ${queryArr.length > 0 ? ('where ' + query + ' and j.area_province = p.id_province and j.area_district = d.id_district') : 'where j.area_province = p.id_province and j.area_district = d.id_district'} ${multipleTags.length > 0 ? ' and matches.id = j.id_job' : ''}
        group by j.id_job, jt.id_tag order by j.id_job asc`;
        // console.log(finalQuery);
        return db.query(finalQuery);
    },
}