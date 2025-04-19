document.addEventListener('DOMContentLoaded', function() {
  // Referências aos elementos do DOM
  const formLogin = document.getElementById('form-login');
  const inputEmail = document.getElementById('email');
  const inputSenha = document.getElementById('senha');
  const btnToggleSenha = document.getElementById('btn-toggle-senha');
  const checkboxLembrar = document.getElementById('lembrar');
  const alertError = document.getElementById('login-error');
  
  // Verificar se há informações salvas
  const savedEmail = localStorage.getItem('savedEmail');
  if (savedEmail) {
      inputEmail.value = savedEmail;
      checkboxLembrar.checked = true;
  }
  
  // Alternar visibilidade da senha
  btnToggleSenha.addEventListener('click', function() {
      if (inputSenha.type === 'password') {
          inputSenha.type = 'text';
          btnToggleSenha.innerHTML = '<i class="bi bi-eye-slash"></i>';
      } else {
          inputSenha.type = 'password';
          btnToggleSenha.innerHTML = '<i class="bi bi-eye"></i>';
      }
  });
  
  // Processar envio do formulário
  formLogin.addEventListener('submit', async function(event) {
      event.preventDefault();
      
      // Esconder mensagem de erro anterior
      alertError.classList.add('d-none');
      
      try {
          // Para fins de demonstração, vamos simular um login
          // Em produção, substitua por uma chamada real à API
          
          // MOCK: Simular chamada à API
          const resposta = await simulateLoginApi(inputEmail.value, inputSenha.value);
          
          // Se a resposta for bem-sucedida
          if (resposta.success) {
              // Salvar email se "Lembrar-me" estiver marcado
              if (checkboxLembrar.checked) {
                  localStorage.setItem('savedEmail', inputEmail.value);
              } else {
                  localStorage.removeItem('savedEmail');
              }
              
              // Salvar token e informações do usuário
              localStorage.setItem('token', resposta.token);
              localStorage.setItem('usuario', JSON.stringify(resposta.usuario));
              
              // Redirecionar com base no perfil do usuário
              if (resposta.usuario.funcao === 'admin' || resposta.usuario.funcao === 'tecnico') {
                  window.location.href = 'admin.html';
              } else {
                  window.location.href = 'index.html';
              }
          } else {
              // Exibir mensagem de erro
              alertError.textContent = resposta.mensagem;
              alertError.classList.remove('d-none');
          }
      } catch (error) {
          // Exibir erro genérico
          alertError.textContent = 'Erro ao tentar fazer login. Tente novamente mais tarde.';
          alertError.classList.remove('d-none');
          console.error('Erro de login:', error);
      }
  });
  
  // FUNÇÃO MOCK: Simular API de login
  // Em produção, substitua por chamada real à API
  async function simulateLoginApi(email, senha) {
      // Simulando delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Credenciais de exemplo
      const usuarios = [
          {
              email: 'admin@autosys.com',
              senha: 'admin123',
              id: 1,
              nome: 'Administrador',
              funcao: 'admin',
              imagem: null
          },
          {
              email: 'tecnico@autosys.com',
              senha: 'tecnico123',
              id: 2,
              nome: 'Técnico',
              funcao: 'tecnico',
              imagem: null
          },
          {
              email: 'user@autosys.com',
              senha: 'user123',
              id: 3,
              nome: 'Usuário',
              funcao: 'visualizador',
              imagem: null
          }
      ];
      
      // Verificar credenciais
      const usuario = usuarios.find(u => u.email === email);
      
      if (!usuario) {
          return { 
              success: false, 
              mensagem: 'Email não encontrado' 
          };
      }
      
      if (usuario.senha !== senha) {
          return { 
              success: false, 
              mensagem: 'Senha incorreta' 
          };
      }
      
      // Credenciais corretas
      const { senha: _, ...usuarioSemSenha } = usuario;
      
      return {
          success: true,
          token: `mock-token-${Date.now()}`,
          usuario: usuarioSemSenha
      };
  }
});