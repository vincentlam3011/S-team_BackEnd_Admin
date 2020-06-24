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
            var userQuery = `select * from users where id_user = ${id};`;
            var companyQuery = `select * from companies where id_user = ${id};`;
            var ratingAsEmployeeQuery = `select avg(ac.rating_fromEmployer) as rating_as_employee from accepted as ac, applicants as a where a.id_user = ${id} and ac.id_applicant = a.id_applicant;`
            var ratingAsEmployerQeury = `select avg(ac.rating_fromEmployee) as rating_as_employer from accepted as ac, applicants as a, jobs as j, users as u
            where ac.id_job = a.id_job and a.id_job = j.id_job and j.employer = u.id_user and u.id_user = ${id};`
            return db.query(userQuery + ' ' + companyQuery + ' ' + ratingAsEmployeeQuery + ' ' + ratingAsEmployerQeury);
        }
    },
    addEmployee: (employee) => {
        var insertQuery = `insert into employees `;
        var colQuery = `(username, tel, password, fullname) `;
        var valQuery = `values('${employee.username}', '${employee.tel}', '${employee.password}', '${employee.fullname}');`;
        var query = insertQuery + colQuery + valQuery;
        return db.query(query);
    },
    setUserAccountStatus: (id_user, account_status) => {
        if (account_status < -1 || account_status > 2) {
            return db.query('');
        }
        return db.query(`update users set account_status = ${account_status} where id_user = ${id_user}`)
    },
    getClientPersonalUsers: (account_status, queryName) => {
        let queryColumns = ` u.id_user, u.fullname, u.email, u.dob, u.dial, u.address, u.isBusinessUser, u.gender, u.account_status `;
        if (!queryName.replace(/\s/g, '').length) {
            queryName = '';
        }
        if (account_status >= -1 && account_status <= 2)
            return db.query(`select` + queryColumns + `from users as u where account_status = ${account_status} and isBusinessUser = 0  and (fullname like '%${queryName}%' or email like '%${queryName}%');`);
        else
            return db.query(`select` + queryColumns + `from users as u where isBusinessUser = 0  and (fullname like '%${queryName}%' or email like '%${queryName}%');`);
    },
    getClientBusinessUsers: (account_status, queryName) => {
        let queryColumns = ` u.id_user, u.fullname, u.email, u.dob, u.dial, u.address, u.isBusinessUser, u.gender, u.account_status `;
        if (!queryName.replace(/\s/g, '').length) {
            queryName = '';
        }
        if (account_status >= -1 && account_status <= 2)
            return db.query(`select` + queryColumns + `from users as u where account_status = ${account_status} and isBusinessUser = 1 and (fullname like '%${queryName}%' or email like '%${queryName}%');`);
        else
            return db.query(`select` + queryColumns + `from users as u where isBusinessUser = 1  and (fullname like '%${queryName}%' or email like '%${queryName}%');`);
    },
    deleteAnEmployee: (id_user) => {
        return db.query(`delete from employees where id_user = ${id_user}`);
    }
}