import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  authenticateToken,
} from "./auth/auth.js";
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

app.get("/users", authenticateToken, (req, res) => {
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
  "/users", authenticateToken, 
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
      console.log("Error ", err);
      if (err) {
        res.json(err);
      } else {
        res.json({ status: "ok", data: doc });
      }
    }
  );
});

app.put("/topic/:topicId", urlencodedParser, (req, res) => {
  const id = req.params.topicId;
  const article = req.body.article;

  console.log("POST ", id, JSON.stringify(article));
  database.update(
    { _id: id },
    {
      $set: { objectType: "topic", article: article },
    },
    {},
    (err, doc) => {
      console.log("Error ", err);
      if (err) {
        res.json(err);
      } else {
        res.json({ status: "ok", data: doc });
      }
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

// _____________АВТОРИЗАЦИЯ_______________

app.post("/login", (req, res) => {
  const { login, password } = req.body;
  console.log('Body login pas', login, password)
  const role = login === 'admin' && password === 'emf-@dmin' ? 1: 0
  database.find({ login: login, password }, function (err, item) {
    console.log("res", err, item);
    if (!err && item.length !==0) {
      const accessToken = generateAccessToken(item[0]);
      console.log("accessToken", accessToken);
      const refreshToken = generateRefreshToken(item[0]);
      console.log("refreshToken", refreshToken);
      //То есть инфу кодируем в токен
      res.json({ accessToken: accessToken, refreshToken: refreshToken, role});
    }
    else {
      res.json({err})
    }
  });
});

app.get("/secret", authenticateToken, (req, res) => {
  res.json({status: "ok"})
});

