document.addEventListener("DOMContentLoaded", function () {
  const formSignin = document.getElementById("form-signin");
  const inputNome = document.getElementById("nome");
  const inputEmail = document.getElementById("email");
  const inputSenha = document.getElementById("senha");
  const inputConfirmar = document.getElementById("confirmar-senha");
  const btnToggleSenha = document.getElementById("btn-toggle-senha");
  const alertError = document.getElementById("signin-error");
  const alertSuccess = document.getElementById("signin-success");

  // Alternar visibilidade da senha
  btnToggleSenha.addEventListener("click", function () {
    if (inputSenha.type === "password") {
      inputSenha.type = "text";
      inputConfirmar.type = "text";
      btnToggleSenha.innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
      inputSenha.type = "password";
      inputConfirmar.type = "password";
      btnToggleSenha.innerHTML = '<i class="bi bi-eye"></i>';
    }
  });

  formSignin.addEventListener("submit", async function (event) {
    event.preventDefault();
    alertError.classList.add("d-none");
    alertSuccess.classList.add("d-none");

    const nome = inputNome.value.trim();
    const email = inputEmail.value.trim();
    const senha = inputSenha.value;
    const confirmar = inputConfirmar.value;

    if (senha !== confirmar) {
      alertError.textContent = "As senhas não coincidem.";
      alertError.classList.remove("d-none");
      return;
    }

    try {
      const response = await fetch("../link/endp.php/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, senha })
      });

      const json = await response.json();

      if (json.ok) {
        alertSuccess.textContent = "Conta criada com sucesso!";
        alertSuccess.classList.remove("d-none");

        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        alertError.textContent = json.error || "Erro ao criar conta.";
        alertError.classList.remove("d-none");
      }
    } catch (error) {
      alertError.textContent = "Erro de rede ou servidor.";
      alertError.classList.remove("d-none");
      console.error("Erro no registo:", error);
    }
  });
});
