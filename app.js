const express = require('express');
const session = require('express-session');
const path = require('path');
const routerPublic = require('./routerPublic');
const routerUser = require("./routerUser");
const bodyParser = require('body-parser');
let app = express();
//开放静态资源路径
app.use('/public/', express.static(path.join(__dirname, './public/')));
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')));
app.use('/uploads/', express.static(path.join(__dirname, './uploads/')));
//配置模板引擎
app.engine('html', require('express-art-template'));
app.set('views', path.join(__dirname, './views/'));
//配置body-parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
//配置session
app.use(session({
    secret: 'demo', // 对session id 相关的cookie 进行签名
    resave: true,
    saveUninitialized: false, // 是否保存未初始化的会话
    cookie: {//保持登录状态的有效期
        maxAge: 1000 * 60 * 60, // 设置 session 的有效时间，单位毫秒
    },
}));
//挂载路由容器
app.use(routerPublic);
app.use(routerUser);
//监听端口
app.listen(5544, () => {
    console.log('running...');
})