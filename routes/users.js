var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const transactionModel = require('../models/transactionModel');
const momoService = require('../middleware/momoService');
const https = require('https');

var bcrypt = require('bcrypt');
const { response, DEFINED_CODE } = require('../config/response');
const { result } = require('lodash');
const saltRounds = 12;

var firebase = require('../utils/firebaseFunction')

router.get('/', function (req, res, next) {
  var token = req.headers.authorization.slice(7);
  var decodedPayload = jwt.decode(token, {
    secret: 'S_Team',
  });
  userModel.getById(decodedPayload.id)
    .then(data => {
      response(res, DEFINED_CODE.GET_DATA_SUCCESS, data);
    }).catch(err => {
      response(res, DEFINED_CODE.GET_DATA_FAIL, err);
    })
});

router.post('/getEmployeesList', function (req, res, next) {
  let page = Number.parseInt(req.body.page) || 1;
  let take = Number.parseInt(req.body.take) || 6;
  let { queryName, isManager } = req.body;

  let queryNameCount = queryName.trim().split(/\s+/).length || 0;

  userModel.getEmployees(isManager, queryName, queryNameCount)
    .then(data => {
      let finalData = data;
      let realData = finalData.slice((page - 1) * take, (page - 1) * take + take);
      response(res, DEFINED_CODE.GET_DATA_SUCCESS, { employeesList: realData, total: finalData.length, page: page });
    }).catch(err => {
      response(res, DEFINED_CODE.GET_DATA_FAIL, err);
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
        userModel.deleteAnEmployee(id_employee)
          .then(result => {
            response(res, DEFINED_CODE.INTERACT_DATA_SUCCESS, `Deleted employee ID ${id_employee}!`);
          }).catch(err => {
            response(res, DEFINED_CODE.INTERACT_DATA_FAIL, err);
          })
      } else {
        response(res, DEFINED_CODE.INTERACT_DATA_FAIL, `Cannot remove yourself`);
      }
    }).catch(err => {
      response(res, DEFINED_CODE.GET_DATA_FAIL, err);
    })
})

router.get('/getEmployeeById/:id', (req, res, next) => {
  let id = req.params.id;
  userModel.getById(id)
    .then(data => {
      response(res, DEFINED_CODE.GET_DATA_SUCCESS, data);
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
      if (account_status === 2) {
        // tài khoản được xác thực        
        let content = {
          type: 11,
          date: Date.now()
        }

        // tạo thông báo cho người chủ,                                
        firebase.pushNotificationsFirebase(data[1][0].email, content);
      }
      else if (account_status === 1) {
        // tài khoản chuyển sang chờ xác thực        
        let content = {
          type: 12,
          date: Date.now()
        }

        // tạo thông báo cho người chủ,                                
        firebase.pushNotificationsFirebase(data[1][0].email, content);
      }
      else {
        // do nothing
      }

    }).catch(err => {
      response(res, DEFINED_CODE.EDIT_PERSONAL_FAIL, err);
    })
})

router.put('/rejectVerificationProposal', (req, res, next) => {
  var { id_user } = req.body;
  userModel.rejectUserVerificationProposal(id_user)
    .then(data => {
      response(res, DEFINED_CODE.EDIT_PERSONAL_SUCCESS, `Verification data deleted. reamin not-verified!`);
      let content = {
        type: 13,
        date: Date.now()
      }
      // tạo thông báo cho người chủ,                                
      firebase.pushNotificationsFirebase(data[1][0].email, content);
    }).catch(err => {
      response(res, DEFINED_CODE.EDIT_PERSONAL_FAIL, err);
    })
})

router.post('/getClientUsersList/:isBusinessUser', (req, res, next) => {
  let page = Number.parseInt(req.body.page) || 1;
  let take = Number.parseInt(req.body.take) || 6;
  var isBusinessUser = req.params.isBusinessUser;
  let queryName = req.body.queryName || '';
  let account_status = req.body.account_status || -2;

  let queryNameCount = queryName.trim().split(/\s+/).length || 0;

  if (isBusinessUser == 0) {
    userModel.getClientPersonalUsers(account_status, queryName, queryNameCount)
      .then(data => {
        let finalData = data;
        let realData = finalData.slice((page - 1) * take, (page - 1) * take + take);
        response(res, DEFINED_CODE.GET_DATA_SUCCESS, { usersList: realData, total: finalData.length, page: page });

      }).catch(err => {
        response(res, DEFINED_CODE.GET_DATA_FAIL, err);
      })
  } else {
    userModel.getClientBusinessUsers(account_status, queryName, queryNameCount)
      .then(data => {
        let finalData = data;
        let realData = finalData.slice((page - 1) * take, (page - 1) * take + take);
        response(res, DEFINED_CODE.GET_DATA_SUCCESS, { usersList: realData, total: finalData.length, page: page });
      }).catch(err => {
        response(res, DEFINED_CODE.GET_DATA_FAIL, err);
      })
  }
})

