var express = require('express');
var router = express.Router();
const topicModel = require('../models/topicModel');
const { response, DEFINED_CODE } = require('../config/response');
const { result } = require('lodash');

router.get('/getTopics', (req, res, next) => {
    let page = Number.parseInt(req.body.page) || 1;
    let take = Number.parseInt(req.body.take) || 6;
    let isASC = Number.parseInt(req.body.isASC) || 1;
    topicModel.getJobTopics()
        .then(data => {
            let finalData = data;
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

router.put('/removeTopicById/:id', (req, res, next) => {
    let id = req.params.id;
    topicModel.setTopicStatus(id)
        .then(result => {
            response(res, DEFINED_CODE.INTERACT_DATA_SUCCESS, "Topic removed, previous using this topic is changed to topic id 7!");
        }).catch(err => {
            response(res, DEFINED_CODE.INTERACT_DATA_FAIL, err);
        })
})

module.exports = router;