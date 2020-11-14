const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const connection = require("./database/database");
const Question = require("./database/Question");
const Answer = require("./database/Answer");

// Database
connection
  .authenticate()
  .then(() => {
    console.log("Conectado com sucesso!");
  })
  .catch((err) => {
    console.log("Houve um erro " + err);
  });

//Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Arquivos estáticos
app.use(express.static("public"));
// Template Engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Rotas
app.get("/", (req, res) => {
  Question.findAll({ raw: true, order: [["id", "DESC"]] }).then((questions) => {
    res.render("index", { questions: questions });
  });
});

app.get("/ask", (req, res) => {
  res.render("ask");
});

app.post("/savequestion", (req, res) => {
  const title = req.body.title;
  const description = req.body.description;

  Question.create({
    title: title,
    description: description,
  }).then(() => {
    res.redirect("/");
  });
});

app.get("/question/:id", (req, res) => {
  const id = req.params.id;

  Question.findOne({
    where: { id: id },
  }).then((question) => {
    if (question != undefined) {
      Answer.findAll({
        where: { questionId: question.id },
        order: [["id", "DESC"]],
      }).then((answers) => {
        res.render("question", {
          question: question,
          answers: answers,
        });
      });
    } else {
      res.redirect("/");
    }
  });
});

app.post("/answer", (req, res) => {
  const body = req.body.corpo;
  const question = req.body.question;

  Answer.create({
    corpo: body,
    questionId: question,
  })
    .then(() => {
      res.redirect("/question/" + question);
    })
    .catch((err) => {
      console.log("Esse é o erro -> " + err);
    });
});

const PORT = process.env.PORT || 5500;

app.listen(PORT);