router.put('/updateProfile', (req, res, next) => {
  var updates = [];
  var token = req.headers.authorization.slice(7);
  var decodedPayload = jwt.decode(token, {
    secret: 'S_Team',
  });
  let id_user = decodedPayload.id;
  var body = req.body;
  for (var i in body) {
    if (body[i] !== null && body[i] !== '') {
      updates.push({ field: i, value: `${body[i]}` });
    }
  };
  userModel.updateEmployeeInfo(id_user, updates)
    .then(data => {
      response(res, DEFINED_CODE.INTERACT_DATA_SUCCESS, "Updated");
    }).catch(err => {
      response(res, DEFINED_CODE.INTERACT_DATA_FAIL, err);
    })
})

router.put('/changePassword', (req, res, next) => {
  var token = req.headers.authorization.slice(7);
  var decodedPayload = jwt.decode(token, {
    secret: 'S_Team',
  });
  var id_user = decodedPayload.id;
  var { oldPassword, newPassword } = req.body;
  if (newPassword == '' || newPassword == null || oldPassword == '' || oldPassword == null) {
    return response(res, DEFINED_CODE.CHANGE_PASSWORD_FAIL, `Nothing to change`);
  }
  userModel.getById(id_user)
    .then(user => {
      let password = user[0].password;
      bcrypt.compare(oldPassword, password, (err, result) => {
        if (err) {
          response(res, DEFINED_CODE.CHANGE_PASSWORD_FAIL, `Bcrypt error`);
        }
        if (result) {
          bcrypt.hash(newPassword, saltRounds, (err, hash) => {
            if (err) {
              res.json(err);
            } else {
              var updates = [{ field: 'password', value: `${hash}` }];
              userModel.updateEmployeeInfo(id_user, updates)
                .then(data => {
                  response(res, DEFINED_CODE.CHANGE_PASSWORD_SUCCESS);
                }).catch(err => {
                  response(res, DEFINED_CODE.CHANGE_PASSWORD_FAIL, err);
                })
            }
          })
        } else {
          return response(res, DEFINED_CODE.CHANGE_PASSWORD_FAIL, `Old password does not match`);
        }
      })
    })
})

router.put('/resetPassword/:id', (req, res, next) => {
  var token = req.headers.authorization.slice(7);
  var decodedPayload = jwt.decode(token, {
    secret: 'S_Team',
  });
  var isMng = decodedPayload.isManager;
  let id_staff = req.params.id;
  if (isMng == 0) {
    return response(res, DEFINED_CODE.INTERACT_DATA_FAIL, `Cannot reset password if is not an admin!`);
  }
  let newPassword = 'admin123';
  bcrypt.hash(newPassword, saltRounds, (err, hash) => {
    if (err) {
      response(res, DEFINED_CODE.CHANGE_PASSWORD_FAIL, `Bcrypt error`);
    } else {
      var updates = [{ field: 'password', value: `${hash}` }];
      userModel.updateEmployeeInfo(id_staff, updates)
        .then(data => {
          response(res, DEFINED_CODE.CHANGE_PASSWORD_SUCCESS, "Updated");
        }).catch(err => {
          response(res, DEFINED_CODE.CHANGE_PASSWORD_FAIL, err);
        })
    }
  })
})


router.post('/getTransactionForEmpployer', function (req, res, next) {
  let page = Number.parseInt(req.body.page) || 1;
  let take = Number.parseInt(req.body.take) || 6;
  let id = Number.parseInt(req.body.id) || 1;
  let id_status = Number.parseInt(req.body.id_status) || 0;
  let id_job = Number.parseInt(req.body.id_job) || '';

  transactionModel.getTransactionForEmpployer(id, id_status, id_job)
    .then(data => {
      let finalData = data;
      let realData = finalData.slice((page - 1) * take, (page - 1) * take + take);
      response(res, DEFINED_CODE.GET_DATA_SUCCESS, { list: realData, total: finalData.length, page: page });
    }).catch(err => {
      response(res, DEFINED_CODE.GET_DATA_FAIL, err);
    })
});

router.post('/getTransactionForEmployee', function (req, res, next) {
  let page = Number.parseInt(req.body.page) || 1;
  let take = Number.parseInt(req.body.take) || 6;
  let id = Number.parseInt(req.body.id) || 1;
  let id_status = Number.parseInt(req.body.id_status) || 0;
  let id_job = Number.parseInt(req.body.id_job) || '';

  transactionModel.getTransactionForEmployee(id, id_status, id_job)
    .then(data => {
      let finalData = data;
      let realData = finalData.slice((page - 1) * take, (page - 1) * take + take);
      response(res, DEFINED_CODE.GET_DATA_SUCCESS, { list: realData, total: finalData.length, page: page });
    }).catch(err => {
      response(res, DEFINED_CODE.GET_DATA_FAIL, err);
    })
});


