const axios = require("axios");
const { ApolloServer, gql } = require('apollo-server');
const lodash = require("lodash");
const uuid = require("node-uuid");
const bluebird = require("bluebird");
const flat = require("flat");
const unflatten = flat.unflatten;
const redis = require("redis");
const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype)


const typeDefs = gql`
    type ImagePost {
        id: ID!
        url: String!
        poster_name: String!
        description: String
        user_posted: Boolean!
        binned: Boolean!
    }

    type Query {
        unsplashImages(pageNum: Int): [ImagePost]
        binnedImages: [ImagePost]
        userPostedImages: [ImagePost]
        dummyImagePosts: [ImagePost]
        dummyImagePost(id: ID, url: String, poster_name: String, description: String, user_posted: Boolean, binned: Boolean): ImagePost
    }

    type Mutation {
        uploadImage(
            url: String!
            poster_name: String!
            description: String
            user_posted: Boolean!
            binned: Boolean!
        ): ImagePost
        updateImage(
            id: ID!
            url: String
            poster_name: String
            description: String
            user_posted: Boolean
            binned: Boolean
        ): ImagePost
        deleteImage(
            id: ID!
        ): ImagePost
        addDummyImagePost(
            url: String!
            poster_name: String!
            description: String
            user_posted: Boolean!
            binned: Boolean!
        ): ImagePost
        editDummyImagePost(
            id: ID!
            url: String
            poster_name: String
            description: String
            user_posted: Boolean
            binned: Boolean
        ): ImagePost
        removeDummyImagePost(
            id: ID!
        ): ImagePost
    }
`;


// DATA SET
const dummyImagePosts = [
    {
        id: uuid.v4(),
        description: 'this is dummy imgae post number 1'
    },
    {
        id: uuid.v4(),
        description: 'this is dummy imgae post number 2'
    },
];
let usrUpload = {
    imgPostLst:[]
}
async function runThisXd(){
    await client.setAsync("usrUpload", JSON.stringify(usrUpload));
// let uUFromRedis = JSON.parse(await client.getAsync("usrUpload"));
}  
runThisXd();


// Data looks like
// [{
//     id: "asdf",
//     description: "asdf",
//     alt_description: "asdf",
//     urls: {
//         regular: "https://images........"
//     }
// },{
// }]
async function getData(pageNum) {
    try {
        if(!pageNum){
            pageNum=0;
        }
        const response = await axios.get(
            `https://api.unsplash.com/photos/?client_id=2fad4866e6856e8028cf0a680eff722084a99064792955ef88f4e6ec4e93a476&page=${pageNum}`
          );
        const resdata = response.data;
        let imgposts = resdata.map( async resobj => {
            // check in redis if the images is binned
            let isbinned = false;
            let objFromRedis = JSON.parse(await client.getAsync("usrUpload")); // object
            let bimg = objFromRedis.imgPostLst.filter(e => e.id === resobj.id);
            if(bimg.length > 0){ // already added to bin
                isbinned = true;
            }
            let newimgpost = {
                id: resobj.id,
                url: resobj.urls.regular,
                poster_name: resobj.user.username,
                description: resobj.alt_description,
                user_posted: false,
                binned: isbinned
            }
            return newimgpost
        });
        return imgposts;
    } catch (error) {
        console.log (error);
    }
}

