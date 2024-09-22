import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import passport from "passport";
import session from "express-session";
import connectMongodbSession from "connect-mongodb-session";
import { buildContext } from "graphql-passport";
import { connectDB } from "./db/dbconfig.js";
import mergedResolvers from "./resolvers/index.js";
import mergedTypeDefs from "./typeDef/index.js";
import { configurePassport } from "./passport/passport.js";
// The GraphQL schema
const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;
dotenv.config();
configurePassport()
const app = express();
const httpServer = http.createServer(app);
const MongoDBStore = connectMongodbSession(session);
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});
store.on("err", (err) => {
  console.log(err, "error in db store");
});
const __dirname = path.resolve();
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      http: true,
    },
    store: store,
  })
);
app.use(passport.initialize());
app.use(passport.session());
// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () => "world",
  },
};

const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();
app.use(
	"/graphql",
	cors({
		origin: "http://localhost:3000",
		credentials: true,
	}),
	express.json(),
	expressMiddleware(server, {
		context: async ({ req, res }) => buildContext({ req, res }),
	})
);

app.use(express.static(path.join(__dirname,"frontend/dist")))

app.get('*',(req,res)=>{
  res.sendFile(path.join(__dirname,'frontend/dist','index.html'))
})



await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
await connectDB();

console.log(`🚀 Server ready at http://localhost:4000/graphql`);
