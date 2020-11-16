const express = require('express');
const Posts = require('../models/Posts');
// const { where } = require('sequelize/types');
const router = express.Router();
var Sequelize = require('sequelize');
const User = require('../models/User');
const Comments=require('../models/Comments')
const algoliasearch = require("algoliasearch");
const { findOne } = require('../models/Posts');

var Op = Sequelize.Op;

router.get('/', (req, res, next) => {
    res.json({message: '1', user: req.user, token: req.query.secret_token})
});


router.get('/post?', async(req, res, next)=>{
let id=req.query.id
if(id!== undefined || id !==null){
let post =await  Posts.findOne({where:{id:id}})
res.json(post)}else {
let post = await Posts.findAll()
res.json(post)
}
})



router.get('/feed?', async (req, res, next)=>{
    let id=req.query.id;
    let user= req.user
    if(undefined===id || null ===id || ""===id){
        res.json({'server':'Id not provided'})
    }else {
    //id provided
    if(user){
    //user logged in
    let lastPost = await Posts.findOne({where:{id: id}})
    console.log('last post id ', lastPost.id)
    let posts= await  Posts.findAll({where:{updatedAt:{[Op.lt]: lastPost.updatedAt}}})
    console.log(posts)
    res.json(posts)
    }else {
    //user not logged in
    let posts= await  Posts.findAll({ limit: 5 ,  order: [
        ['updatedAt', 'DESC']
    ]})
    res.json(posts)
    }
    }
    
    })

router.get('/postComments', async(req,res, next)=>{
let id = req.query.id
if(id === undefined || id===null || id===""){
    res.json({'server':'Please provide id'})
}else {
let comments= await Comments.findAll({where:{postID:id}})
res.json(comments)
}
})






router.get('/liked_posts', async (req, res, next) => {
    let user = req.user;
    let arr=[];
    let foundUser = await User.findOne({
        where: {
            email: user.email
        }
    })
    if (foundUser) {
      let liked_list=foundUser.liked_posts
      console.log('this is liked_list ', liked_list)
        if(liked_list.toString().length === 0){
          res.json([])
          return
        }
          if(liked_list.toString().includes(',')){
            arr=liked_list.toString().split(',')
            let posts= await Posts.findAll({where: {id: {[Op.in]: arr}}})
           
           let reverse=posts.reverse()
          
          
            res.json(reverse)
          }else {
            arr.push(liked_list)
            let posts= await Posts.findAll({where: {id: {[Op.in]: arr}},  order: [
                ['updatedAt', 'DESC']
            ]})
            res.json(posts)
          }
    } else {
        res.json([{"message": "User was not found"}])
    }
});

// Posts.findAll({where: {id: {[Op.in]: arr}
router.get('/userLikes', async (req, res, next) => {
    let instance = await User.findOne({
        where: {
            email: req.user.email
        }
    })
    console.log('I passed now  ', instance.liked_posts)
    res.json({"likes": instance.liked_posts})
});
/* SAMPLE localhost:3001/api/latest?max=5 */
/*RETURNS QUERY PARAMETER NUMBER OF LATEST POSTS */
/* DEFAULTS TO 10 */