// RESOLVER
const resolvers = {
    Query: {
        dummyImagePosts: () => dummyImagePosts,
        dummyImagePost: (_, args) => dummyImagePosts.filter(e => e.id === args.id)[0],
        unsplashImages: (_, args) => getData(args.pageNum), // (pageNum: INT)
        binnedImages: async () => (JSON.parse(await client.getAsync("usrUpload"))).imgPostLst.filter(e => e.binned === true), // binned images from cache
        userPostedImages: async () => (JSON.parse(await client.getAsync("usrUpload"))).imgPostLst.filter(e => e.user_posted === true) // retreive from cache
    },
    Mutation: {
        uploadImage: async (_, args) => {
            const newImagePost = {
                id: uuid.v4(),
                url: args.url,
                poster_name: args.poster_name,
                description: args.description,
                user_posted: true,
                binned: false
            };
            let objFromRedis = JSON.parse(await client.getAsync("usrUpload"));
            // client.lpush(["usrUpload", newImagePost, newImagePost2]);
            objFromRedis.imgPostLst.push(newImagePost);
            await client.setAsync("usrUpload", JSON.stringify(objFromRedis));
            return newImagePost;
        },
        updateImage: async (_, args) => { // only change binned
            let ogImagePost;
            if(args.user_posted){ // look in redis cache
                let objFromRedis = JSON.parse(await client.getAsync("usrUpload"));
                ogImagePost = objFromRedis.imgPostLst.filter(e => e.id === args.id)[0]; // filter post from cache
                objFromRedis.imgPostLst = objFromRedis.imgPostLst.filter(e => e.id !== args.id); // remove the one we are changing, later add it back
                ogImagePost.binned = !(ogImagePost.binned); // only need to toggle, since not removing from cache
                objFromRedis.imgPostLst.push(ogImagePost); // add updated obj back to list
                await client.setAsync("usrUpload", JSON.stringify(objFromRedis)); // add to cache
            } else { // post from API
                if(args.binned){ // if is binned and since is from API, no need to change content, JUST delete from cache
                    let objFromRedis = JSON.parse(await client.getAsync("usrUpload")); // object
                    objFromRedis.imgPostLst = objFromRedis.imgPostLst.filter(e => e.id !== args.id); // filter posts with id not equal to args.id. AKA filter out posts with id === args.id
                    await client.setAsync("usrUpload", JSON.stringify(objFromRedis)); // update cache
                } else { // if not binned and is from API, get from API, then 1. set binned to true 2. add to cache
                    const response = await axios.get(
                        `https://api.unsplash.com/photos/${args.id}?client_id=2fad4866e6856e8028cf0a680eff722084a99064792955ef88f4e6ec4e93a476`
                      );
                    const resdata = response.data;
                    ogImagePost = {
                        id: resdata.id,
                        url: resdata.urls.regular,
                        poster_name: resdata.user.username,
                        description: resdata.alt_description,
                        user_posted: false,
                        binned: true // setting binned to true
                    } 
                    let objFromRedis = JSON.parse(await client.getAsync("usrUpload"));
                    objFromRedis.imgPostLst.push(ogImagePost); // add to list in obj
                    await client.setAsync("usrUpload", JSON.stringify(objFromRedis)); // add to cache
                }
            }
            return ogImagePost;
        },
        deleteImage: async (_, args) => { // given id of post. ALWAYS user posted
            let objFromRedis = JSON.parse(await client.getAsync("usrUpload")); // object
            let returnDeleted = objFromRedis.imgPostLst.filter(e => e.id === args.id)[0]; // save for return
            objFromRedis.imgPostLst = objFromRedis.imgPostLst.filter(e => e.id !== args.id); // filter posts with id not equal to args.id. AKA filter out posts with id === args.id
            await client.setAsync("usrUpload", JSON.stringify(objFromRedis)); // update cache
            return returnDeleted;
        },
        addDummyImagePost: (_, args) => {
            const newImagePost = {
                id: uuid.v4(),
                url: args.url,
                poster_name: args.poster_name,
                description: args.description,
                user_posted: args.user_posted,
                binned: args.binned
            };
            dummyImagePosts.push(newImagePost);
            return newImagePost;
        },
        removeDummyImagePost: (_, args) => {
            return lodash.remove(dummyImagePosts, e => e.id == args.id);
        },
        editDummyImagePost: (_, args) => {
            let newImagePost;
            dummyImagePosts = dummyImagePosts.map(
                e => {
                    if (e.id === args.id) {
                        if (args.url){
                            e.url = args.url;
                        }
                        if (args.poster_name){
                            e.poster_name = args.poster_name;
                        }
                        if (args.description){
                            e.description = args.description;
                        }
                        if (args.user_posted){
                            e.user_posted = args.user_posted;
                        }
                        if (args.binned){
                            e.binned = args.binned;
                        }
                        newImagePost = e;
                        return e;
                    }
                    return e;
                }
            );
            return newImagePost;
        }
    }
};



// SERVER
const server = new ApolloServer({ typeDefs, resolvers });

// localhost:4000
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}    `);
});