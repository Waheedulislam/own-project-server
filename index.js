const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

// crate Tokens
function createToken(user) {
  const token = jwt.sign(
    {
      email: user.email,
    },
    "secret",
    { expiresIn: "7d" }
  );
  return token;
}

// Verify token
function verifyToken(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];

  const verify = jwt.verify(token, "secret");
  if (!verify?.email) {
    return res.send("You are not authorized");
  }
  req.user = verify.email;

  next();
}
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a9ezat4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    // product
    const bikesProductDB = client.db("bikesProductDB");
    const bikesCollection = bikesProductDB.collection("bikesCollection");

    // categories
    const categoriesProductDB = client.db("categoriesProductDB");
    const categoriesCollection = categoriesProductDB.collection(
      "categoriesCollection"
    );

    // user
    const userDB = client.db("userDB");
    const userCollection = userDB.collection("userCollection");

    ////////////////////// Categories Collection //////////////////////

    app.get("/categories", async (req, res) => {
      const categoryData = categoriesCollection.find();
      const result = await categoryData.toArray();

      res.send(result);
    });

    ////////////////////// Product Collection //////////////////////

    //product create input field
    app.post("/bikes", verifyToken, async (req, res) => {
      const shoesData = req.body;

      const result = await bikesCollection.insertOne(shoesData);

      res.send(result);
    });

    // Get
    app.get("/bikes", async (req, res) => {
      const bikesData = bikesCollection.find();
      const result = await bikesData.toArray();

      res.send(result);
    });
    // Get singleProduct
    app.get("/bikes/:id", async (req, res) => {
      const id = req.params.id;
      const bikeData = await bikesCollection.findOne({ _id: new ObjectId(id) });

      res.send(bikeData);
    });
    // PATCH
    app.patch("/bikes/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const shoesData = await bikesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(shoesData);
    });
    // delete
    app.delete("/bikes/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const result = await bikesCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    ////////////////////// User Collection //////////////////////

    // user post database
    app.post("/user", async (req, res) => {
      const user = req.body;

      const token = createToken(user);

      const isUserExist = await userCollection.findOne({ email: user?.email });
      if (isUserExist?._id) {
        return res.send({
          status: "Success",
          message: "Successfully Login",
          token,
        });
      }
      await userCollection.insertOne(user);
      return res.send({ token });
    });

    // user edit get database
    app.get("/user/get/:id", async (req, res) => {
      const id = req.params.id;
      const result = await userCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    // user get database
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.findOne({ email });
      res.send(result);
    });

    // user profileEdit database eeee
    app.patch("/user/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const userData = req.body;

      const result = await userCollection.updateOne(
        { email },
        { $set: userData },
        { upsert: true }
      );
      res.send(result);
    });
    console.log("successfully connected to MongoDB...!");
  } catch (err) {
    console.error(err);
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Rout is working on time");
});

app.listen(port, (req, res) => {
  console.log("App is listening :", port);
});

//1 ToJJ6ZXG4c2mQIjE  own-project

//2 KSDzoAGE54LbqmFy  own-project-strid

//3 n56qRMN2nnCXbf3L
