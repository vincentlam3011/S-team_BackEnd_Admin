var express = require('express');
var router = express.Router();
const topicModel = require('../models/topicModel');
const { response, DEFINED_CODE } = require('../config/response');
var convertBlobB64 = require('../middleware/convertBlobB64');

router.post('/getTopics', (req, res, next) => {
    let page = Number.parseInt(req.body.page) || 1;
    let take = Number.parseInt(req.body.take) || 6;
    let isASC = Number.parseInt(req.body.isASC) || 1;
    let queryName = req.body.queryName || '';
    let status = req.body.status || 1;
    topicModel.getJobTopics(queryName, status)
        .then(data => {
            let finalData = data;
            console.log(isASC);
            if (isASC != 1) {
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
            response(res, DEFINED_CODE.GET_DATA_SUCCESS, { topicsList: realData, total: finalData.length, page: page })
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
})

router.get('/getTopicById/:id', (req, res, next) => {
    let id = req.params.id;
    topicModel.getJobTopicById(id)
        .then(data => {
            if (data.length > 0) {
                if (data[0].img) {
                    let buffer = new Buffer(data[0].img);
                    let bufferBase64 = buffer.toString('base64');
                    data[0].img = bufferBase64;
                }
                response(res, DEFINED_CODE.GET_DATA_SUCCESS, data[0]);
            } else {
                response(res, DEFINED_CODE.GET_DATA_SUCCESS, `Not found`)
            }
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
})

router.put('/setTopicStatusById/:id', (req, res, next) => {
    let id = req.params.id;
    let { status } = req.body;
    console.log(status);
    topicModel.setTopicStatus(id, status)
        .then(result => {
            let msg = (status == 1 ? "Reactivated" : "Removed");
            response(res, DEFINED_CODE.INTERACT_DATA_SUCCESS, msg);
        }).catch(err => {
            response(res, DEFINED_CODE.INTERACT_DATA_FAIL, err);
        })
})

router.put('/updateTopicById/:id', (req, res, next) => {
    var updates = [];
    var body = req.body;
    for (var i in body) {
        if (body[i] !== null && body[i] !== '') {
            if (i === 'img') {
                body[i] = convertBlobB64.convertB64ToBlob(body[i]).toString('hex');
            }
            updates.push({ field: i, value: `${body[i]}` });
        }
    };
    console.log(updates);
    let id_jobtopic = req.params.id;
    topicModel.updateJobTopic(id_jobtopic, updates)
        .then(result => {
            response(res, DEFINED_CODE.INTERACT_DATA_SUCCESS, "Updated");
        }).catch(err => {
            response(res, DEFINED_CODE.INTERACT_DATA_FAIL, err);
        })
})

router.post('/addNewTopic', (req, res, next) => {
    let { name, img } = req.body;
    if (img) {
        img = convertBlobB64.convertB64ToBlob(img).toString('hex');
    }
    let topic = {
        name: name,
        img: img,
    }
    topicModel.addJobTopic(topic)
        .then(data => {
            response(res, DEFINED_CODE.CREATED_DATA_SUCCESS, "New topic created!");
        }).catch(err => {
            response(res, DEFINED_CODE.CREATE_DATA_FAIL, err);
        })
})

module.exports = router;