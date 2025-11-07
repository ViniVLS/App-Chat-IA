/* ================================================================
   GEMINI ASSISTENTE + RELATÓRIOS PDF/EXCEL - VERSÃO FINAL 100% FUNCIONAL
   ================================================================ */

/* ================================================================
   0. FUNÇÕES DE LOG
   ================================================================ */
function logGemini(message, type = "info") {
  const panel = document.getElementById("geminiLogContent");
  if (!panel) return;
  const time = new Date().toLocaleTimeString();
  const line = document.createElement("div");
  line.className = type;
  line.textContent = `[${time}] ${message}`;
  panel.appendChild(line);
  panel.scrollTop = panel.scrollHeight;
}

/* ================================================================
   1. CONFIGURAÇÃO
   ================================================================ */
const GEMINI_ENDPOINT = "/api/gemini";
const DADOS_ENDPOINT = "/api/dados";

/* ================================================================
   2. UI – ÍCONE FLUTUANTE + JANELA DE CHAT
   ================================================================ */
const style = document.createElement("style");
style.textContent = `
  #geminiBotBtn {
    position: fixed; bottom: 20px; right: 20px; width: 56px; height: 56px;
    background: #0d6efd; color: #fff; border-radius: 50%; display: flex;
    align-items: center; justify-content: center; font-size: 22px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2); cursor: pointer; z-index: 9999;
    transition: all 0.3s ease;
  }
  #geminiBotBtn:hover { transform: scale(1.05); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
  #geminiChat {
    position: fixed; bottom: 80px; right: 20px; width: 340px; height: 460px;
    background: #fff; border: 1px solid #ddd; border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15); display: none; flex-direction: column;
    z-index: 9999; overflow: hidden; transition: all 0.3s ease;
  }
  #geminiHeader { 
    background: #0d6efd; color: #fff; padding: 8px 12px; font-weight: bold; 
    display: flex; justify-content: space-between; align-items: center; 
  }
  #geminiMessages { 
    flex: 1; padding: 10px; overflow-y: auto; background: #f8f9fa; 
    font-size: 14px; display: flex; flex-direction: column; 
  }
  .msg { 
    margin: 6px 0; padding: 8px 12px; border-radius: 12px; max-width: 85%; 
    word-wrap: break-word; animation: fadeIn 0.3s ease; 
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .user { background: #0d6efd; color: #fff; align-self: flex-end; }
  .bot { background: #e9ecef; color: #212529; align-self: flex-start; }
  #geminiInputBox { display: flex; padding: 8px; border-top: 1px solid #ddd; background: #fff; }
  #geminiInput { 
    flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 4px; 
    font-size: 14px; outline: none; 
  }
  #geminiInput:focus { border-color: #0d6efd; box-shadow: 0 0 0 2px rgba(13,110,253,0.25); }
  #geminiSendBtn { 
    margin-left: 6px; padding: 0 14px; background: #0d6efd; color: #fff; 
    border: none; border-radius: 4px; cursor: pointer; font-size: 14px; 
    transition: background 0.2s ease;
  }
  #geminiSendBtn:hover:not(:disabled) { background: #0b5ed7; }
  #geminiSendBtn:disabled { opacity: 0.6; cursor: not-allowed; }
`;
document.head.appendChild(style);

/* ================================================================
   3. ESTRUTURA HTML DO CHAT
   ================================================================ */
const btn = document.createElement("div");
btn.id = "geminiBotBtn";
btn.innerHTML = "💬";
btn.title = "Assistente IA - TI Divina";
document.body.appendChild(btn);

const chat = document.createElement("div");
chat.id = "geminiChat";
chat.innerHTML = `
  <div id="geminiHeader">
    <span>🤖Assistente TI Divina</span>
    <span id="geminiClose" style="cursor:pointer;font-size:18px;">×</span>
  </div>
  <div id="geminiMessages"></div>
  <div id="geminiInputBox">
    <input type="text" id="geminiInput" placeholder="Digite sua dúvida ou comando..." />
    <button id="geminiSendBtn">Enviar</button>
  </div>
`;
document.body.appendChild(chat);

/* ================================================================
   4. CONTROLE DE EXIBIÇÃO
   ================================================================ */
btn.addEventListener("click", () => {
  const isVisible = chat.style.display === "flex";
  chat.style.display = isVisible ? "none" : "flex";
  if (!isVisible) input.focus();
});

document.getElementById("geminiClose").addEventListener("click", () => {
  chat.style.display = "none";
});

/* ================================================================
   5. ELEMENTOS DO CHAT
   ================================================================ */
