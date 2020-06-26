var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
var bcrypt = require('bcrypt');
const { response, DEFINED_CODE } = require('../config/response');
const saltRounds = 12;

router.get('/', function (req, res, next) {
  var token = req.headers.authorization.slice(7);
  var decodedPayload = jwt.decode(token, {
    secret: 'S_Team',
  });
  userModel.getById(decodedPayload.id)
    .then(data => {
      res.json(data);
    }).catch(err => {
      res.json(err);
    })
});

router.post('/addEmployee', function (req, res, next) {
  let employee = req.body;
  var token = req.headers.authorization.slice(7);
  var decodedPayload = jwt.decode(token, {
    secret: 'S_Team',
  });
  let isMng = decodedPayload.isManager;
  if (isMng !== 0) {
    userModel.getByUsername(employee.username)
      .then(existing => {
        if (existing.length > 0) {
          // res.json("Existed");
          response(res, DEFINED_CODE.USERNAME_EXISTED);
        } else {
          bcrypt.hash(employee.password, saltRounds, (err, hash) => {
            if (err) {
              response(res, DEFINED_CODE.CREATE_DATA_FAIL, { sys: err, msg: "Bcrypt failed" });
            }
            employee.password = hash;
            userModel.addEmployee(employee)
              .then(result => {
                // res.json(result);
                response(res, DEFINED_CODE.CREATED_DATA_SUCCESS, result);
              }).catch(err => {
                // res.json(err);
                response(res, DEFINED_CODE.CREATE_DATA_FAIL, err);
              })
          })
        }
      }).catch(err => {
        response(res, DEFINED_CODE.GET_DATA_FAIL, err);
      })
  } else {
    response(res, DEFINED_CODE.CREATE_DATA_FAIL, `Cannot add employees if is not manager!`)
  }
})

router.delete('/deleteEmployee/:id', function (req, res, next) {
  var id_employee = req.params.id;
  var token = req.headers.authorization.slice(7);
  var decodedPayload = jwt.decode(token, {
    secret: 'S_Team',
  });
  let isMng = decodedPayload.isManager;
  let id_user = decodedPayload.id;
  // return res.json(decodedPayload);
  if (isMng === 0) {
    response(res, DEFINED_CODE.INTERACT_DATA_FAIL, "Rejection due to not being an admin!");
  }
  userModel.getById(id_employee)
    .then(user => {
      if (user[0].id_user !== id_user) {
        if (isMng === 2) {
          userModel.deleteAnEmployee(id_employee)
            .then(result => {
              response(res, DEFINED_CODE.INTERACT_DATA_SUCCESS, `Deleted employee ID ${id_employee}!`);
            }).catch(err => {
              response(res, DEFINED_CODE.INTERACT_DATA_FAIL, err);
            })
        } else {
          if (user[0].isManager === 1) {
            response(res, DEFINED_CODE.ACTIVATE_FAIL, `Cannot remove another admin if is not an executive!`);
          } else {
            userModel.deleteAnEmployee(id_employee)
              .then(result => {
                response(res, DEFINED_CODE.INTERACT_DATA_SUCCESS, `Deleted employee ID ${id_employee}!`);
              }).catch(err => {
                response(res, DEFINED_CODE.INTERACT_DATA_FAIL, err);
              })
          }
        }
      } else {
        response(res, DEFINED_CODE.INTERACT_DATA_FAIL, `Cannot remove yourself`);
      }
    }).catch(err => {
      response(res, DEFINED_CODE.GET_DATA_FAIL, err);
    })
})

router.get('/getClientUserDetails/:id', (req, res, next) => {
  let id_user = req.params.id;
  userModel.getById(id_user, 1)
    .then(data => {
      var personalInfo = data[0];
      var companyInfo = data[1];
      var ratingAsEmployee = data[2];
      var ratingAsEmployer = data[3];
      // avatar
      if (personalInfo[0].avatarImg !== null) {
        let avatar = personalInfo[0].avatarImg;
        let buffer = new Buffer(avatar);
        let bufferB64 = buffer.toString('base64');
        personalInfo[0].avatarImg = bufferB64;
      }
      // portrait
      if (personalInfo[0].portrait !== null) {
        let portrait = personalInfo[0].portrait;
        let buffer = new Buffer(portrait);
        let bufferB64 = buffer.toString('base64');
        personalInfo[0].portrait = bufferB64;
      }
      // front ID
      if (personalInfo[0].frontIdPaper !== null) {
        let frontIdPaper = personalInfo[0].frontIdPaper;
        let buffer = new Buffer(frontIdPaper);
        let bufferB64 = buffer.toString('base64');
        personalInfo[0].frontIdPaper = bufferB64;
      }
      // back ID
      if (personalInfo[0].backIdPaper !== null) {
        let backIdPaper = personalInfo[0].backIdPaper;
        let buffer = new Buffer(backIdPaper);
        let bufferB64 = buffer.toString('base64');
        personalInfo[0].backIdPaper = bufferB64;
      }
      if (personalInfo[0].isBusinessUser) {
        response(res, DEFINED_CODE.GET_DATA_SUCCESS, { personal: personalInfo[0], company: companyInfo[0], rating_as_employee: ratingAsEmployee[0], rating_as_employer: ratingAsEmployer[0] });
      } else {
        response(res, DEFINED_CODE.GET_DATA_SUCCESS, { personal: personalInfo[0], rating_as_employee: ratingAsEmployee[0], rating_as_employer: ratingAsEmployer[0] });
      }
    }).catch(err => {
      response(res, DEFINED_CODE.GET_DATA_FAIL, err);
    })
})

router.put('/setClientUserStatus', (req, res, next) => {
  var { id_user, account_status } = req.body;
  userModel.setUserAccountStatus(id_user, account_status)
    .then(data => {
      response(res, DEFINED_CODE.EDIT_PERSONAL_SUCCESS, `Status changed to ${account_status}`);
    }).catch(err => {
      response(res, DEFINED_CODE.EDIT_PERSONAL_FAIL, err);
    })
})

router.post('/getClientUsersList/:isBusinessUser', (req, res, next) => {
  var { account_status, queryName } = req.body;
  let page = Number.parseInt(req.body.page) || 1;
  let take = Number.parseInt(req.body.take) || 6;
  var isBusinessUser = req.params.isBusinessUser;
  if (isBusinessUser == 0) {
    userModel.getClientPersonalUsers(account_status, queryName)
      .then(data => {
        let finalData = data;
        let realData = finalData.slice((page - 1) * take, (page - 1) * take + take);
        response(res, DEFINED_CODE.GET_DATA_SUCCESS, { usersList: realData, total: finalData.length, page: page });

      }).catch(err => {
        response(res, DEFINED_CODE.GET_DATA_FAIL, err);
      })
  } else {
    userModel.getClientBusinessUsers(account_status, queryName)
      .then(data => {
        let finalData = data;
        let realData = finalData.slice((page - 1) * take, (page - 1) * take + take);
        response(res, DEFINED_CODE.GET_DATA_SUCCESS, { usersList: realData, total: finalData.length, page: page });
      }).catch(err => {
        response(res, DEFINED_CODE.GET_DATA_FAIL, err);
      })
  }
})

module.exports = router;
