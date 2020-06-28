var express = require('express');
var router = express.Router();
var { response, DEFINED_CODE } = require('../config/response');
var statModel = require('../models/statModel');

router.get('/getBasicStats', (req, res, next) => {
    statModel.getBasicStats()
        .then(data => {
            let returnData = {
                avgPerJob: data[0][0].value,
                avgJobPerDay: data[1][0].value,
                totalActiveUsers: data[2][0].value,
                totalBusinessUsers: data[3][0].value,
                avgNewUsersPerDay: data[4][0].value,
            }
            response(res, DEFINED_CODE.GET_DATA_SUCCESS, returnData);
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
})

router.get('/getPercentageStats', (req, res, next) => {
    statModel.getPercentageStats()
        .then(data => {
            let returnData = {
                total1: data[0][0].value,
                extract1: data[1][0].value,

                total2: data[2][0].value,
                extract2: data[3][0].value,

                total3: data[4][0].value,
                extract3: data[5][0].value,

                total4: data[6][0].value,
                extract4: data[7][0].value,

                total5: data[2][0].value,
                extract5: data[8][0].value,
            }
            response(res, DEFINED_CODE.GET_DATA_SUCCESS, returnData);
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
})

router.get('/annualJobsChartData', (req, res, next) => {
    statModel.getAnnualJobsChartData()
        .then(data => {
            response(res, DEFINED_CODE.GET_DATA_SUCCESS, data[0]);
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
})

router.get('/annualUsersChartData', (req, res, next) => {
    statModel.getAnnualUsersChartData()
        .then(data => {
            response(res, DEFINED_CODE.GET_DATA_SUCCESS, data[0]);
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
})

router.get('/getPendingReports', (req, res, next) => {
    statModel.getPendingReports()
        .then(data => {
            response(res, DEFINED_CODE.GET_DATA_SUCCESS, data[0]);
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
})

module.exports = router;