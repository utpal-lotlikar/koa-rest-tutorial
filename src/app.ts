import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as logger from 'koa-logger';
import * as bodyParser from 'koa-body';
import * as jwt from 'koa-jwt';
import * as cors from 'koa2-cors';
import "reflect-metadata";
import {createConnection} from "typeorm";
import {Brand} from 'entity/Brand';
import {Category} from 'entity/Category';

createConnection({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "ulotlikar",
    database: "easyops",
    insecureAuth : true,
    entities: [
        Brand, Category
    ],
    logging: ["query", "error", "schema"]
}).then(connection => {
    // here you can start to work with your entities
}).catch(error => console.log(error));

const app = new Koa(); 

app.use(logger());

app.use(cors({
    origin: function(ctx) {
      if (ctx.url === '/test') {
        return false;
      }
      return '*';
    },
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// error handling
app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = err.message;
      ctx.app.emit('error', err, ctx);
    }
});

// Custom 401 handling if you don't want to expose koa-jwt errors to users
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        if (401 == err.status) {
            ctx.status = 401;
            let errMessage = err.originalError ? err.originalError.message : err.message
            ctx.body = {
                error: errMessage
            };
            ctx.set("X-Status-Reason", errMessage)
        } else {
            throw err;
        }
    }
});


//Set up body parsing middleware
app.use(bodyParser({
    formidable:{uploadDir: './uploads'},
    multipart: true,
    urlencoded: true
 }));

 // x-response-time
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

// Middleware below this line is only reached if JWT token is valid
//the token data is available in ctx.state.jwtdata
app.use(jwt({ secret: '123', key: 'jwtdata'}));

const brandRouter = new Router({
    prefix: '/brands'
});
  
require('./routes/brand')({ brandRouter });

app.use(brandRouter.routes());
app.use(brandRouter.allowedMethods()); 

const categoryRouter = new Router({
    prefix: '/categories'
});
  
require('./routes/category')({ categoryRouter });

app.use(categoryRouter.routes());
app.use(categoryRouter.allowedMethods()); 

app.listen(3000);
