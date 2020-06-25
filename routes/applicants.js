var express = require('express');
var router = express.Router();
var convertBlobB64 = require('../middleware/convertBlobB64');
var { response, DEFINED_CODE } = require('../config/response');
var applicantModel = require('../models/applicantModel');

router.get('/getByJobId', (req, res, next) => {
    let page = Number.parseInt(req.body.page) || 1;
    let take = Number.parseInt(req.body.take) || 6;
    let isASC = Number.parseInt(req.body.isASC) || 1;
    let id = Number.parseInt(req.body.id);
    let id_status = Number.parseInt(req.body.id_status);
    applicantModel.getApplicantsByJobId(id, id_status)
        .then(data => {
            var finalData = data;
            if (isASC !== 1) {
                finalData = finalData.reverse();
            }
            let realData = finalData.slice((page - 1) * take, (page - 1) * take + take);
            if (realData.length > 0) {
                realData.forEach(element => {
                    if (element.attachment) {
                        element.attachment = convertBlobB64.convertBlobToB64(element.attachment);
                    }
                });
            }
            response(res, DEFINED_CODE.GET_DATA_SUCCESS, { applicantsList: realData, total: finalData.length, page: page })
        }).catch(err => {
            response(res, DEFINED_CODE.GET_DATA_FAIL, err);
        })
})

module.exports = router;