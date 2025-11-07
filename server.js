// server.js
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rota para dados-sistema.json
app.get("/api/dados", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dados-sistema.json"));
});

// Rota Gemini
app.post("/api/gemini", async (req, res) => {
  console.log("Chave da API:", process.env.GEMINI_API_KEY ? "OK" : "FALHOU"); // ← ADICIONE ISSO
  console.log("Prompt recebido:", req.body);
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt é obrigatório" });

    const geminiPayload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    };

    const response = await fetch(
     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(geminiPayload)
      }
    );

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    res.json(data);
  } catch (err) {
    console.error("Erro no proxy:", err);
    res.status(500).json({ error: "Erro interno" });
  }
});

// Servir qualquer arquivo da pasta public/
app.get("*", (req, res) => {
  const filePath = path.join(__dirname, "public", req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send("Arquivo não encontrado");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}/manual-assistente-inicio.html`);
});








app.get("/list-models", async (req, res) => {
  const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const models = await listRes.json();
  res.json(models);
});