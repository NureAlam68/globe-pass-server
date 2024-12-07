require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8kdu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("visaDB");
    const visaCollection = database.collection("visas");
    const applicationCollection = database.collection("applications");

    app.get("/visas", async (req, res) => {
      const cursor = visaCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/visas/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await visaCollection.findOne(query);
      res.send(result);
    });

    app.get("/latest-visas", async (req, res) => {
      const cursor = visaCollection.find().sort({ _id: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/visas/email/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await visaCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/visas", async (req, res) => {
      const newVisa = req.body;
      const result = await visaCollection.insertOne(newVisa);
      res.send(result);
    });

    app.delete("/visas/:id", async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await visaCollection.deleteOne(query);
      res.send(result);
    })

    // Fetch applications for the logged-in user
    app.get("/applications/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const result = await applicationCollection.find(query).toArray();
      res.send(result);
    });

    // Add a new application
    app.post("/applications", async (req, res) => {
      const application = req.body;
      const result = await applicationCollection.insertOne(application);
      res.send(result);
    });

    // Delete an application
    app.delete("/applications/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await applicationCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("GlobePass server is running....");
});

app.listen(port, () => {
  console.log(`GlobePass server is running on port: ${port}`);
});
