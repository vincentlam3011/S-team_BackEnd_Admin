var mysql = require('mysql');

var createConnection = () => {
    return mysql.createConnection({
        host: 'f2l.ctgwpvncwnsg.us-east-1.rds.amazonaws.com',
        port: '3306',
        user: 'admin',
        password: 'rootsteam',
        database: 'f2l_test_deploy',

        // host: 'localhost',
        // port: '3306',
        // user: 'root',
        // password: 'root',
        // database: 'f2l_test_deploy_03',

        dateStrings: true,
        timezone: 'Z',
        multipleStatements: true,
        typeCast: function castField(field, useDefaultTypeCasting) {
            if ((field.type === "BIT") && (field.length === 1)) {
                var bytes = field.buffer();
                return (bytes[0] === 1);
            }
            return (useDefaultTypeCasting());
        }
    })
}

module.exports = {
    query: sql => {
        return new Promise((resolve, reject) => {
            var connection = createConnection({ multipleStatements: true });
            connection.connect((err) => {
                if (err) {
                    return console.error('Error: ' + err.message);
                }
            });
            connection.query(sql, (error, result, fields) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(result);
                }
                connection.end();
            });
        });
    },
    // transaction: (query1, columns2, values2, table2) => {
    //     return new Promise((resolve, reject) => {
    //         var connection = createConnection();
    //         connection.beginTransaction(function (err) {
    //             if (err) { throw err; }
    //             connection.query(query1, function (error, results, fields) {
    //                 if (error) {
    //                     return connection.rollback(function () {
    //                         reject(error);
    //                     });
    //                 }
    //                 var insertId = results.insertId
    //                 values2 = `(${insertId}` + values2;
    //                 var query2 = `insert into ` + table2 + columns2 + ` values` + values2 + `;`;
    //                 connection.query(query2, function (error, results2, fields) {
    //                     if (error) {
    //                         return connection.rollback(function () {
    //                             throw error;
    //                         });
    //                     }
    //                     connection.commit(function (err) {
    //                         if (err) {
    //                             return connection.rollback(function () {
    //                                 reject(err);
    //                             });
    //                         }
    //                         resolve({ results, results2 });
    //                     });
    //                 });
    //             });
    //         });
    //     })
    // }
}