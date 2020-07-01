var express = require('express');
var router = express.Router();
var { response, DEFINED_CODE } = require('../config/response');
var reportModel = require('../models/reportModel');

router.post('/getReportsList', (req, res, next) => {    
    let page = Number.parseInt(req.body.page);
    let take = Number.parseInt(req.body.take);
    let status = Number.parseInt(req.body.status);
    let queryName = req.body.queryName;

    console.log(status);
    console.log(queryName);
    reportModel.getReportsList(status, queryName)
        .then(data => {
            let finalData = data.slice(take*(page - 1), take*page);
            response(res, DEFINED_CODE.GET_DATA_SUCCESS,{list: finalData, total: data.length, page: page});
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
})

router.post('/setReportStatus', (req, res, next) => {
    let id_report = Number.parseInt(req.body.id_report);
    let status  = Number.parseInt(req.body.status);
    let solution = req.body.solution;
    reportModel.setReportStatus(id_report, status, solution)
        .then(data => {
            response(res, DEFINED_CODE.EDIT_PERSONAL_SUCCESS, {RowChanged: data.RowChanged});
        }).catch(err => {
            response(res, DEFINED_CODE.EDIT_PERSONAL_FAIL, err);
        })
})

module.exports = router;