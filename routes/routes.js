const express = require('express')

const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express()

const Posts=require('../models/Posts')


router.get('/', (req, res, next)=>{
  res.json('hello world')
})

router.get('/post', async(req, res, next)=>{
  
  let id=req.query.id===undefined?null:req.query.id
  if(id!== undefined && id !==null){
  let post =await  Posts.findOne({where:{id:id}})
  res.json(post)}else {
  let post = await Posts.findAll()
  res.json(post)
  }
  })



router.post(
    '/signup',
    passport.authenticate('signup', { session: false }),
    async (req, res, next) => {
      res.json({
        message: 'Signup successful',
        user: req.user
      });
    }
  );


/* GETS ALL USER DATA ON LOGIN AND SIGNS AN JWT TOKEN */
  router.post(
    '/login',
    async (req, res, next) => {
      passport.authenticate(
        'login',
        async (err, user, info) => {
          try {
              console.log('this is the user : ', user)
            if (err || !user) {
              const error = new Error('An error occurred.');
  
              return next(error);
            }
            req.login(
              user,
              { session: false },
              async (error) => {
                if (error) return next(error);
  
                const body = { _id: user._id, email: user.email, userName:user.userName, firstName: user.firstName, lastName: user.lastName, role: user.role, liked: user.liked_posts };
                const token = jwt.sign({ user: body }, 'TOP_SECRET', {expiresIn:'24h'});
            
                return res.json({ "token":token , "user": body});
              }
            );
          } catch (error) {
            return next(error);
          }
        }
      )(req, res, next);
    }
  );



  router.get('/latest', (req, res, next) => {
    let check = req.query.max;
    check === undefined ? check = 5 : check === "" ? check = 5 : null
    Posts.findAll({
        limit: check,
        where: { // your where conditions, or without them if you need ANY entry
        },
        order: [
            ['updatedAt', 'DESC']
        ]
    }).then(function (entries) {
        res.json(entries)
        // only difference is that you get users list limited to 1
        // entries[0]
    });
});










module.exports = router
