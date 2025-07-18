document.addEventListener("DOMContentLoaded", function () {
  const formLogin = document.getElementById("form-login");
  const inputEmail = document.getElementById("email");
  const inputSenha = document.getElementById("senha");
  const btnToggleSenha = document.getElementById("btn-toggle-senha");
  const checkboxLembrar = document.getElementById("lembrar");
  const alertError = document.getElementById("login-error");

  const savedEmail = localStorage.getItem("savedEmail");
  if (savedEmail) {
    inputEmail.value = savedEmail;
    checkboxLembrar.checked = true;
  }

  btnToggleSenha.addEventListener("click", function () {
    if (inputSenha.type === "password") {
      inputSenha.type = "text";
      btnToggleSenha.innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
      inputSenha.type = "password";
      btnToggleSenha.innerHTML = '<i class="bi bi-eye"></i>';
    }
  });

  formLogin.addEventListener("submit", async function (event) {
  event.preventDefault();
  alertError.classList.add("d-none");

  const email = inputEmail.value;
  const senha = inputSenha.value;

  try {
    const response = await fetch(`../link/endp.php/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email: email, senha: senha })
    });

    const json = await response.json();

    if (json.ok) {
      alertError.style.backgroundColor = 'green';
      alertError.style.color = 'black';
      alertError.textContent = "Conexão bem-sucedida. Bem-vindo, " + json.nome + "!";
      alertError.classList.remove("d-none");

      if (checkboxLembrar.checked) {
        localStorage.setItem("savedEmail", email);
      } else {
        localStorage.removeItem("savedEmail");
      }

      setTimeout(() => {
        if (json.permissao === "mec") {
          window.location.href = "utilizador.html";
        } else if (json.permissao === "manager") {
          window.location.href = "admin.html";
        } else {
          window.location.href = "pesquisar.html";
        }
      }, 1500);
    } else {
      alertError.textContent = "Credenciais inválidas.";
      alertError.classList.remove("d-none");
    }
  } catch (error) {
    alertError.textContent = "Erro ao tentar fazer login. Tente novamente mais tarde.";
    alertError.classList.remove("d-none");
    console.error("Erro de login:", error);
  }
});

});