router.get('/latest', (req, res, next) => {
    let check = req.query.max;
    console.log('typeof ', typeof check)
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

/*
  User likes
  maintaining a row for user upvoted posts
  ALSO UPDATES IN POSTS TABLE
  */
router.post('/liked?', async (req, res, next) => {
    let listArr
    let id = req.query.id
    console.log('id type ', typeof id)
    console.log('id type ', id)
    if (id === undefined || id === null || id === "") { // if ID not provided in query link
        let found = await User.findOne({
            where: {
                email: req.user.email
            }
        })
        let post = found.liked_posts.toString()
        console.log('found ', post.length)

        if (post.includes(',')) {
            listArr = post.split(',')
        } else {
            listArr = post
        }
        // res.json({"err":"server error. Please provide id."})
        if (found) {
            res.json({'liked': [listArr]})
        } else {
            res.json({"err": "server error. Please provide id."})
        }

    } else {
        let UserEmail = req.user.email
        let foundUser = await User.findOne({
            where: {
                email: UserEmail
            }
        })
        if (foundUser) {
            let liked_list = foundUser.liked_posts;
            if (liked_list !== "" || liked_list !== undefined) {
                if (liked_list.toString().includes(id)) {
                    // downvote
                    // now we need to remove the like from the user list
                    // and also decrement in database Post likes

                    /*  Beautiful code, doesn't work properly :(((
   listArr= Array.from(liked_list.toString())
  while(listArr.includes(',')){
    listArr.splice(listArr.indexOf(','), 1)
    //remove all commas from array
    //if 1 element in array, doesn't execute
  }
*/
                    if (liked_list.toString().includes(',')) {
                        listArr = liked_list.split(',')
                    } else {
                        listArr = []
                        await foundUser.update({liked_posts: listArr})
                        await Posts.decrement('likes', {
                            where: {
                                id: id
                            }
                        });
                        res.json({'liked': listArr})

                        return
                    }

                    console.log('id = ', id)
                    listArr.splice(listArr.indexOf(id), 1)
                    await foundUser.update({liked_posts: listArr})
                    await Posts.decrement('likes', {
                        where: {
                            id: id
                        }
                    });
                    res.json({'server': 'post unUPVOTED', 'liked': listArr})
                } else {
                    let po = await Posts.findOne({
                        where: {
                            id: id
                        }
                    })
                    // upvote was not found in user. liked_posts, so we need to add it
                    /* Beautiful code, doesnt work properly
  if(po){
   listArr= Array.from(liked_list.toString())
  while(listArr.includes(',')){
    listArr.splice(listArr.indexOf(','), 1)
    //remove all commas from array
    //if 1 element in array, doesn't execute
  }*/
                    if (po) {
                        if (liked_list.toString().includes(',')) {
                            listArr = liked_list.split(',')
                        } else {

                            if (0 !== liked_list.toString().length) {
                                listArr = [liked_list.toString()]
                                listArr.push(id)
                                await foundUser.update({liked_posts: listArr})
                                await po.increment('likes', {
                                    where: {
                                        id: id
                                    }
                                });
                                res.json({'server': 'post UPupvoted', 'liked': listArr})
                                return
                            } else {
                                listArr = [id]
                                await foundUser.update({liked_posts: listArr})
                                await po.increment('likes', {
                                    where: {
                                        id: id
                                    }
                                });
                                res.json({'server': 'post UPupvoted', 'liked': listArr})
                                return
                            }
                        } listArr.push(id)
                        await foundUser.update({liked_posts: listArr})
                        await po.increment('likes', {
                            where: {
                                id: id
                            }
                        });
                    } else {
                        res.json({'server': 'post not found'})
                    }

                    res.json({'server': 'post UPupvoted', 'liked': listArr})
                }
            } else {
                res.json({'err': 'liked list empty or undefined'})
            }
        } else {
            res.json({'err': "server error. user email provided not valid."})
        }
    }
})

router.post('/addpost', async(req, res, next)=>{
    let uemail=req.user.email;
    let user = await User.findOne({where:{email:uemail}})
let info=req.body
const algoliasearch = require("algoliasearch");
const client = algoliasearch("2540HBTYZ8", "4ef997cce6cd05665198f153d3f6ffb2");
const index = client.initIndex("Posts");
let post = await Posts.create({header:info.header, body:info.body, likes:0, img:'https://dummyimage.com/350x200/fff/aaa', category:info.category==""?[]:info.category, followers:0, postedBy:user.id})
index.saveObject({
    objectID:post.id,
    header: info.header,
    body: info.body,
    category:info.category
  })
res.json({'server':'post created'})

})
router.get('/profile', (req, res, next) => {
    res.json({message: 'You made it to the secure route', user: req.user, token: req.query.secret_token})
});

/*
this route will get an id from the frontend in query params
1. CHECK IF param provided  1.1 if param not provided, return server error
2. if param provided check if user valid   2.1 if user invalid, return server error
3. If user valid, get following list from database
4. Check if id provided is included in list  4.1 if not included, add to list = FOLLOW
5. If included, delete from list = UNFOLLOW
---------------------

IF PARAM NOT PROVIDED, BUT USER IS VALID, RETURN FOLLOWING LIST

*/
router.post('/followed?', async (req, res, next)=>{
    console.log("FOLLOW")
let id= req.query.id;
console.log('id : ', id)
let newList
//1. CHECK IF param provided
if(undefined === id || null ===id || ""===id){
    //param not provided
    let email= req.user.email
    let found= await User.findOne({where:{email : email}})
    if(found){
    //user valid
    let list= await found.following
    if(list.toString().includes(',')){
         newList= list.split(',')
        res.json({"follow":newList})
    }else {
        list.toString().length>0?res.json({"follow":[list.toString()]}):res.json({"follow":list})
    }
    }else {
    //user invalid
    res.json({'server':'Please provide a valid user'})
    }
}else {
//ID PROVIDED
let email= req.user.email
let found=await User.findOne({where:{email:email}})
if(found){
//User found
let list=found.following;
if(list.toString().length>0){
let newList= await list.toString().split(',')
if(newList.includes(id)){
//unfollow
if(newList.length==1){
    let newNewList=[]
    found.update({following:newNewList})
    res.json({'server':'Post unfollowed', follow:newNewList})
}else {
newList.splice(newList.indexOf(id), 1)
found.update({following:newList})
    res.json({'server':'Post unfollowed', follow:newList})

}
}else {
//follow
newList.push(id)
found.update({following:newList})
res.json({'server':'Post Followed', follow:newList})
}
}else {
    //following precis
    let newList=[]
    newList.push(id)
    found.update({following:newList})
    res.json({'server':'Post Followed',  follow:newList})
}
}else {
//user not found
res.json({'server':'Please provide valid user'})
}
}
})


router.get('/userPostsInfo', async(req, res, next)=>{
let email= req.user.email;
let found= await User.findOne({where:{email:email}})

    if(found){
        //user valid
        let Follow= await found.following
        let liked = await found.liked_posts
        let resFollow;
        let resLiked;
        let newFollowList;
        let newLikedList;
     
            //user valid
            if(Follow.toString().includes(',')){
                newFollowList= Follow.split(',')
                 resFollow=[newFollowList]
            }else { 
                Follow.toString().length>0?resFollow=Follow.toString():resFollow=Follow
            }

            if(liked.toString().includes(',')){
                newLikedList= liked.split(',')
                resLiked=[newLikedList]
            }else { 
                liked.toString().length>0?resLiked=liked.toString():resLiked=liked
            }


res.json({'follow':resFollow, 'liked':resLiked})
            }else {
            //user invalid
            res.json({'server':'Please provide a valid user'})
            }
})


router.post('/postComments', async(req,res, next)=>{
    let uemail= await req.user.email
    let id = req.query.id
    let info=req.body
    
   
    if(id === undefined || id===null || id===""){
        res.json({'server':'Please provide id'})
    }else {
        let user= await User.findOne({where:{email:uemail}})
        let post = await Posts.findOne({where:{id:id}})

        if(post){
            let comm= Comments.create({
                    body:info.body,
                    postedBy:user.id,
                    postID:post.id       
            })
            res.json({'success':'true'})
        }
        else {
res.json({'server':'Please provide valid post id'})
        }
    }
    })

module.exports = router;
