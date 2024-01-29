import express from "express";

const app = express();
const port = 3001;

app.get("/", (req, res) => {
  res.json({ status: "ок" });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
