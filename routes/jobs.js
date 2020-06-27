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
                topic_name: value[0].topic_name,
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

router.get('/getJobById/:id', function (req, res, next) {
    let id_job = req.params.id;
    jobModel.getJobById(id_job).then(data => {

        var finalData;
        var tags_temp = [];
        var imgs_temp = [];

        const tags = _.groupBy(data[0], "id_tag");

        _.forEach(tags, (value, key) => {
            const tag = _.map(value, item => {
                const { id_tag, tag_name, tag_status } = item;
                if (id_tag === null || tag_name === null || tag_status === 0) {

                } else {
                    tags_temp.push(tag_name);
                }
            });
        })

        data[1].forEach(element => {
            if (element.img) {
                let buffer = new Buffer(element.img);
                let bufferBase64 = buffer.toString('base64');
                element.img = bufferBase64;
                imgs_temp.push(element.img);
            }
        })

        let jobInfo = data[0][0];


        finalData = {
            id_job: jobInfo.id_job,
            employer: jobInfo.employer,
            title: jobInfo.title,
            salary: jobInfo.salary,
            job_topic: jobInfo.job_topic,
            area_province: jobInfo.area_province,
            area_district: jobInfo.area_district,
            address: jobInfo.address,
            lat: jobInfo.lat,
            lng: jobInfo.lng,
            description: jobInfo.description,
            post_date: jobInfo.post_date,
            expire_date: jobInfo.expire_date,
            dealable: jobInfo.dealable,
            job_type: jobInfo.job_type,
            isOnline: jobInfo.isOnline,
            isCompany: jobInfo.isCompany,
            vacancy: jobInfo.vacancy,
            requirement: jobInfo.requirement,
            id_status: jobInfo.id_status,
            benefit: jobInfo.benefit,
            province_name: jobInfo.province_name,
            district_name: jobInfo.district_name,
            topic_name: jobInfo.topic_name,
            name_employer: jobInfo.name_employer,
            email: jobInfo.email,
            dial: jobInfo.dial,
            name_status: jobInfo.name_status,
            start_date: jobInfo.start_date,
            end_date: jobInfo.end_date,
            salary_type: jobInfo.salary_type,
            deadline: jobInfo.deadline,
            tags: tags_temp,
            imgs: imgs_temp,
        }
        response(res, DEFINED_CODE.GET_DATA_SUCCESS, finalData);
    }).catch(err => {
        response(res, DEFINED_CODE.GET_DATA_FAIL, err);
    })
});

router.post('/getJobsByEmployer/:id', (req, res, next) => {
    let id = req.params.id;
    let queryName = req.body.queryName || '';
    let status = req.body.status || -2;
    let page = Number.parseInt(req.body.page) || 1;
    let take = Number.parseInt(req.body.take) || 6;
    let isASC = Number.parseInt(req.body.isASC) || 1;
    jobModel.getJobsListByEmployer(id, queryName, status)
        .then(data => {
            const jobs = _.groupBy(data, "id_job");
            var finalData = [];
            _.forEach(jobs, (value, key) => {
                let tags_temp = [];
                const tags = _.map(value, item => {
                    const { id_tag, tag_name } = item;
                    if (id_tag === null || tag_name === null) {
                        // return null;
                    }
                    else {
                        tags_temp.push({ id_tag, tag_name });
                    }
                })
                const temp = {
                    id_job: value[0].id_job,
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
            response(res, DEFINED_CODE.GET_DATA_SUCCESS, { jobsList: realData, total: finalData.length, page: page });
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
})

router.post('/getJobsByApplicant/:id', (req, res, next) => {
    let id = req.params.id;
    let queryName = req.body.queryName || '';
    let status = req.body.status || -2;
    let page = Number.parseInt(req.body.page) || 1;
    let take = Number.parseInt(req.body.take) || 6;
    let isASC = Number.parseInt(req.body.isASC) || 1;
    jobModel.getJobsListByApplicant(id, queryName, status)
        .then(data => {
            const jobs = _.groupBy(data, "id_job");
            var finalData = [];
            _.forEach(jobs, (value, key) => {
                let tags_temp = [];
                const tags = _.map(value, item => {
                    const { id_tag, tag_name } = item;
                    if (id_tag === null || tag_name === null) {
                        // return null;
                    }
                    else {
                        tags_temp.push({ id_tag, tag_name });
                    }
                })
                const temp = {
                    id_job: value[0].id_job,
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
            response(res, DEFINED_CODE.GET_DATA_SUCCESS, { jobsList: realData, total: finalData.length, page: page });
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
})

router.put('/setJobStatus', (req, res, next) => {
    var { id_job, id_status } = req.body;
    jobModel.setJobStatus(id_job, id_status)
    .then(data => {
        response(res, DEFINED_CODE.EDIT_PERSONAL_SUCCESS, `Status changed to ${id_status}`);
    }).catch(err => {
        response(res, DEFINED_CODE.EDIT_PERSONAL_FAIL, err);
    })
})
  
module.exports = router;