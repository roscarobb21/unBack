const {Sequelize, DataTypes, Model} = require('sequelize');
const db = require('../db/db')

class Comments extends Model {}
Comments.init({ // Model attributes are defined here
  body:{
    type : DataTypes.STRING
  },  
  postedBy:{
    type : DataTypes.INTEGER
  },
  postID:{
    type : DataTypes.INTEGER
  }
  
}, { 
    sequelize: db,
    modelName: 'Comments'

});

// the defined model is the class itself
Comments.insert_default= function(){
    Comments.count().then(function(result){
    if(result==0){
        Comments.create({body:'Comment', postedBy:1 , postID:1})
        Comments.create({body:'Comment', postedBy:1 , postID:1 })
        Comments.create({body:'Comment', postedBy:1 , postID:1 })
    }
  })
  
}


module.exports = Comments;
