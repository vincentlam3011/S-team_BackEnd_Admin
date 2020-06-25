var express = require('express');
var router = express.Router();
var { response, DEFINED_CODE } = require('../config/response');
var tagModel = require('../models/tagModel');

router.put('/setTagStatusById/:id', (req, res, next) => {
    let id = req.params.id;
    let { status } = req.body;
    tagModel.setTagStatus(id, status)
        .then(data => {
            response(res, DEFINED_CODE.INTERACT_DATA_SUCCESS, `Status changed to ${status}`);
        }).catch(err => {
            response(res, DEFINED_CODE.INTERACT_DATA_FAIL, err);
        })
})

router.get('/getTags', (req, res, next) => {
    let page = Number.parseInt(req.body.page) || 1;
    let take = Number.parseInt(req.body.take) || 6;
    let isASC = Number.parseInt(req.body.isASC) || 1;
    let queryName = req.body.queryName || '';
    let status = req.body.status || 1;
    tagModel.getTags(queryName, status)
        .then(data => {
            let finalData = data;
            if (isASC !== 1) {
                finalData = finalData.reverse();
            }
            let realData = finalData.slice((page - 1) * take, (page - 1) * take + take);
            response(res, DEFINED_CODE.GET_DATA_SUCCESS, { topicsList: realData, total: finalData.length, page: page })
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
})

router.get('/getTagById/:id', (req, res, next) => {
    let id = req.params.id;
    tagModel.getTagById(id)
        .then(data => {
            if (data.length > 0) {
                response(res, DEFINED_CODE.GET_DATA_SUCCESS, data[0]);
            } else {
                response(res, DEFINED_CODE.GET_DATA_SUCCESS, `Not found`)
            }
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
})

router.post('/addNewTag', (req, res, next) => {
    let { name } = req.body;
    let tag = { name: name };
    tagModel.addTag(tag)
        .then(data => {
            response(res, DEFINED_CODE.CREATED_DATA_SUCCESS, "New tag created!");
        }).catch(err => {
            response(res, DEFINED_CODE.CREATE_DATA_FAIL, err);
        })
})

router.put('/updateTagById/:id', (req, res, next) => {
    var updates = [];
    var body = req.body;
    for (var i in body) {
        if (body[i]) {
            updates.push({ field: i, value: `${body[i]}` });
        }
    };
    let id_jobtopic = req.params.id;
    tagModel.updateTag(id_jobtopic, updates)
        .then(result => {
            response(res, DEFINED_CODE.INTERACT_DATA_SUCCESS, "Updated");
        }).catch(err => {
            response(res, DEFINED_CODE.INTERACT_DATA_FAIL, err);
        })
})

module.exports = router;