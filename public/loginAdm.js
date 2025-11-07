// Lista de usuários e senhas
const usuarios = [
 
    { nome: "vinicius.leal", senha: "123" },
    { nome: "eduardo.guedes", senha: "123" },
   
  ];
  
  document.addEventListener("keypress", function (e) {
      if (e.key === 'Enter') {
          var btn = document.querySelector("#enviar");
          btn.click();
      }
  });
  
  function Enviar() {
    var nome = document.getElementById("usuario").value;
    var senha = document.getElementById("senha").value;
    var usuarioLogado = false;

    // Validar usuário e senha
    usuarios.forEach((usuario) => {
        if (usuario.nome === nome && usuario.senha === senha) {
            usuarioLogado = true;
            sessionStorage.setItem('usuarioAutenticado', true);  // Armazenar autenticação na sessão
            window.location.href = "manual-assistente-inicio.html";
            //alert("Usuário " + nome + " Logado");
        }
    });

    // Se nenhum usuário corresponder, exibir alerta e não recarregar a página
    if (!usuarioLogado) {
        alert("Usuário Inválido");
    }
}

  
function Sair() {
    //alert("Usuário deslogado");
    sessionStorage.clear();
    window.location.href = "manual-assistente-login.html";
}

  
  function Buscar() {
      alert("Esta função será ativada futuramente");
  }
  
