const {Sequelize, DataTypes, Model} = require('sequelize');
const db = require('../db/db')

class Posts extends Model {}
 Posts.init({ // Model attributes are defined here
  header:{
    type : DataTypes.STRING
  },  
  body: {
        type: DataTypes.STRING,
        // allowNull: false
    },
    likes: {
        type: DataTypes.INTEGER
       
    },
    followers:{
      type: DataTypes.INTEGER,
    },
    img:{
        type: DataTypes.STRING
    },
    category:{
      type: DataTypes.INTEGER,
    },
    postedBy:{
      type: DataTypes.INTEGER,
    },
    comments:{
      type: DataTypes.ARRAY(DataTypes.INTEGER)
    }
}, { 
    sequelize: db,
    modelName: 'Posts'

});

// the defined model is the class itself
Posts.insert_default= function(){
  Posts.count().then(function(result){
    if(result==0){
      Posts.create({header:'1', body:'Default post',likes:1,followers:0,  category:1, img:'https://dummyimage.com/350x200/fff/aaa', comments:[], postedBy:1  })
      Posts.create({header:'2', body:'Default post',likes:1,followers:0, category:2, img:'https://dummyimage.com/350x200/fff/aaa' ,comments:[], postedBy:1 })
      Posts.create({header:'3', body:'Default post',likes:1,followers:0, category:3, img:'https://dummyimage.com/350x200/fff/aaa' ,comments:[], postedBy:1 })
      Posts.create({header:'4', body:'Default post',likes:0,followers:0, category:1, img:'https://dummyimage.com/350x200/fff/aaa' ,comments:[], postedBy:1 })
      Posts.create({header:'5', body:'Default post',likes:0,followers:0, category:2, img:'https://dummyimage.com/350x200/fff/aaa' ,comments:[], postedBy:1 })
      Posts.create({header:'6', body:'Default post',likes:0,followers:0, category:2, img:'https://dummyimage.com/350x200/fff/aaa' ,comments:[] , postedBy:1})
      Posts.create({header:'7', body:'Default post',likes:0,followers:0, category:3, img:'https://dummyimage.com/350x200/fff/aaa' ,comments:[], postedBy:1 })
      Posts.create({header:'8', body:'Default post',likes:0,followers:0, category:3, img:'https://dummyimage.com/350x200/fff/aaa' ,comments:[], postedBy:1 })
      Posts.create({header:'9', body:'Default post',likes:0,followers:0, category:1, img:'https://dummyimage.com/350x200/fff/aaa' ,comments:[] , postedBy:1})
      Posts.create({header:'10', body:'Default post',likes:0,followers:0, category:1, img:'https://dummyimage.com/350x200/fff/aaa',comments:[] , postedBy:1 })
    }
  })
  
}


module.exports = Posts;
