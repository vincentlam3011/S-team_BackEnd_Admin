var db = require('../utils/db');
var convertBlobB64 = require('../middleware/convertBlobB64');
const { update } = require('lodash');

module.exports = {
    getEmployees: (isManager, queryName, queryNameCount) => {
        let queryColumns = ` id_user,fullname,username,tel,isManager `;
        
        let queryNameText  = '';
        if(queryName.length > 3) {
            queryNameText = `round(match(fullname) against ('${queryName}')) > ${queryNameCount/2}`;
        }
        else {
            queryNameText = `fullname LIKE '%${queryName}%'`;
        }

        if (isManager >= 0 && isManager <= 1)
            return db.query(`select` + queryColumns + `from employees where isManager = ${isManager} and (${queryNameText} or username like '%${queryName}%');`);
        else
            return db.query(`select` + queryColumns + `from employees where (${queryNameText} or username like '%${queryName}%');`);
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
            var ratingAsEmployeeQuery = `select COALESCE(avg(ac.rating_fromEmployer),0) as rating_as_employee from accepted as ac, applicants as a where a.id_applicant = ${id} and ac.id_applicant = a.id_applicant;`
            var ratingAsEmployerQeury = `select COALESCE(avg(ac.rating_fromEmployee),0) as rating_as_employer from accepted as ac, applicants as a, jobs as j
            where ac.id_job = a.id_job and a.id_job = j.id_job and j.employer = ${id};`
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
        return db.query(`
        update users set account_status = ${account_status} where id_user = ${id_user};
        select email from users where id_user = ${id_user};
        `)
    },
    rejectUserVerificationProposal: (id) => {
        let clearQuery = `
        update users set portrait = null, frontIdPaper = null, backIdPaper = null where id_user = ${id};
        select email from users where id_user = ${id};
        `;
        return db.query(clearQuery);
    },
    getClientPersonalUsers: (account_status, queryName, queryNameCount) => {
        let queryColumns = ` u.id_user, u.fullname, u.email, u.dob, u.dial, u.address, u.isBusinessUser, u.gender, u.account_status, u.identity `;
        
        let queryNameText  = '';
        if(queryName.length > 3) {
            queryNameText = `round(match(fullname) against ('${queryName}')) > ${queryNameCount/2}`;
        }
        else {
            queryNameText = `fullname LIKE '%${queryName}%'`;
        }
        if (account_status >= -1 && account_status <= 2) {
            console.log(queryNameText);
            console.log(account_status);
            return db.query(`select` + queryColumns + `from users as u where account_status = ${account_status} and isBusinessUser = 0  and (${queryNameText} or email like '%${queryName}%');`);
        }
        else
            return db.query(`select` + queryColumns + `from users as u where account_status != 0 and isBusinessUser = 0  and (${queryNameText}  or email like '%${queryName}%');`);
    },
    getClientBusinessUsers: (account_status, queryName, queryNameCount) => {
        let queryColumns = ` u.id_user, u.fullname, u.email, u.dob, u.dial, u.address, u.isBusinessUser, u.gender, u.account_status, u.identity, c.company_name, c.position `;
        
        let queryNameText  = '';
        if(queryName.length > 3) {
            queryNameText = `round(match(fullname) against ('${queryName}')) > ${queryNameCount/2}`;
        }
        else {
            queryNameText = `fullname LIKE '%${queryName}%'`;
        }

        if (account_status >= -1 && account_status <= 2)
            return db.query(`select` + queryColumns + `from users as u, companies as c where account_status = ${account_status} and c.id_user = u.id_user and isBusinessUser = 1 and (${queryNameText} or email like '%${queryName}%');`);
        else
            return db.query(`select` + queryColumns + `from users as u, companies as c where account_status != 0 and  isBusinessUser = 1 and c.id_user = u.id_user and (${queryNameText} or email like '%${queryName}%');`);
    },
    deleteAnEmployee: (id_user) => {
        return db.query(`delete from employees where id_user = ${id_user}`);
    },
    updateEmployeeInfo: (id, updates) => {
        var updateQuery = `update employees set `;
        let initQuery = updateQuery;
        for (let i = 0; i < updates.length; i++) {
            let field = updates[i].field;
            let value = updates[i].value;
            if (value !== null && value !== '') {
                updateQuery += `${field} = '${value}'`;
                if (i < updates.length - 1) {
                    updateQuery += ', ';
                } else {
                    updateQuery += ' ';
                }
            }
        }
        if (updateQuery === initQuery) {
            return db.query('select 1;');
        }
        updateQuery += `where id_user = ${id};`;
        return db.query(updateQuery);
    },
}