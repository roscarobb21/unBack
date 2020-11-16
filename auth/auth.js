const { response } = require('express');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;


passport.use(
    'signup',
    new localStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        confirmField: 'confirm',
        passReqToCallback:true
      },
      async (req, email, password, done) => {
          let em=req.body.email;
          let pass=req.body.password;
          let confirm=req.body.confirm;

          if(pass==confirm){
        try {
          const found=await User.findOne({where:{email:em}})
          console.log('found : ', found)
          if(!found){
          const user = await User.create({ email:em, passHash:pass, liked_posts:[], following:[], role:false });
          return done(null, user);
          }else {
            return done(null, 'Email already taken')
          }
         return done(null)
        } catch (error) {
          done(error);
        }
      } else {
          return done(null, {"message":"passwords do not match"})
      }
    }
    )
  );


  passport.use(
    'login',
    new localStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback:true
      },
      async (req, email, password, done) => {

        try {
            let email=req.body.email;
let password= req.body.password;
console.log('email : ', email)
console.log('password : ', password)
          const user = await User.findOne({ where: { email: email } });
           
          if (!user) {
            
            return done(null, false, { message: 'User not found' });
          }
          
          var validate = await User.isValidPassword(user, password);
  
          if (!validate) {
           
               return done(null, false, { message: 'Wrong Password' });
          }
         
          return done(null, user, { message: 'Logged in Successfully' });
        
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    new JWTstrategy(
      {
        secretOrKey: 'TOP_SECRET',
       jwtFromRequest: ExtractJWT.fromHeader('token')
      },
      async (token, done) => {
        try {
          return done(null, token.user);
        } catch (error) {
          done(error);
        }
      }
    )
  );