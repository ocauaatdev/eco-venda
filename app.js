const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser"); // Importando o body-parser
const app = express();
const port = 3000;

const env = require("dotenv").config();

// Configurar o middleware de sessão
app.use(session({
    secret: 'seuSegredoAqui', // Troque por um segredo forte e seguro
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Use secure: true em produção com HTTPS
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  next();
});

app.use(express.static("app/public"));

app.set("view engine", "ejs");
app.set("views", "./app/views");

// Aumentando o limite do body-parser
app.use(bodyParser.json({ limit: '10mb' }));  // Para requisições JSON
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));  // Para requisições urlencoded

var rotas = require("./app/routes/router");
app.use("/", rotas);

app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
});