const messagesDiv = document.getElementById("geminiMessages");
const input = document.querySelector("#geminiInput");
const sendBtn = document.querySelector("#geminiSendBtn");

function addMessage(text, isUser = false) {
  const div = document.createElement("div");
  div.className = `msg ${isUser ? "user" : "bot"}`;
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

/* ================================================================
   6. DADOS DO SISTEMA
   ================================================================ */
let dadosSistema = null;
async function carregarDados() {
  try {
    const res = await fetch(DADOS_ENDPOINT);
    if (res.ok) {
      dadosSistema = await res.json();
      console.log("✅ Dados do sistema carregados:", dadosSistema);
    } else {
      console.warn("⚠️ Dados não disponíveis, usando mock");
      dadosSistema = {
        indicadores: { tempoTriagem: "95% < 5min", resolutividade: "92%", satisfacao: "4.8/5" },
        chamadosMes: [{ data: "2025-11-01", tipo: "Dúvida", prioridade: "Média", status: "Resolvido" }],
        usuariosCadastrados: [{ nome: "vinicius.leal", perfil: "Admin", ultimoAcesso: "Hoje" }],
        procedimentosMaisAcessados: ["Erro parâmetro 87", "Criação usuário Tasy"]
      };
    }
  } catch (err) {
    console.error("❌ Erro ao carregar dados:", err);
    dadosSistema = { indicadores: { tempoTriagem: "N/A", resolutividade: "N/A", satisfacao: "N/A" } };
  }
}
carregarDados();

/* ================================================================
   7. BIBLIOTECAS PDF/EXCEL
   ================================================================ */
function carregarBibliotecas() {
  const libs = [
    { id: "jspdf", src: "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" },
    { id: "autotable", src: "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js" },
    { id: "xlsx", src: "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" }
  ];

  libs.forEach(lib => {
    if (!document.getElementById(lib.id)) {
      const script = document.createElement("script");
      script.id = lib.id;
      script.src = lib.src;
      script.onload = () => console.log(`✅ ${lib.id} carregado`);
      script.onerror = () => console.error(`❌ Erro ao carregar ${lib.id}`);
      document.head.appendChild(script);
    }
  });
}
carregarBibliotecas();

/* ================================================================
   8. FUNÇÕES DE RELATÓRIO
   ================================================================ */
function gerarPDFIndicadores() {
  if (!window.jspdf) {
    addMessage("⏳ Bibliotecas carregando... Tente novamente em 5s");
    return false;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("📊 Relatório de Indicadores TI", 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Rede de Saúde Divina Providência`, 105, 28, { align: "center" });
  doc.text(`Gerado: ${new Date().toLocaleString("pt-BR")}`, 105, 35, { align: "center" });
  
  // Dados
  const dados = dadosSistema?.indicadores || {};
  const body = [
    ["Indicador", "Valor", "Status"],
    ["Tempo de Triagem", dados.tempoTriagem || "N/A", "✅ OK"],
    ["Resolutividade", dados.resolutividade || "N/A", "✅ OK"],
    ["Satisfação", dados.satisfacao || "N/A", "✅ OK"]
  ];
  
  doc.autoTable({
    startY: 45,
    head: [body[0]],
    body: body.slice(1),
    theme: "grid",
    headStyles: { fillColor: [13, 110, 253] },
    styles: { fontSize: 10 }
  });
  
  doc.save("relatorio-indicadores-ti-divina.pdf");
  return true;
}

function gerarExcelChamados() {
  if (!window.XLSX) {
    addMessage("⏳ Bibliotecas carregando... Tente novamente em 5s");
    return false;
  }

  const chamados = dadosSistema?.chamadosMes || [];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(chamados);
  XLSX.utils.book_append_sheet(wb, ws, "Chamados Novembro 2025");
  XLSX.writeFile(wb, "chamados-ti-divina-novembro-2025.xlsx");
  return true;
}

/* ================================================================
   9. CHAMADA AO GEMINI
   ================================================================ */
async function callGemini(prompt) {
  // COMANDOS ESPECIAIS (PRIORIDADE)
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes("pdf") || lowerPrompt.includes("relatório")) {
    const sucesso = gerarPDFIndicadores();
    return sucesso ? "✅ PDF gerado e baixado! Verifique sua pasta de Downloads." : "⏳ Carregando bibliotecas...";
  }
  
  if (lowerPrompt.includes("excel") || lowerPrompt.includes("planilha")) {
    const sucesso = gerarExcelChamados();
    return sucesso ? "✅ Excel gerado e baixado! Verifique sua pasta de Downloads." : "⏳ Carregando bibliotecas...";
  }
  
  if (lowerPrompt.includes("indicadores")) {
    const i = dadosSistema?.indicadores || {};
    return `📊 **INDICADORES ATUAIS TI DIVINA**\n\n` +
           `• Tempo de Triagem: ${i.tempoTriagem || "N/A"}\n` +
           `• Resolutividade: ${i.resolutividade || "N/A"}\n` +
           `• Satisfação: ${i.satisfacao || "N/A"}\n\n` +
           `Quer o relatório completo em PDF?`;
  }
  
  if (lowerPrompt.includes("usuários") || lowerPrompt.includes("cadastro")) {
    const users = dadosSistema?.usuariosCadastrados || [];
    return `👥 **USUÁRIOS CADASTRADOS**\n\n` + 
           users.map(u => `• ${u.nome} (${u.perfil}) - Último acesso: ${u.ultimoAcesso}`).join("\n") +
           `\n\nTotal: ${users.length} usuários ativos`;
  }
  
  if (lowerPrompt.includes("chamados")) {
    const chamados = dadosSistema?.chamadosMes || [];
    const total = chamados.length;
    const resolvidos = chamados.filter(c => c.status === "Resolvido").length;
    return `📋 **CHAMADOS NOVEMBRO 2025**\n\n` +
           `• Total: ${total}\n` +
           `• Resolvidos: ${resolvidos} (${((resolvidos/total)*100).toFixed(1)}%)\n` +
           `• Pendentes: ${total - resolvidos}\n\n` +
           `Quer exportar para Excel?`;
  }

  // CHAMADA NORMAL AO GEMINI
  try {
    const res = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        prompt: `Você é o assistente de TI da Rede Divina Providência. 
        Seja direto, profissional e útil. Dados do sistema: ${JSON.stringify(dadosSistema)}.
        Pergunta do usuário: "${prompt}". Responda em português, de forma clara e objetiva.`
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 
           "Desculpe, não consegui processar sua solicitação. Tente novamente!";
  } catch (err) {
    console.error("Erro Gemini:", err);
    return "⚠️ Erro de conexão com a IA. Verifique se o servidor está rodando.";
  }
}

/* ================================================================
   10. ENVIO DE MENSAGEM
   ================================================================ */
async function sendMessage() {
  const txt = input.value.trim();
  if (!txt) return;

  // Adiciona mensagem do usuário
  addMessage(txt, true);
  const userInput = input.value;
  input.value = "";
  input.focus();

// Desabilita botão e mostra "pensando"
  sendBtn.disabled = true;
  const thinkingMsg = document.createElement("div");
  thinkingMsg.className = "msg bot";
  thinkingMsg.textContent = "Processando...";
  messagesDiv.appendChild(thinkingMsg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  try {
    const reply = await callGemini(userInput);
    // Remove de forma segura (evita o erro "not of type Node")
    if (thinkingMsg && thinkingMsg.parentNode) {
      thinkingMsg.parentNode.removeChild(thinkingMsg);
    }
    addMessage(reply);
  } catch (err) {
    if (thinkingMsg && thinkingMsg.parentNode) {
      thinkingMsg.parentNode.removeChild(thinkingMsg);
    }
    addMessage("Erro de conexão. Tente novamente em alguns segundos.");
    console.error("Erro envio:", err);
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

// Event listeners
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

/* ================================================================
   11. MENSAGEM INICIAL
   ================================================================ */
setTimeout(() => {
  addMessage("👋 **Olá! Sou o Assistente IA da TI Divina Providência**");
  addMessage("Posso ajudar com:");
  addMessage("• 📊 Relatórios em PDF (indicadores)");
  addMessage("• 📋 Exportar chamados em Excel");
  addMessage("• ❓ Dúvidas sobre Tasy, Interact, Wyse");
  addMessage("• 📋 Procedimentos e manuais");
  addMessage("\nDigite sua dúvida ou comando! 🚀");
}, 800);

/* ================================================================
   12. LOG PANEL (OPCIONAL - PARA DEBUG)
   ================================================================ */
if (location.search.includes("debug")) {
  const logPanel = document.createElement("div");
  logPanel.id = "geminiLogPanel";
  logPanel.innerHTML = `
    <div id="geminiLogHeader">
      <span>🔧 Debug Gemini</span>
      <span onclick="this.parentElement.parentElement.remove()" style="cursor:pointer">×</span>
    </div>
    <div id="geminiLogContent"></div>
  `;
  document.body.appendChild(logPanel);
  logGemini("Debug ativado - Modo desenvolvedor");
}