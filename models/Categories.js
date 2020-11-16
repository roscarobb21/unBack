const {Sequelize, DataTypes, Model} = require('sequelize');
const db = require('../db/db')

class Categories extends Model {}
 Categories.init({ // Model attributes are defined here
  name:{
    type : DataTypes.STRING
  },  
  
}, { 
    sequelize: db,
    modelName: 'Categories'

});

// the defined model is the class itself
Categories.insert_default= function(){
    Categories.count().then(function(result){
    if(result==0){
        Categories.create({name:'Request' })
        Categories.create({name:'Incident' })
        Categories.create({name:'Covid-19' })
    }
  })
  
}


module.exports = Categories;
