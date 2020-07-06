var express = require('express');
var router = express.Router();
var { response, DEFINED_CODE } = require('../config/response');
var reportModel = require('../models/reportModel');
var firebase = require('../utils/firebaseFunction');

router.post('/getReportsList', (req, res, next) => {    
    let page = Number.parseInt(req.body.page);
    let take = Number.parseInt(req.body.take);
    let status = Number.parseInt(req.body.status);
    let queryName = req.body.queryName;

    reportModel.getReportsList(status, queryName)
        .then(data => {
            let finalData = data.slice(take*(page - 1), take*page);
            response(res, DEFINED_CODE.GET_DATA_SUCCESS,{list: finalData, total: data.length, page: page});
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
});

router.post('/getJobReportsList', (req, res, next) => {    
    let page = Number.parseInt(req.body.page);
    let take = Number.parseInt(req.body.take);
    let status = Number.parseInt(req.body.status);
    let queryName = req.body.queryName;
    
    reportModel.getJobReportsList(status, queryName)
        .then(data => {
            let finalData = data.slice(take*(page - 1), take*page);
            response(res, DEFINED_CODE.GET_DATA_SUCCESS,{list: finalData, total: data.length, page: page});
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
});

router.post('/setReportStatus', (req, res, next) => {
    let id_report = Number.parseInt(req.body.id_report);
    let status  = Number.parseInt(req.body.status);
    let solution = req.body.solution;
    reportModel.setReportStatus(id_report, status, solution)
        .then(data => {
            response(res, DEFINED_CODE.EDIT_PERSONAL_SUCCESS, {RowChanged: data.RowChanged});
            
            if(status === 1) { // chỉ gửi thông báo khi report được xử lý
                // lấy tên chủ đề và tạo nội dung
                let content = {
                    type: 7,
                    employee: data[1].fullname,
                    job: data[1].title,
                    solution: solution,
                    date: Date.now()
                }

                firebase.pushNotificationsFirebase(data[1].email, content);
            }
        }).catch(err => {
            response(res, DEFINED_CODE.EDIT_PERSONAL_FAIL, err);
        })
});

router.post('/setJobReportStatus', (req, res, next) => {
    let id_report = Number.parseInt(req.body.id_report);
    let status  = Number.parseInt(req.body.status);
    let solution = req.body.solution;
    reportModel.setJobReportStatus(id_report, status, solution)
        .then(data => {
            response(res, DEFINED_CODE.EDIT_PERSONAL_SUCCESS, {RowChanged: data.RowChanged});
            if(status === 1 && solution === 'Không hoàn tiền') { 
                // Hầu như chỉ được gọi api này khi không cho hoàn tiền, hoàn tiền thì sẽ gọi ở chỗ khác
                let content = {
                    type: 8,
                    job: data[1].title,
                    date: Date.now()
                }

                firebase.pushNotificationsFirebase(data[1].email, content);
            }
        }).catch(err => {
            response(res, DEFINED_CODE.EDIT_PERSONAL_FAIL, err);
        })
});

module.exports = router;