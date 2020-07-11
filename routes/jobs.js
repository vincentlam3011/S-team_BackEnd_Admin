var express = require('express');
var router = express.Router();
const jobModel = require('../models/jobModel');
const { response, DEFINED_CODE } = require('../config/response');
var _ = require('lodash');
const { query } = require('express');

var firebase = require('../utils/firebaseFunction')

router.post('/getJobsList', function (req, res, next) {
    let page = Number.parseInt(req.body.page) || 1;
    let take = Number.parseInt(req.body.take) || 6;
    let isASC = Number.parseInt(req.body.isASC) || 1;
    // Lấy danh sách các query cần thiết
    let queryArr = [];
    let multiTags = [];
    let query = req.body.query;

    let queryTitle = '';
    let queryEmployer = '';

    for (let i in query) {
        if (query[i]) {
            if (i === 'title') {
                queryTitle = query[i];
            }
            else if (i === 'expire_date') {
                queryArr.push(` j.${i} = '${query[i]}' `);
            }
            else if (i === 'salary') {
                queryArr.push(` j.${i} >= '${query[i].bot}' `);
                if (query[i].top != 0) {
                    queryArr.push(` j.${i} < '${query[i].top}' `);
                }
            }
            else if (i === 'vacancy') {
                queryArr.push(` j.${i} >= '${query[i]}' `);
            }
            else if (i === 'employer') {
                queryEmployer = query[i];
            }
            else {
                queryArr.push(` j.${i} = ${query[i]} `);
            }
        }
    };

    jobModel.getJobsList(queryArr, queryEmployer, queryTitle).then(data => {        
        var finalData = data;

        // Đảo ngược chuỗi vì id_job thêm sau cũng là mới nhất
        if (isASC !== 1) {
            finalData = finalData.reverse();
        }

        let realData = finalData.slice((page - 1) * take, (page - 1) * take + take);        
        
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
            var finalData = data;

            // Đảo ngược chuỗi vì id_job thêm sau cũng là mới nhất
            if (isASC !== 1) {
                finalData = finalData.reverse();
            }
            let realData = finalData.slice((page - 1) * take, (page - 1) * take + take);
            
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
            var finalData = data;
            
            // Đảo ngược chuỗi vì id_job thêm sau cũng là mới nhất
            if (isASC !== 1) {
                finalData = finalData.reverse();
            }
            let realData = finalData.slice((page - 1) * take, (page - 1) * take + take);
            
            response(res, DEFINED_CODE.GET_DATA_SUCCESS, { jobsList: realData, total: finalData.length, page: page });
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
})

router.put('/setJobStatusById', (req, res, next) => {
    let id = Number.parseInt(req.body.id_job);
    let status = Number.parseInt(req.body.id_status);
    jobModel.getJobStatusById(id)
        .then(data => {
            let curStt = data[0].id_status;
            if (status === 0) {
                if (curStt === 1) {
                    jobModel.deleteJobById(id)
                        .then(result => {
                            response(res, DEFINED_CODE.INTERACT_DATA_SUCCESS, `Job deleted (physically)!`);

                            // lấy tên chủ đề và tạo nội dung
                            let content = {
                                fullname: data[1][0].fullname,
                                job: data[1][0].title,
                                type: 10,
                                date: Date.now()
                            }

                            // tạo thông báo cho người chủ,                                
                            firebase.pushNotificationsFirebase(data[1][0].email, content);

                            // tạo thông báo cho người làm,
                            data[2].forEach((e) => {
                                firebase.pushNotificationsFirebase(e.email, content);
                            })

                        }).catch(err => {
                            response(res, DEFINED_CODE.INTERACT_DATA_FAIL, err);
                        })
                } else {
                    jobModel.setJobStatus(id, status)
                        .then(result => {
                            response(res, DEFINED_CODE.INTERACT_DATA_SUCCESS, `Job ID ${id} - status changed to ${status}`);

                            // lấy tên chủ đề và tạo nội dung
                            let content = {
                                fullname: data[1][0].fullname,
                                job: data[1][0].title,
                                type: 4,
                                date: Date.now()
                            }

                            // tạo thông báo cho người chủ,                                
                            firebase.pushNotificationsFirebase(data[1][0].email, content);

                            // tạo thông báo cho người làm,
                            data[2].forEach((e) => {
                                firebase.pushNotificationsFirebase(e.email, content);
                            })

                        }).catch(err => {
                            response(res, DEFINED_CODE.INTERACT_DATA_FAIL, err);
                        })
                }
            } else {
                jobModel.setJobStatus(id, status)
                    .then(result => {
                        response(res, DEFINED_CODE.INTERACT_DATA_SUCCESS, `Job ID ${id} - status changed to ${status}`);
                        // Chỉ có thể khôi phục lại giai đoạn đang tuyển từ phía admin
                        
                        // lấy tên chủ đề và tạo nội dung
                        let jobTitle = data[1][0].title;
                        let content = {
                            fullname: data[1][0].fullname,
                            job: jobTitle,
                            type: 6,
                            date: Date.now()
                        }

                        // tạo thông báo cho người chủ,                                
                        firebase.pushNotificationsFirebase(data[1][0].email, content);

                        // tạo thông báo cho người làm,
                        data[2].forEach((e) => {
                            firebase.pushNotificationsFirebase(e.email, content);
                        })
                    }).catch(err => {
                        response(res, DEFINED_CODE.INTERACT_DATA_FAIL, err);
                    })
            }
        }).catch(err => {
            response(res, DEFINED_CODE.EDIT_PERSONAL_FAIL, err);
        })
})

module.exports = router;