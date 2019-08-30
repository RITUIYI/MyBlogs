//加载mysql
const mysql = require('mysql');

let connect = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'demoUser'
}
module.exports = {
    //返回promise函数
    sqlPms(sql) {
        return new Promise((resolve, reject) => {
            let connection = mysql.createConnection(connect);
            connection.connect();
            connection.query(sql, (err, ret) => {
                if (err) {
                    return reject(err);
                }
                connection.end();
                return resolve(ret);
            })
        })
    },
    //获取所有文章列表
    getAllArticle() {
        let sql = `SELECT * FROM articles`;
        return this.sqlPms(sql);
    },
    //新增用户数据
    addUser({ email, nickname, userpwd }) {
        let sql = `insert into users (email,nickname,userpwd) values('${email}','${nickname}','${userpwd}')`;
        return this.sqlPms(sql);
    },
    //根据条件查询用户
    getUser({ email, nickname, userpwd, id }) {
        if (nickname == undefined && userpwd == undefined && id == undefined) {
            var sql = `SELECT * FROM users WHERE email = '${email}'`;
        } else if (email == undefined && userpwd == undefined && id == undefined) {
            var sql = `select * from users where nickname = '${nickname}'`;
        }
        else if (nickname == undefined && userpwd == undefined && email == undefined) {
            var sql = `select * from users where id = ${id}`
        } else if (nickname == undefined && id == undefined) {
            var sql = `SELECT * FROM users WHERE email = '${email}' and userpwd = '${userpwd}'`;
        } else if (nickname == undefined && email == undefined) {
            var sql = `select * from users where id = ${id} and userpwd = '${userpwd}'`
        }
        return this.sqlPms(sql);
    },
    //更新用户信息
    updateUser({ id, nickname, userpwd, bio, gender, avatar }) {
        if (userpwd == undefined) {
            if (avatar == undefined) {
                var sql = `update users set nickname='${nickname}',bio='${bio}',gender=${gender} where id = ${id}`;
            } else {
                var sql = `update users set nickname='${nickname}',avatar='${avatar}',bio='${bio}',gender=${gender} where id = ${id}`;
            }
        } else {
            var sql = `update users set userpwd = '${userpwd}' where id = ${id}`;
        }
        return this.sqlPms(sql);
    },
    //删除用户数据
    delUser({ id }) {
        let sql = `delete from users where id = ${id}`;
        return this.sqlPms(sql);
    },

    //新增文章
    addArt({ author, title, content, date, cover }) {
        let sql = `insert into articles (author,title,content,date,cover) values('${author}','${title}','${content}','${date}','${cover}')`
        return this.sqlPms(sql);
    },
    //根据id获取文章详情
    getArt(id) {
        let sql = `SELECT * FROM articles WHERE articleid = ${id}`;
        return this.sqlPms(sql);
    },
    //获取文章id获取评论列表
    getCommentById(id) {
        let sql = `SELECT * FROM comments WHERE artid = ${id}`
        return this.sqlPms(sql);
    },
    //增加评论
    addComment({ artid, username, content, creatime }) {
        let sql = `INSERT INTO comments (artid,username,content,creatime) values(${artid},"${username}","${content}",'${creatime}')`
        return this.sqlPms(sql);
    }
}

