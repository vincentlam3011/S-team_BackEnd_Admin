var db = require('../utils/db');
var convertBlobB64 = require('../middleware/convertBlobB64');

module.exports = {
    getEmployees: () => {
        return db.query(`select * from employees`);
    },
    getByUsername: (username) => {
        return db.query(`select * from employees where username = '${username}'`);
    },
    getById: (id, userType = 0) => {
        if (userType === 0) {
            return db.query(`select * from employees where id_user = ${id}`);
        } else {
            return db.query(`select * from users where id_user = ${id}`);
        }
    },
    addEmployee: (employee) => {
        var insertQuery = `insert into employees `;
        var colQuery = `(username, tel, password) `; 
        var valQuery = `values('${employee.username}', '${employee.tel}', '${employee.password}');`;
        var query = insertQuery + colQuery + valQuery;
        return db.query(query);
    } 
}