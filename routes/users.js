var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
var bcrypt = require('bcrypt');
const saltRounds = 12;

/* GET users listing. */
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
  let id_user = decodedPayload.id;
  userModel.getById(id_user)
    .then(user => {
      if (user[0].isManager) {
        userModel.getByUsername(employee.username)
          .then(existing => {
            if (existing.length > 0) {
              res.json("Existed");
            } else {
              bcrypt.hash(employee.password, saltRounds, (err, hash) => {
                if (err) {
                  res.json({ message: "Bcrypt error", code: 0 });
                }
                employee.password = hash;
                userModel.addEmployee(employee)
                  .then(result => {
                    res.json(result);
                  }).catch(err => {
                    res.json(err);
                  })
              })
            }
          }).catch(err => {
            res.json(err);
          })
      } else {
        return res.json("Cannot add employees if is not manager!");
      }
    }).catch(err => {
      res.json(err);
    })

})

module.exports = router;
