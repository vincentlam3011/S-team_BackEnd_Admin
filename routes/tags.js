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

router.post('/getTags', (req, res, next) => {
    let page = Number.parseInt(req.body.page) || 1;
    let take = Number.parseInt(req.body.take) || 6;
    let isASC = Number.parseInt(req.body.isASC);
    let queryName = req.body.queryName || '';
    let status = req.body.status || 2;
    let count = 0;
    queryName = queryName.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g, ' ').replace(/\s+/g, ' ');
    let isFulltext = (queryName.length >= 3) ? true : false;
    let matchValue = '';
    if (isFulltext) {
        let words = queryName.split(" ");
        count = words.length;
        isFulltext = true;
        for (let w of words) {
            matchValue += w + " ";
        }
        queryName = matchValue;
    }
    tagModel.getTags(queryName, status, isFulltext)
        .then(data => {
            let finalData = data;
            if (isASC !== 1) {
                finalData = finalData.reverse();
            }
            let realData = finalData.slice((page - 1) * take, (page - 1) * take + take);
            response(res, DEFINED_CODE.GET_DATA_SUCCESS, { tagsList: realData, total: finalData.length, page: page })
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
        if (body[i] !== '' && body[i] !== null) {
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