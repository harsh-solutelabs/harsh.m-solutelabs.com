import { GraphQLServer } from "graphql-yoga";
import {posts,users,commets} from "./demo.js"
//scalar types - String,Boolean,Int,Float,ID


//Type Definition (Schema)
const typeDefs = `
    type Query{
        users(query:String):[User!]!
        posts(query:String):[Post!]!
        commets:[Commet!]!
        me:User!
        post:Post!
    }
    type User{
        id:ID!
        name:String!
        email:String!
        age:Int
        posts:[Post!]!
        commets:[Commet!]!
    }
    type Post{
        id:ID!
        title:String!
        body:String!
        published:Boolean!
        author:User!
        commets:[Commet!]!
    }
    type Commet{
      id:ID!
      text:String!
      author:User!
      post:Post!
    }
`;

//Resolvers
const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if (!args.query) {
        return users;
      }
      return users.filter(user => {
        return user.name
          .toLocaleLowerCase()
          .includes(args.query.toLocaleLowerCase());
      });
    },
    posts(parent, args, ctx, info) {
      if (!args.query) {
        return posts;
      }
      return posts.filter(post => {
        return (
          post.title
            .toLocaleLowerCase()
            .includes(args.query.toLocaleLowerCase()) ||
          post.body.toLocaleLowerCase().includes(args.query.toLocaleLowerCase())
        );
      });
    },
    commets(parent,args,ctx,info){
      return commets
    },
    me() {
      return {
        id: "1233",
        name: "Mike",
        email: "harsh@gmail.com"
      };
    },
    post() {
      return {
        id: "092",
        title: "GraphQL 101",
        body: "",
        published: false
      };
    }
  },
  Post:{
    author(parent,args,ctx,info){
      return users.find((user)=>{
        return user.id===parent.author
      })
    },
    commets(parent,args,ctx,info){
      return commets.filter((commet)=>{
        return commet.post === parent.commets
      })
    }
  },
  Commet:{
    author(parent,args,ctx,info){
      return users.find((user)=>{
        return user.id === parent.author
      })
    },
    post(parent,args,ctx,info){
      return posts.find((post)=>{
        return post.id === parent.post
      })
    }
  },
  User:{
    posts(parent,args,ctx,info){
      return posts.filter((post)=>{
        return post.author === parent.id
      })
    },
    commets(parent,args,ctx,info){
      return commets.filter((commet)=>{
        return commet.author === parent.id
      })
    }
  }
};

//Server Start
const server = new GraphQLServer({
  typeDefs: typeDefs,
  resolvers: resolvers
});
server.start(() => {
  console.log("This server is up!");
});
