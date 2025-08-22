// index.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
const PORT = 3000;

// Rota de teste
app.get("/", (req, res) => {
    res.send("Servidor Node está rodando!");
});

app.get("/api/months", async (req, res) => {
    try {
        const monthsPage = await axios.get("https://www.smogon.com/stats/");
        const parsedHTML = cheerio.load(monthsPage.data);

        const months = [];

        parsedHTML("a").each((i, elem) => {
            if (i != 0) months.push(parsedHTML(elem).text().trim().slice(0, -1));
        });

        res.send(months);
    } catch (error) {
        res.status(500).send("Erro ao buscar dados da Smogon");
    }
});

app.get("/api/formats/:month", async (req, res) => {
    try {
        const formatsPage = await axios.get(`https://www.smogon.com/stats/${req.params.month}/chaos/`);
        const parsedHTML = cheerio.load(formatsPage.data);

        let formats = {};

        parsedHTML("a").each((i, elem) => {
            const text = parsedHTML(elem).text().trim();
            const [format, file, extra] = text.split(".");
            if (!extra) {
                const [tier, rating] = format.split("-");
                if (!(tier in formats)) formats[tier] = [];
                formats[tier].push(rating);
            }
        });

        res.send(formats);
    } catch (error) {
        res.status(500).send("Erro ao buscar formatos do mês " + req.params.month);
    }
});

app.get("/api/formats/:month/:format", async (req, res) => {
    const url = `https://www.smogon.com/stats/${req.params.month}/chaos/${req.params.format}.json`;
    try {
        const formatStats = await axios.get(url);
        res.send(formatStats.data);
        console.log("Fetched format stats from " + url);
    } catch (error) {
        res.status(500).send("Failed to fetch format stats from " + url);
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
