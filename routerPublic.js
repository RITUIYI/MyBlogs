const express = require('express');
const dbMysql = require('./db/db');
const hash = require('hash.js');
const svg = require('svg-captcha');
//创建路由容器
let router = express.Router();

//加载主界面
router.get('/', (req, res) => {
    dbMysql.getAllArticle().then((data) => {
        if (req.session.user != undefined && req.session.user.avatar == 'avatar-default') {
            req.session.user.avatar = '/public/img/' + req.session.user.avatar + '.png';
        }
        return res.render('index.html', {
            user: req.session.user,
            articles: data
        })
    }, (err) => {
        if (err) {
            return res.json('服务器忙 请稍后重试');
        }
    })
})
    //加载登录界面
    .get('/login', (req, res) => {
        return res.render('login.html');
    })
    //处理登录请求
    .post('/login', (req, res) => {
        let { email, userpwd, vcode } = req.body;
        if (vcode == req.session.vcode) {
            userpwd = hash.sha256().update(userpwd).digest('hex');
            dbMysql.getUser({ email }).then((ret) => {
                if (ret.length != 0) {
                    return dbMysql.getUser({ email, userpwd });
                }
                return res.json({
                    code: 404,
                    message: '用户不存在 请注册账户'
                })
            }, (err) => {
                if (err) {
                    return res.json('服务器忙 请稍后重试');
                }
            }).then((ret) => {
                if (ret.length != 0) {
                    if (ret[0].usable == 1) {
                        req.session.user = ret[0];
                        return res.json({
                            code: 200,
                            message: '登陆成功'
                        })
                    }
                    if (ret[0].usable == 0) {
                        return res.json({
                            code: 404,
                            message: '由于不当行为 该账户处于审核状态'
                        })
                    }
                }
                if (ret.length == 0) {
                    return res.json({
                        code: 400,
                        message: '密码错误'
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
        } else {
            res.json({
                code: 401,
                message: '验证码错误'
            })
        }
    })
    //加载注册界面
    .get('/register', (req, res) => {
        return res.render('register.html');
    })
    //处理注册请求
    .post('/register', (req, res) => {
        let { email, userpwd, nickname } = req.body;
        userpwd = hash.sha256().update(userpwd).digest('hex');
        dbMysql.getUser({ email }).then((ret) => {
            if (ret.length != 0) {
                return res.json({
                    code: 400,
                    message: '邮箱已注册'
                })
            }
            return dbMysql.getUser({ nickname });
        }, (err) => {
            if (err) {
                return res.json({
                    code: 500,
                    message: '服务器忙'
                })
            }
        }).then((ret) => {
            if (ret.length != 0) {
                return res.json({
                    code: 400,
                    message: '用户名已存在'
                })
            }
            return dbMysql.addUser({ email, userpwd, nickname });
        }, (err) => {
            if (err) {
                return res.json({
                    code: 500,
                    message: '服务器忙'
                })
            }
        }).then((ret) => {
            if (ret.affectedRows >= 1) {
                return res.json({
                    code: 200,
                    message: '注册成功'
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
    // 验证码图片路由
    .get('/vcodeimg', (req, res) => {
        //a.创建 验证码组件
        var captcha = svg.create({
            noise: 3
        });

        // 2.将 生成的 验证码字符串 存入 session 的 vcode 属性中
        req.session.vcode = captcha.text.toLowerCase();
        console.log('生成的 验证码：' + captcha.text.toLowerCase());

        // 3.设置 响应报文 的 mime 值 ，告诉浏览器 响应报文体的内容 的 数据类型
        res.type('svg');
        // 4.将 生成的 图片 发送回 浏览器
        res.status(200).send(captcha.data);
    })
//导出路由容器
module.exports = router;