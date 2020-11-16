const express = require('express')
var cors = require('cors')
const app = express()

const port = 3001
const db=require('./db/db')
const router=require('./routes/routes')
const User=require('./models/User')
const Posts = require('./models/Posts')
const Categories=require('./models/Categories')
const Comments=require('./models/Comments')
const secretRouter=require('./secret_routes/secretRouter')
var bodyParser = require('body-parser')
const passport=require('passport')
require('./auth/auth')
app.use(express.json());
app.use(cors())


app.use('/',router)
app.use('/api', passport.authenticate('jwt', { session: false }), secretRouter);

app.listen(port ,() => {
  console.log(`Example app listening at http://localhost:${port}`)
})

//app.listen(port, '192.168.247.1')

db.sync().then(function(){
  User.insert_default()
  Posts.insert_default()
  Categories.insert_default()
  Comments.insert_default()
})
