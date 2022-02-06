import express from "express"
import session from "express-session"
import bcrypt from "bcrypt"
import pkg from 'mongodb';
import path from "path"
const { MongoClient } = pkg;
// import { MongoClient} from "mongodb"

let client = new MongoClient("mongodb://localhost:27017");

(async function() {
    await client.connect();

    const cleanup = (event) => {
        client.close();//close connect
        process.exit();//exit node project
    }

    process.on("SIGINT",cleanup);
    process.on("SIGTERM",cleanup);

    const db = client.db("example");
    const collection = db.collection("posts");

    // await collection.insertOne({name:"joe"});
    // await collection.updateOne({name:"joe"},{$set:{name:"fred"}});

    const app = express();

    app.use(express.json());
    app.use(express.urlencoded({extended:true}));
    app.use(session({
        secret:process.env.SECRET,
        resave:false,
        saveUninitialized:false
    }))

    app.use(express.static("./client/build"));

    app.get("/get",async (req,res) => {
        const findResult = await collection.find().toArray();
        if(findResult.length > 0) {
            res.send([...findResult])
        } else {
            res.send("No Data")
        }
    })

    app.delete("/delete",async (req,res) => {
        await collection.deleteMany({})
        res.send("All File Deleted")
    })

    app.post("/postForm",async (req,res) => {
        await collection.insertOne(req.body)
        res.redirect("/")
    })

    app.post("/register",async (req,res) => {
        const {name,email,password} = req.body;
        let bcryptPassword = await bcrypt.hash(password,10);
        collection.insertOne({
            name,
            email,
            password:bcryptPassword
        });
        res.redirect("/")
    })

    app.listen(process.env.PORT,() => {
        console.log("i work in " + process.env.PORT + " port");
    })

})();