router.post('/getPaymentFromJob', function (req, res, next) {
  let id_transaction = Number.parseInt(req.body.id_transaction);
  if (isNaN(id_transaction)) {
    response(res, DEFINED_CODE.GET_DATA_FAIL, err);
  }
  else {
    transactionModel.getPayment(id_transaction)
      .then(data => {
        response(res, DEFINED_CODE.GET_DATA_SUCCESS, { RowChanged: data.RowChanged });
      }).catch(err => {
        response(res, DEFINED_CODE.GET_DATA_FAIL, err);
      })
  }
});

router.post('/getRefundForEmployer', async function (req, res1, next) {
  let id_transaction = Number.parseInt(req.body.id_transaction);
  let id_applicant = Number.parseInt(req.body.id_applicant);
  let refundPercentage = Number.parseInt(req.body.refundPercentage);
  let leftover = Number.parseInt(req.body.leftover);
  let id_report = Number.parseInt(req.body.id_report);
  let reason = req.body.reason;
  let solution = req.body.solution;
  console.log('refundPercentage:', refundPercentage)
  if (isNaN(id_transaction)) {
    response(res, DEFINED_CODE.ERROR_ID, err);
  }
  else {
    transactionModel.getTransactionByIdTransaction(id_transaction).then(async data => {
      console.log(data);
      if (data[0].status === 0 || data[0].status === 2) {
        let temp = { ...data[0] }
        temp.refundPercentage = refundPercentage;
        temp.reason = reason ? reason : '';

        // demo diabled momo
        // transactionModel.getRefund(id_applicant, id_report, temp.id_transaction, temp.amount, refundPercentage, reason, solution)
        // .then(data => {
        //   response(res1, DEFINED_CODE.GET_DATA_SUCCESS,{code: 1});
        //   let content = {
        //     job: data[1][0].title,
        //     refundPercentage: refundPercentage,
        //     leftover: leftover,
        //     type: 19,
        //     date: Date.now()
        //   }

        //   // tạo thông báo cho người chủ,                                
        //   firebase.pushNotificationsFirebase(data[1][0].email, content);
        // }).catch(err => {
        //   response(res1, DEFINED_CODE.GET_DATA_FAIL, err);
        // })

        // demo enabled momo
        let momo = momoService.refundMoneyFromF2LToMoMo(temp);
        let body = momo.body;
        console.log('momo:', momo)
        var req = await https.request(momo.options, (res) => {
          console.log(`Status: ${res.statusCode}`);
          console.log(`Headers: ${JSON.stringify(res.headers)}`);
          let returnBody = null;
          res.setEncoding('utf8');
          res.on('data', (body) => {
            returnBody = JSON.parse(body);
          });

          res.on('end', () => {
            console.log(returnBody);
            if (returnBody !== null) {
              if (returnBody.status === 0) {
                transactionModel.getRefund(id_applicant, id_report, temp.id_transaction, temp.amount, refundPercentage, reason, solution)
                  .then(data => {
                    response(res1, DEFINED_CODE.GET_DATA_SUCCESS, { code: 1 });
                  // tạo thông báo cho người chủ, 
                    let content1 = {
                      job: data[1][0].title,
                      refundPercentage: refundPercentage,
                      employee_name: data[1][0].fullname,                      
                      type: 9,
                      date: Date.now()
                    }
                                                   
                    firebase.pushNotificationsFirebase(data[1][0].employer_email, content1);

                  // tạo thông báo cho người làm, 
                    let content2 = {
                      job: data[1][0].title,
                      leftover: leftover,
                      type: 19,
                      date: Date.now()
                    }
                                                   
                    firebase.pushNotificationsFirebase(data[1][0].email, content2);
                  })
                  .catch(err => {
                    response(res1, DEFINED_CODE.GET_DATA_FAIL, err);
                    // });
                  })
              }
              else {
                response(res1, DEFINED_CODE.GET_DATA_SUCCESS, { code: 0 });
              }
            }

          });

        });

        req.on('error', (e) => {
          console.log(`problem with request: ${e.message}`);
        });

        // write data to request body
        req.write(body);
        req.end();

      }
      else {
        response(res1, DEFINED_CODE.GET_DATA_SUCCESS, { code: 0 });

      }


    }).catch(err => {
      console.log('err:', err)
      response(res1, DEFINED_CODE.GET_DATA_FAIL, err);
    })

  }

});

module.exports = router;
