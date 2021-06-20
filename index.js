const express = require("express");
const app = express();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const bodyParser = require("body-parser");

// for env variable//
require("dotenv").config();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Hello Collective Stall!");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.raiw9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const booksCollection = client.db("bookShop").collection("books");
  const ordersCollection = client.db("bookShop").collection("orders");
  console.log("Database connection established");

  //post method////////////////////////////////
  //FOR ADDING BOOKS
  app.post("/addBook", (req, res) => {
    const newBook = req.body;
    console.log("adding a new book", newBook);
    booksCollection.insertOne(newBook).then((result) => {
      console.log(result.insertedCount);
      res.send(result.insertedCount > 0);
    });
  });
  // FOR ADDING ORDERS//
  app.post("/addOrder", (req, res) => {
    const newOrder = req.body;
    console.log("adding a new order", newOrder);
    ordersCollection.insertOne(newOrder).then((result) => {
      res.send(result.insertedCount > 0);
      console.log(result.insertedCount);
    });
  });

  //read data and show it to UI
  app.get("/books", (req, res) => {
    booksCollection.find().toArray((err, items) => {
      res.send(items);
    });
  });

  //get order data by userName //
  app.get("/orders", (req, res) => {
    ordersCollection.find({ email: req.query.email }).toArray((err, items) => {
      res.send(items);
    });
  });

  //   // buy now onclick get data//
  app.get("/book/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    booksCollection.find({ _id: id }).toArray((err, documents) => {
      console.log(documents);
      res.send(documents[0]); // must//
    });
  });

  //delete book item////////////
  app.delete("/deleteBook/:id", (req, res) => {
    const id = ObjectId(req.params.id);
    console.log("deleting this", id);
    booksCollection.findOneAndDelete({ _id: id }).then((documents) => {
      res.send(documents.deletedCount > 0);
      console.log("deleted count", documents.deletedCount);
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
