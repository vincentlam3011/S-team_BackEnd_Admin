var express = require('express');
var router = express.Router();
const jobModel = require('../models/jobModel');
const { response, DEFINED_CODE } = require('../config/response');
var _ = require('lodash');

router.post('/getJobsList', function (req, res, next) {
    let page = Number.parseInt(req.body.page) || 1;
    let take = Number.parseInt(req.body.take) || 6;
    let isASC = Number.parseInt(req.body.isASC) || 1;
    // Lấy danh sách các query cần thiết
    let queryArr = [];
    let multiTags = [];
    let query = req.body.query;
    for (let i in query) {
        if (query[i]) {
            if (i === 'title') {
                queryArr.push({ field: i, text: `LIKE '%${query[i]}%'` });
            }
            else if (i === 'expire_date') {
                queryArr.push({ field: i, text: `= '${query[i]}'` });
            }
            else if (i === 'salary') {
                queryArr.push({ field: i, text: `>= '${query[i].bot}'` });
                if (query[i].top != 0) {
                    queryArr.push({ field: i, text: `< '${query[i].top}'` });
                }
            }
            else if (i === 'vacancy') {
                queryArr.push({ field: i, text: `>= '${query[i]}'` });
            }
            else if (i === 'employer') {
                queryArr.push({ field: i, text: `= u.id_user and u.fullname = '${query[i]}'` });
            }
            else if (i === 'tags') {
                multiTags = query[i];
            }
            else {
                queryArr.push({ field: i, text: `= ${query[i]}` });
            }
        }
    };

    console.log('queryArr:', queryArr)
    console.log('multiTags:', multiTags)
    jobModel.getJobsList(queryArr, multiTags).then(data => {
        const jobs = _.groupBy(data, "id_job");
        var finalData = [];
        console.log(queryArr)
        _.forEach(jobs, (value, key) => {
            let tags_temp = [];
            const tags = _.map(value, item => {
                const { id_tag, tag_name, tag_status } = item;
                if (id_tag === null || tag_name === null || tag_status === 0) {
                    // return null;
                }
                else {
                    // return { id_tag, tag_name };
                    tags_temp.push({ id_tag, tag_name });
                }
            })

            const temp = {
                id_job: value[0].id_job,
                // employer: value[0].employer,
                relevance: value[0].relevance,
                title: value[0].title,
                salary: value[0].salary,
                job_topic: value[0].job_topic,
                province: value[0].province,
                district: value[0].district,
                address: value[0].address,
                lat: value[0].lat,
                lng: value[0].lng,
                description: value[0].description,
                post_date: value[0].post_date,
                expire_date: value[0].expire_date,
                dealable: value[0].dealable,
                job_type: value[0].job_type,
                isOnline: value[0].isOnline,
                isCompany: value[0].isCompany,
                vacancy: value[0].vacancy,
                // requirement: value[0].requirement,
                id_status: value[0].id_status,
                img: value[0].img,
                tags: tags_temp[0] === null ? [] : tags_temp,
            }
            finalData.push(temp);
        })
        // Đảo ngược chuỗi vì id_job thêm sau cũng là mới nhất
        if (isASC !== 1) {
            finalData = finalData.reverse();
        }
        if (multiTags.length > 0) {
            finalData = _.orderBy(finalData, 'relevance', 'desc');
        }

        console.log("FLAG")

        let realData = finalData.slice((page - 1) * take, (page - 1) * take + take);
        if (realData.length > 0) {

            realData.forEach(element => {
                if (element.img) {
                    let buffer = new Buffer(element.img);
                    let bufferBase64 = buffer.toString('base64');
                    element.img = bufferBase64;
                }
            });

        }

        response(res, DEFINED_CODE.GET_DATA_SUCCESS, { jobList: realData, total: finalData.length, page: page });

    }).catch((err) => {
        response(res, DEFINED_CODE.GET_DATA_FAIL, err);
    })
});

module.exports = router;