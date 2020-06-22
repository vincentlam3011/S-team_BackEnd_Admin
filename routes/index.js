var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var passport = require('passport');

var userModel = require('../models/userModel');
const { json } = require('express');
const saltRounds = 12;

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/getAll', function (req, res, next) {
  userModel.getEmployees()
    .then(data => {
      res.json(data);
    }).catch(err => {
      res.json(err);
    })
})

router.post('/login', (req, res, next) => {
  console.log(req.body);
  passport.authenticate('local', { session: false }, (err, user, cb) => {
    if (user === false) {
      res.json("Wrong info");
    }
    else {
      if (err || !user) {
        res.json("Wrong info"); return;
      }

      req.login(user, { session: false }, (err) => {
        if (err) {
          res.send(err);
        }
        let payload = { id: user.loginUser.id_user, isManager: user.loginUser.isManager };
        const token = jwt.sign(payload, 'S_Team', { expiresIn: '24h' });
        return res.json({ user: user.loginUser, token });
      });
    }
  })(req, next);
});

// router.post('/addEmployee', function (req, res, next) {
//   let employee = req.body;
//   userModel.getByUsername(employee.username)
//     .then(existing => {
//       if (existing.length > 0) {
//         res.json("Existed");
//       } else {
//         bcrypt.hash(employee.password, saltRounds, (err, hash) => {
//           if (err) {
//             res.json({ message: "Bcrypt error", code: 0 });
//           }
//           employee.password = hash;
//           userModel.addEmployee(employee)
//             .then(result => {
//               res.json(result);
//             }).catch(err => {
//               res.json(err);
//             })
//         })
//       }
//     }).catch(err => {
//       res.json(err);
//     })
// })

module.exports = router;
