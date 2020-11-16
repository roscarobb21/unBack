const {Sequelize, DataTypes, Model} = require('sequelize');
const db = require('../db/db')

class User extends Model {} User.init({
    // Model attributes are defined here
    email: {
        type: DataTypes.STRING,
        unique: true
    },

    userName: {
        type: DataTypes.STRING
    },
    firstName: {
        type: DataTypes.STRING,
        // allowNull: false
    },
    lastName: {
        type: DataTypes.STRING

    },
    passHash: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.BOOLEAN
    },
    liked_posts: {
        type: DataTypes.ARRAY(DataTypes.INTEGER)
    },
    following:{
        type: DataTypes.ARRAY(DataTypes.INTEGER)
    },
    comments:{
        type: DataTypes.ARRAY(DataTypes.INTEGER)
    },
}, {
    sequelize: db,
    modelName: 'User'

});

// the defined model is the class itself
User.insert_default = function () {
    User.count().then(function (result) {
        if (result == 0) {
            User.create({
                email: 'admin@admin.com',
                userName: 'admin',
                firstName: 'admin',
                lastName: 'admin',
                passHash: 'admin',
                role: true, 
                liked_posts:[1,2,3], 
                following:[],
                comments:[]
            })
        }
    })

}


User.isValidPassword = function (user, password) { /*
  Use bcrypt or smth else */
    if (user.passHash == password) {
        return true
    } else {
        return false
    }

}
module.exports = User;
