const express = require("express");
const session = require("express-session");
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

app.use(express.static("app/public"));

app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var rotas = require("./app/routes/router");
app.use("/", rotas);

app.listen(port, () => {
  console.log(`Servidor ouvindo na porta ${port}`);
});
