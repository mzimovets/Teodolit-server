import express from "express";
import bodyParser from "body-parser";
//--------NeDB---------
import Datastore from "nedb";
export const database = new Datastore("database.db");
database.loadDatabase();

const app = express();
const port = 3001;

const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ status: "хорошо" });
});

app.get("/users", (req, res) => {
  // console.log(database);
  database.find(
    {
      objectType: "user",
    },
    (err, docs) => {
      if (err) {
        console.log(err);
      } else {
        res.json({ status: "привет", result: JSON.stringify(docs) });
      }
    }
  );
  // res.json({ status: "хай" });
});

app.post(
  "/users",
  urlencodedParser,
  // (req, res, next) => {
  //   console.log("Привет!");
  //   next();
  // },
  (req, res) => {
    console.log(req.body);
    database.insert({
      objectType: "user",
      key: req.body.data?.key,
      lastName: req.body.data.lastName,
      name: req.body.data.name,
      secondName: req.body.data.secondName,
      group: req.body.data.group,
      login: req.body.data.login,
      password: req.body.data.password,
      status: req.body.data?.status,
    });
    res.json({ status: "ок" });
  }
);

app.delete("/users", (req, res) => {
  console.log(req.query.id);
  database.remove({ _id: req.query.id }, {}, (err, numRemove) => {
    if (err) {
      console.log(err);
      res.json({ err: JSON.stringify(err) });
    } else {
      res.json({ status: "ок", numRemove });
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
