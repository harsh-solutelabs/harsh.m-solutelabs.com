import { GraphQLServer } from "graphql-yoga";
import { users } from "./demo.js";
import uuidv4 from "uuid/v4";

//scalar types - String,Boolean,Int,Float,ID
let posts = [
  {
    id: "1",
    title: "Nice book",
    body: "mehta@gmail.com",
    published: true,
    author: "1",
    commets: "1"
  },
  {
    id: "2",
    title: "harsh",
    body: "Title test",
    published: false,
    author: "2",
    commets: "2"
  },
  {
    id: "3",
    title: "harsh",
    body: "mehta@gmail.com",
    published: true,
    author: "3",
    commets: "3"
  }
];

let commets = [
  {
    id: "1",
    text: "This is working",
    author: "1",
    post: "2"
  },
  {
    id: "2",
    text: "second is not working",
    author: "2",
    post: "1"
  },
  {
    id: "3",
    text: "this is not working",
    author: "3",
    post: "3"
  },
  {
    id: "4",
    text: "this is not working",
    author: "3",
    post: "3"
  }
];


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
    commets(parent, args, ctx, info) {
      return commets;
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
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some(user => {
        return user.email === args.data.email;
      });
      console.log(emailTaken);
      if (emailTaken) {
        throw new Error("Email taken");
      }
      const user = {
        id: uuidv4(),
        ...args.data
      };

      users.push(user);
      return user;
    },
    createPost(parent, args, ctx, info) {
      const usersExists = users.some(user => {
        return user.id === args.author;
      });
      if (!usersExists) {
        throw new Error("Author not exists");
      }

      const post = {
        id: uuidv4(),
        title: args.title,
        body: args.body,
        published: args.published,
        author: args.author
      };

      posts.push(post);

      return post;
    },
    createCommet(parent, args, ctx, info) {
      const usersExists = users.some(user => {
        return user.id === args.author;
      });
      const postExists = posts.some(post => {
        return post.id === args.post && post.published === true;
      });
      console.log(usersExists);
      console.log(postExists);
      if (!usersExists || !postExists) {
        throw new Error("User not Exits and post not Exits");
      }

      const commet = {
        id: uuidv4(),
        ...args
      };

      commets.push(commet);
      return commet;
    },
    deleteUser(parent, args, ctx, info) {
      const userIndex = users.findIndex(user => {
        return user.id === args.id;
      });
      if (userIndex === -1) {
        throw new Error("User Not Exists");
      }

      const deletedUser = users.splice(userIndex, 1);

      posts = posts.filter(post => {
        const match = post.author === args.id;
        if (match) {
          commets = commets.filter(commet => {
            return commet.post !== post.id;
          });
        }
        return !match;
      });

      commets = commets.filter(commet => {
        return commet.author !== args.id;
      });

      // console.log(posts);
      return deletedUser[0];
    },
    deletePost(parent, args, ctx, info) {
      const postIndex = posts.findIndex(post => {
        return post.id === args.id;
      });
      if (postIndex === -1) {
        throw new Error("Post not Exists!");
      }
      const deletePost = posts.splice(postIndex, 1);
      commets = commets.filter(commet => {
        return commet.post !== args.id;
      });
      return deletePost[0];
    },
    deleteCommet(parent, args, ctx, info) {
      const commetIndex = commets.findIndex(commet => {
        return commet.id === args.id;
      });
      if (commetIndex === -1) {
        throw new Error("Comment to Exists");
      }
      const deleteCommet = commets.splice(commetIndex, 1);
      return deleteCommet[0];
    }
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find(user => {
        return user.id === parent.author;
      });
    },
    commets(parent, args, ctx, info) {
      return commets.filter(commet => {
        return commet.post === parent.commets;
      });
    }
  },
  Commet: {
    author(parent, args, ctx, info) {
      return users.find(user => {
        return user.id === parent.author;
      });
    },
    post(parent, args, ctx, info) {
      return posts.find(post => {
        return post.id === parent.post;
      });
    }
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter(post => {
        return post.author === parent.id;
      });
    },
    commets(parent, args, ctx, info) {
      return commets.filter(commet => {
        return commet.author === parent.id;
      });
    }
  }
};
//Server Start
const server = new GraphQLServer({
  typeDefs:'./src/schema.graphql',
  resolvers: resolvers
});
server.start(() => {
  console.log("This server is up!");
});
