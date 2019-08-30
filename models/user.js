let mongoose = require('mongoose');
//连接数据库
mongoose.connect('mongodb://localhost/demo');
//设置表
let Schema = mongoose.Schema;
let UserSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    created_time: {
        type: Date,
        default: Date.now
    },
    last_modified_time: {
        type: Date,
        default: Date.now
    },
    avatar: {
        type: String,
        default: '/public/img/avatar-default.png'
    },
    bio: {
        type: String,
        default: ''
    },
    birthday: {
        type: Date
    },
    gender: {
        type: Number,
        enum: [0, 1, 2],
        default: 0
    },
    status: {
        type: Number,
        enum: [0,1,2],
        default: 0
    }
})

module.exports = mongoose.model('User',UserSchema);