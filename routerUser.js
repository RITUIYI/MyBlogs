const express = require('express');
const dbMysql = require('./db/db');
const multer = require('multer');
const hash = require('hash.js');
//创建路由容器
let router = express.Router();

//配置multer
let upload = multer({ dest: 'uploads' });

//注册中间件  用于判断  用户权限
//如果没有登录 跳转至 登录页面
router.use(function (req, res, next) {
    if (req.session.user == undefined) {
        return res.redirect('/login');
    } else {
        next();
    }
})
//加载个人中心界面
router.get('/settings/profile', (req, res) => {
    let id = req.query.id;
    dbMysql.getUser({ id }).then((ret) => {
        if (ret[0].avatar == 'avatar-default') {
            ret[0].avatar = `/public/img/${ret[0].avatar}.png`;
        }
        res.render('settings/profile.html', {
            user: ret[0]
        })
    }, (err) => {
        if (err) {
            return res.json({
                code: 404,
                message: 'id参数有误'
            })
        }
    })
})
    //处理个人中心信息编辑请求
    .post('/settings/profile', upload.single('avatar'), (req, res) => {
        let id = req.query.id;
        let { nickname, bio, gender } = req.body;
        if (req.file != undefined) {
            var avatar = `/${req.file.path.replace(/\\/g, '/')}`;
        }
        dbMysql.updateUser({ id, nickname, bio, gender, avatar }).then((ret) => {
            if (ret.affectedRows > 0) {
                res.redirect('/');
            }
        }, (err) => {
            if (err) {
                console.log(err);

                return res.json({
                    code: 400,
                    message: '参数错误'
                })
            }
        })
    })
    //加载密码设置界面
    .get('/settings/admin', (req, res) => {
        if (req.session.user != undefined && req.session.user.avatar == 'avatar-default') {
            req.session.user.avatar = '/public/img/' + req.session.user.avatar + '.png';
        }
        id = req.query.id;
        dbMysql.getUser({ id }).then((ret) => {
            res.render('settings/admin.html', {
                user: req.session.user,
                users: ret[0]
            });
        }, (err) => {
            if (err) {
                res.json({
                    code: 400,
                    message: '参数错误'
                })
            }
        })
    })
    //处理密码修改请求
    .post('/settings/admin', (req, res) => {
        let { id, oldPassword, userpwd, newPassword } = req.body;
        userpwd = hash.sha256().update(oldPassword).digest('hex');
        dbMysql.getUser({ id, userpwd }).then((ret) => {
            console.log(ret);

            if (ret.length == 0) {
                return res.json({
                    code: 400,
                    message: '原始密码不正确'
                })
            }
            userpwd = req.body.userpwd;
            if (userpwd != newPassword) {
                return res.json({
                    code: 201,
                    message: '输入的两次密码不一致,请重新设置'
                })
            }
            userpwd = hash.sha256().update(userpwd).digest('hex');
            return dbMysql.updateUser({ id, userpwd });
        }, (err) => {
            if (err) {
                res.json({
                    code: 500,
                    message: '服务器忙'
                })
            }
        }).then((ret) => {
            if (ret.affectedRows > 0) {
                return res.json({
                    code: 200,
                    message: '修改成功'
                })
            }
        }, (err) => {
            if (err) {
                return res.json({
                    code: 500,
                    message: '服务器忙'
                })
            }
        })
    })
    //处理注销账号请求
    .post('/cancel', (req, res) => {
        let id = req.body.id;
        dbMysql.delUser({ id }).then((ret) => {
            if (ret.affectedRows > 0) {
                res.json({
                    code: 200,
                    message: '账号已注销'
                })
            }
        }, (err) => {
            if (err) {
                res.json({
                    code: 500,
                    message: '服务器忙'
                })
            }
        })
    })
    //处理登出请求
    .get('/logout', (req, res) => {
        req.session.user = undefined;
        return res.redirect('/login');
    })
    //加载文章发表界面
    .get('/topics/new', (req, res) => {
        if (req.session.user != undefined && req.session.user.avatar == 'avatar-default') {
            req.session.user.avatar = '/public/img/' + req.session.user.avatar + '.png';
        }
        return res.render('topic/new.html', {
            user: req.session.user
        })
    })
    //处理文章发表请求
    .post('/new', upload.single('cover'), (req, res) => {
        let date = `${new Date().toLocaleDateString()}      ${new Date().toLocaleTimeString()}`;
        let { author, title, content } = req.body;
        let cover = req.file.path.replace(/\\/g, '/');
        dbMysql.addArt({ author, title, content, date, cover }).then((ret) => {
            if (ret.affectedRows > 0) {
                res.redirect('/');
            }
        }, (err) => {
            if (err) {
                res.json({
                    code: 500,
                    message: '服务器忙'
                })
            }
        })
    })
    //加载文章详情
    .get('/article', (req, res) => {
        let id = req.query.id;
        let user;
        let article;
        dbMysql.getArt(id).then((ret) => {
            if (req.session.user != undefined && req.session.user.avatar == 'avatar-default') {
                req.session.user.avatar = '/public/img/' + req.session.user.avatar + '.png';
            }
            user = req.session.user;
            article = ret[0];
            return dbMysql.getCommentById(id);
        }, (err) => {
            if (err) {
                res.json({
                    code: 400,
                    message: '参数错误'
                })
            }
        }).then((ret) => {
            res.render('topic/show.html', {
                user: user,
                article: article,
                comments: ret
            })
        }, (err) => {
            console.log(err);

            if (err) {
                res.json({
                    code: 400,
                    message: '参数错误'
                })
            }
        })
    })
    //发表评论
    .post('/comment', (req, res) => {
        let creatime = ` ${new Date().toLocaleDateString()}          ${new Date().toLocaleTimeString()}`;
        let { artid, username, content } = req.body;
        dbMysql.addComment({ artid, username, content, creatime }).then((ret) => {
            if (ret.affectedRows > 0) {
                res.redirect(`/article?id=${artid}`);
            }
        }, (err) => {
            if (err) {
                res.json({
                    code: 500,
                    messageL: '服务忙'
                })
            }
        })
    })
//导出路由容器
module.exports = router;