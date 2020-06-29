var db = require('../utils/db');

module.exports = {
    setTagStatus: (id, status) => {
        let setStatusQuery = `update tags set status = ${status} where id_tag= ${id};`;
        let removeRelatedTags = `delete from jobs_tags where id_tag = ${id};`;
        if (status == 0) {
            return db.query(removeRelatedTags + setStatusQuery);
        } else {
            return db.query(setStatusQuery);
        }
    },
    getTags: (queryName, status, isFulltext) => {
        if (!queryName.replace(/\s/g, '').length) {
            queryName = '';
        }
        let selectQuery = ``;
        if (isFulltext) {
            selectQuery = `select id_tag, name, status from tags where match(name) against('${queryName}') `;
        } else {
            selectQuery = `select id_tag, name, status from tags where name like '%${queryName}%' `;
        }
        if (status == 0 || status == 1) {
            selectQuery += `and status = ${status} `;
        }
        if (isFulltext) {
            selectQuery += `order by (match(name) against('${queryName}')) desc;`
        } else {
            selectQuery += `order by id_tag asc;`
        }
        return db.query(selectQuery);
    },
    getTagById: (id) => {
        return db.query(`select * from tags where id_tag = ${id};`);
    },
    addTag: (tag) => {
        let colQuery = `insert into tags (name) `;
        let valQuery = `values('${tag.name}');`;
        let query = colQuery + valQuery;
        return db.query(query);
    },
    updateTag: (id, updates) => {
        let updateQuery = `update tags set `;
        let initQuery = updateQuery;
        for (let i = 0; i < updates.length; i++) {
            let field = updates[i].field;
            let value = updates[i].value;
            if (value !== null && value !== '') {
                updateQuery += `${field} = '${value}'`;
            }
            if (i < updates.length - 1) {
                updateQuery += ', ';
            } else {
                updateQuery += ' ';
            }
        }
        if (updateQuery === initQuery) {
            return db.query('select 1;');
        }
        updateQuery += `where id_tag = ${id};`;
        return db.query(updateQuery);
    },
}