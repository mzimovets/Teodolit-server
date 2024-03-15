import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
//--------NeDB---------
import Datastore from "nedb";

export const database = new Datastore("database.db");
database.loadDatabase();

const __dirname = import.meta.dirname;
const app = express();
const port = 3001;

const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.json({ status: "хорошо" });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
    console.log("file.originalname", file.originalname);
    console.log("file.originalname", file);
  },
});
const upload = multer({ storage: storage });

app.use("/uploads", express.static(`${__dirname}/uploads`));

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

app.get("/topic/:topicId", (req, res) => {
  const topicId = req.params.topicId;
  console.log("Getting", topicId);

  database.findOne({ _id: topicId }, function (err, item) {
    console.log("res", err, item);
    res.json(item);
  });
});

app.post("/topic/:topicId", urlencodedParser, (req, res) => {
  const id = req.params.topicId;
  const article = req.body.article;

  console.log("POST ", id, JSON.stringify(article));
  database.insert(
    {
      objectType: "topic",
      _id: id,
      article: article,
    },
    (err, doc) => {
      res.json(doc);
    }
  );
});

app.post("/imageTopic", upload.single("image"), (req, res) => {
  console.log(req.file);
  var response = {
    success: 1,
    file: {
      url: "http://localhost:3001/" + req.file.path,
    },
  };
  res.json(response);
});
