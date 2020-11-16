const { Sequelize } = require('sequelize');


// Option 2: Passing parameters separately (sqlite)
const db = new Sequelize({
  dialect: 'sqlite',
  storage: 'path/to/database.db'
});


try {
     db.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }


module.exports=db;
