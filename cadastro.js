

document.addEventListener("keypress", function(e) {
   if(e.key === 'Enter') {
          var btn = document.querySelector("#btCad");
       btn.click();
       }
 });

function Enviar() {
    
     var total;
    
     var Nome = document.getElementById("nome").value;
     var nascimento = document.getElementById("nasc").value;
     var cpf = document.getElementById("cpf").value;
     var rg = document.getElementById("rg").value;
     var email = document.getElementById("email").value;
     var fone = document.getElementById("fone").value;
     var opiniao = document.getElementById("opiniao").value;
     var todos = [Nome,nascimento,cpf,rg,email,fone,opiniao];
     var total = todos;
     if (Nome.value != " ")  {
        total == true;     
     }
     
     
     document.getElementById("nomeRel").innerHTML = todos;//->Para colocar o resultado sem "input"
     //OU document.getElementById("resultado").value = total; -->Se for via "input" no html
   

    //alert('Obrigado Sr(a) ' + todos[0] + ' Com CPF: '+ todos[2] + ', os seus dados foram gravados');
}


