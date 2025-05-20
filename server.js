const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static("public"));

app.post("/update-locations", (req, res) => {
  console.log(req.body);
  const newLocations = req.body;
  fs.writeFile(
    path.join(__dirname, "js", "overnachtingen.json"),
    JSON.stringify(newLocations, null, 2),
    (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Failed to update locations");
      } else {
        res.json(newLocations);
      }
    }
  );
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
