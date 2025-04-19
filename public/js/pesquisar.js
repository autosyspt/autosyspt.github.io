document.addEventListener("DOMContentLoaded", function () {
  // Inicializar o menu mobile
  initMobileMenu();

  // Inicializar o dropdown do usuário
  initUserDropdown();

  // Inicializar o formulário de pesquisa
  initSearchForm();

});

// Função para inicializar o menu mobile
function initMobileMenu() {
  const menuToggle = document.getElementById("menu-toggle");
  const menuMobile = document.getElementById("menu-mobile");

  if (menuToggle && menuMobile) {
    menuToggle.addEventListener("click", function () {
      if (menuMobile.classList.contains("open")) {
        menuMobile.classList.remove("open");
        menuToggle.innerHTML = "☰";
        menuToggle.style.color = "#ff5d00";
      } else {
        menuMobile.classList.add("open");
        menuToggle.innerHTML = "✕";
        menuToggle.style.color = "white";
      }
    });

    // Fechar o menu ao clicar em um link
    const links = menuMobile.querySelectorAll("a");
    links.forEach((link) => {
      link.addEventListener("click", () => {
        menuMobile.classList.remove("open");
        menuToggle.innerHTML = "☰";
        menuToggle.style.color = "#ff5d00";
      });
    });
  }
}

// Função para inicializar o dropdown
function initDropdown() {
  const dropdownToggle = document.querySelector(".dropdown-toggle");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  if (dropdownToggle && dropdownMenu) {
    // Abrir/fechar o dropdown ao clicar no botão
    dropdownToggle.addEventListener("click", function (event) {
      event.preventDefault();
      dropdownMenu.classList.toggle("active");
    });

    // Fechar o dropdown ao clicar fora dele
    document.addEventListener("click", function (event) {
      if (
        !dropdownToggle.contains(event.target) &&
        !dropdownMenu.contains(event.target)
      ) {
        dropdownMenu.classList.remove("active");
      }
    });
  }
}

// Função para inicializar o formulário de pesquisa
// Adicione esta função ao arquivo existente
function configureSearchInput() {
    const selectPesquisa = document.getElementById('pesquisar-select');
    const inputPesquisa = document.getElementById('search-input');
    
    if (!selectPesquisa || !inputPesquisa) return;
    
    // Configurar o input com base na seleção atual
    function updateInputFormat() {
      const tipoSelecionado = selectPesquisa.value;
      
      // Remover event listeners antigos
      inputPesquisa.removeEventListener('input', formatMatricula);
      inputPesquisa.removeEventListener('input', formatVIN);
      inputPesquisa.removeEventListener('input', formatAno);
      
      // Limpar o input
      inputPesquisa.value = '';
      inputPesquisa.setAttribute('type', 'text');
      inputPesquisa.removeAttribute('maxlength');
      inputPesquisa.removeAttribute('pattern');
      
      // Configurar o input de acordo com o tipo selecionado
      switch(tipoSelecionado) {
        case 'matricula':
          inputPesquisa.setAttribute('placeholder', 'XX-00-XX');
          inputPesquisa.setAttribute('maxlength', 8);
          inputPesquisa.addEventListener('input', formatMatricula);
          break;
          
        case 'vin':
          inputPesquisa.setAttribute('placeholder', '0ABCDEFGHI0123456');
          inputPesquisa.setAttribute('maxlength', 17);
          inputPesquisa.addEventListener('input', formatVIN);
          break;
          
        case 'marca':
          inputPesquisa.setAttribute('placeholder', 'Ex: Toyota, BMW, Audi');
          break;
          
        case 'modelo':
          inputPesquisa.setAttribute('placeholder', 'Ex: Corolla, X5, A4');
          break;
          
        case 'ano':
          inputPesquisa.setAttribute('type', 'number');
          inputPesquisa.setAttribute('placeholder', 'Ex: 2023');
          inputPesquisa.setAttribute('min', '1900');
          inputPesquisa.setAttribute('max', new Date().getFullYear());
          inputPesquisa.setAttribute('maxlength', 4);
          inputPesquisa.addEventListener('input', formatAno);
          break;
          
        default:
          inputPesquisa.setAttribute('placeholder', 'Digite aqui');
          break;
      }
    }
    
    // Função para formatar matrícula automaticamente (XX-00-XX)
    function formatMatricula(e) {
      let input = e.target;
      let value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      
      if (value.length > 0) {
        // Formato: XX-00-XX
        let formattedValue = '';
        
        // Adicionar os primeiros dois caracteres
        if (value.length > 0) {
          formattedValue += value.substring(0, Math.min(2, value.length));
        }
        
        // Adicionar o primeiro hífen
        if (value.length > 2) {
          formattedValue += '-';
          formattedValue += value.substring(2, Math.min(4, value.length));
        }
        
        // Adicionar o segundo hífen
        if (value.length > 4) {
          formattedValue += '-';
          formattedValue += value.substring(4, Math.min(6, value.length));
        }
        
        input.value = formattedValue;
      }
    }
    
    // Função para formatar VIN (validar comprimento)
    function formatVIN(e) {
      const input = e.target;
      let value = input.value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
      
      // Limitar a 17 caracteres (padrão VIN)
      if (value.length > 17) {
        value = value.substring(0, 17);
      }
      
      input.value = value;
      
      // Validar comprimento
      if (value.length === 17) {
        input.setCustomValidity('');
      } else if (value.length > 0) {
        input.setCustomValidity('O número de chassi deve ter exatamente 17 caracteres.');
      } else {
        input.setCustomValidity('');
      }
    }
    
    // Função para formatar e validar o ano
    function formatAno(e) {
      const input = e.target;
      const anoAtual = new Date().getFullYear();
      let value = input.value.replace(/\D/g, '');
      
      // Limitar a 4 dígitos
      if (value.length > 4) {
        value = value.substring(0, 4);
      }
      
      input.value = value;
      
      // Validar o ano
      if (value.length === 4) {
        const ano = parseInt(value, 10);
        if (ano > anoAtual) {
          input.setCustomValidity(`O ano não pode ser maior que ${anoAtual}.`);
        } else if (ano < 1900) {
          input.setCustomValidity('O ano não pode ser menor que 1900.');
        } else {
          input.setCustomValidity('');
        }
      } else {
        input.setCustomValidity('');
      }
    }
    
    // Atualizar o formato do input quando a seleção mudar
    selectPesquisa.addEventListener('change', updateInputFormat);
    
    // Configurar o formato inicial (caso já haja uma opção selecionada)
    updateInputFormat();
  }
  
  // Modificar a função initSearchForm para incluir a configuração do input
  function initSearchForm() {
    const form = document.querySelector('.pesquisa form');
    const selectPesquisa = document.getElementById('pesquisar-select');
    const inputPesquisa = document.getElementById('search-input');
    
    // Configurar o comportamento do input de pesquisa baseado na seleção
    configureSearchInput();
    
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
  
        // Validar o formulário
        if (selectPesquisa.value === "default" || !inputPesquisa.value.trim()) {
          alert("Por favor, selecione uma opção e digite um termo de pesquisa.");
          return;
        }
        
        // Validações específicas por tipo de pesquisa
        if (selectPesquisa.value === 'vin' && inputPesquisa.value.length !== 17) {
          alert('O número de chassi deve ter exatamente 17 caracteres.');
          return;
        }
        
        if (selectPesquisa.value === 'matricula' && inputPesquisa.value.length < 7) {
          alert('A matrícula deve estar no formato XX-00-XX.');
          return;
        }
        
        if (selectPesquisa.value === 'ano') {
          const ano = parseInt(inputPesquisa.value);
          const anoAtual = new Date().getFullYear();
          if (isNaN(ano) || ano < 1900 || ano > anoAtual) {
            alert(`O ano deve ser um número entre 1900 e ${anoAtual}.`);
            return;
          }
        }
  
        // Realizar a pesquisa
        realizarPesquisa(selectPesquisa.value, inputPesquisa.value);
      });
    }
  
    // Verificar se há parâmetros na URL para pesquisa automática
    const urlParams = new URLSearchParams(window.location.search);
    const tipoParam = urlParams.get("tipo");
    const termoParam = urlParams.get("termo");
  
    if (tipoParam && termoParam) {
      // Preencher o formulário com os parâmetros da URL
      if (selectPesquisa) {
        selectPesquisa.value = tipoParam;
        // Atualizar o formato do input após definir o valor do select
        if (typeof configureSearchInput === 'function') {
          configureSearchInput();
        }
      }
      if (inputPesquisa) {
        inputPesquisa.value = termoParam;
      }
  
      // Realizar a pesquisa automaticamente
      realizarPesquisa(tipoParam, termoParam);
    }
  }
  
  // Certifique-se de incluir esta função no seu event listener DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
    // Funções existentes
    initMobileMenu();
    initUserDropdown();
    
    // Inicializar o formulário de pesquisa com as novas funcionalidades
    initSearchForm();
  });


// Função para realizar a pesquisa no banco de dados
function realizarPesquisa(tipo, termo) {
  // Exibir indicador de carregamento
  const resultadoPesquisa = document.querySelector(".container-info");
  if (resultadoPesquisa) {
    resultadoPesquisa.innerHTML = '<div class="loading">Carregando...</div>';
  }

  // URL da API para buscar dados do veículo
  const apiUrl = `/api/veiculos/pesquisar?tipo=${encodeURIComponent(
    tipo
  )}&termo=${encodeURIComponent(termo)}`;

  // Realizar a requisição ao servidor
  fetch(apiUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro na resposta do servidor");
      }
      return response.json();
    })
    .then((data) => {
      if (data && !data.erro) {
        // Exibir os resultados
        exibirResultados(data);
        resultadoPesquisa.style.display = "block";
      } else {
        // Exibir mensagem de erro
        exibirErro(
          "Veículo não encontrado. Verifique os dados e tente novamente."
        );
      }
    })
    .catch((error) => {
      console.error("Erro ao buscar dados:", error);
      exibirErro(
        "Erro ao conectar com o servidor. Tente novamente mais tarde."
      );
    });
}

// Função para realizar requisições autenticadas
function realizarRequisicaoAutenticada(url, metodo = "GET", dados = null) {
  const token = localStorage.getItem("token"); // Corrigido para usar a chave 'token'

  const opcoes = {
    method: metodo,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  };

  if (dados && (metodo === "POST" || metodo === "PUT" || metodo === "PATCH")) {
    opcoes.body = JSON.stringify(dados);
  }

  return fetch(url, opcoes).then((response) => {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expirado ou inválido
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "/login.html";
        throw new Error("Sessão expirada");
      }
      throw new Error("Erro na resposta do servidor");
    }
    return response.json();
  });
}

// Função para exibir mensagem de erro
function exibirErro(mensagem) {
  const containerInfo = document.querySelector(".container-info");
  if (containerInfo) {
    containerInfo.innerHTML = `
            <div class="erro-pesquisa">
                <p>${mensagem}</p>
                <button onclick="window.location.reload()">Tentar Novamente</button>
            </div>
        `;
  }
}

// Função para exibir os resultados da pesquisa
function exibirResultados(data) {
  const veiculo = data.veiculo;

  // Preencher os dados principais do veículo
  document.querySelector(".modelo").textContent = `Modelo: ${
    veiculo.modelo || "N/A"
  }`;
  document.querySelector(".marca").textContent = `Marca: ${
    veiculo.marca || "N/A"
  }`;
  document.querySelector(".ano").textContent = `Ano: ${veiculo.ano || "N/A"}`;
  document.querySelector(".cor").textContent = `Cor: ${veiculo.cor || "N/A"}`;
  document.querySelector(".pneus").textContent = `Pneus: ${
    veiculo.pneus || "N/A"
  }`;
  document.querySelector(".jante").textContent = `Jante: ${
    veiculo.jante || "N/A"
  }`;

  // Preencher a imagem do veículo
  const imagemModelo = document.querySelector(".imagem-modelo img");
  if (imagemModelo) {
    imagemModelo.src = veiculo.imagem || "imagens/default-car.png";
    imagemModelo.alt = `${veiculo.marca} ${veiculo.modelo}`;
  }

  // Preencher o histórico de intervenções
  preencherIntervencoesHTML(data.intervencoes);

  // Inicializar os filtros
  initFiltros();
}

// Função para preencher as intervenções no HTML
function preencherIntervencoesHTML(intervencoes) {
  const containerIntervencoes = document.querySelector(
    ".container-intervencoes"
  );

  if (!containerIntervencoes) {
    return;
  }

  containerIntervencoes.innerHTML = ""; // Limpar o conteúdo anterior

  if (!intervencoes || intervencoes.length === 0) {
    containerIntervencoes.innerHTML =
      "<p>Nenhuma intervenção registrada para este veículo.</p>";
    return;
  }

  // Ordenar intervenções por data (mais recentes primeiro)
  intervencoes.sort(
    (a, b) => new Date(b.data_inicio) - new Date(a.data_inicio)
  );

  // Criar o HTML para cada intervenção
  intervencoes.forEach((intervencao) => {
    // Formatar a data para o formato dd/mm/yyyy
    const dataObj = new Date(intervencao.data_inicio);
    const dataFormatada = `${dataObj.getDate().toString().padStart(2, "0")}/${(
      dataObj.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${dataObj.getFullYear()}`;

    // Determinar o tipo de intervenção baseado na descrição ou status
    let tipoIntervencao;
    if (intervencao.tipo) {
      tipoIntervencao = intervencao.tipo;
    } else {
      // Tentar inferir o tipo com base na descrição (lógica simplificada)
      const descricaoLower = intervencao.descricao.toLowerCase();
      if (
        descricaoLower.includes("preventiva") ||
        descricaoLower.includes("revisão") ||
        descricaoLower.includes("revisao")
      ) {
        tipoIntervencao = "Manutenção Preventiva";
      } else if (
        descricaoLower.includes("corretiva") ||
        descricaoLower.includes("reparo")
      ) {
        tipoIntervencao = "Manutenção Corretiva";
      } else if (
        descricaoLower.includes("elétric") ||
        descricaoLower.includes("eletrônic") ||
        descricaoLower.includes("bateria")
      ) {
        tipoIntervencao = "Serviços Elétricos e Eletrônicos";
      } else if (
        descricaoLower.includes("funilaria") ||
        descricaoLower.includes("pintura") ||
        descricaoLower.includes("amassado")
      ) {
        tipoIntervencao = "Serviços de Funilaria e Pintura";
      } else if (
        descricaoLower.includes("ar-condicionado") ||
        descricaoLower.includes("ar condicionado")
      ) {
        tipoIntervencao = "Serviços de Ar-condicionado";
      } else {
        tipoIntervencao = "Outros Serviços";
      }
    }

    const intervencaoElement = document.createElement("div");
    intervencaoElement.classList.add("intervencao");
    intervencaoElement.innerHTML = `
            <div class="header-intervencao">
                <span class="data-intervencao">${dataFormatada}</span>
                <span class="tipo-intervencao">${tipoIntervencao}</span>
            </div>
            <div class="body-intervencao">
                <p><strong>Descrição:</strong> ${intervencao.descricao}</p>
                <p><strong>Técnico:</strong> ${
                  intervencao.tecnico_nome || "Não atribuído"
                }</p>
                <p><strong>Status:</strong> ${intervencao.status || "N/A"}</p>
            </div>
        `;

    containerIntervencoes.appendChild(intervencaoElement);
  });
}

// Função para inicializar os filtros de intervenção
function initFiltros() {
  const checkboxes = document.querySelectorAll(
    '.filtros-intervencao input[type="checkbox"]'
  );

  if (checkboxes.length > 0) {
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        // Obter todas as intervenções
        const intervencoes = document.querySelectorAll(
          ".container-intervencoes .intervencao"
        );
        const tipoFiltrado = this.name;

        if (this.checked) {
          // Mostrar apenas as intervenções do tipo selecionado
          intervencoes.forEach((intervencao) => {
            const tipoIntervencao =
              intervencao.querySelector(".tipo-intervencao").textContent;
            if (tipoIntervencao !== tipoFiltrado) {
              intervencao.style.display = "none";
            } else {
              intervencao.style.display = "block";
            }
          });
        } else {
          // Verificar se algum outro filtro está ativo
          const outrosFiltrosAtivos = Array.from(checkboxes).some(
            (cb) => cb !== this && cb.checked
          );

          if (!outrosFiltrosAtivos) {
            // Se nenhum filtro estiver ativo, mostrar todas as intervenções
            intervencoes.forEach((intervencao) => {
              intervencao.style.display = "block";
            });
          } else {
            // Se outros filtros estiverem ativos, verificar cada intervenção
            intervencoes.forEach((intervencao) => {
              const tipoIntervencao =
                intervencao.querySelector(".tipo-intervencao").textContent;
              const deveExibir = Array.from(checkboxes).some(
                (cb) => cb.checked && cb.name === tipoIntervencao
              );

              intervencao.style.display = deveExibir ? "block" : "none";
            });
          }
        }
      });
    });
  }
}

// Função para inicializar o dropdown do usuário
function initUserDropdown() {
  const dropdownToggle = document.querySelector(".dropdown-toggle");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", function () {
      dropdownMenu.classList.toggle("show");
    });

    // Fechar o dropdown ao clicar fora dele
    document.addEventListener("click", function (event) {
      if (
        !dropdownToggle.contains(event.target) &&
        !dropdownMenu.contains(event.target)
      ) {
        dropdownMenu.classList.remove("show");
      }
    });

    // Verificar se o usuário está logado e atualizar a imagem
    verificarUsuarioLogado();
  }
}

// Função para verificar se o usuário está logado
function verificarUsuarioLogado() {
  const token = localStorage.getItem("token"); // Corrigido para usar a chave 'token'
  const imagemUser = document.querySelector(".imagem-user");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  if (token) {
    // Atualizar o endpoint para o correto /api/auth/me
    realizarRequisicaoAutenticada("/api/auth/me")
      .then((usuario) => {
        // Atualizar interface com dados do usuário
        if (imagemUser) {
          imagemUser.src = usuario.imagem || "/imagens/user-icon.png";
          imagemUser.alt = usuario.nome || "Usuário";
        }

        // Atualizar o menu dropdown com informações do usuário
        if (dropdownMenu) {
          // Personalizar o menu para usuários logados
          dropdownMenu.innerHTML = `
              <div class="user-info">
                <p class="user-name">${usuario.nome}</p>
                <p class="user-email">${usuario.email}</p>
                <p class="user-role">${formatarFuncao(usuario.funcao)}</p>
              </div>
              <div class="dropdown-divider"></div>
              <a href="/perfil.html">Meu Perfil</a>
              ${
                usuario.funcao === "admin" || usuario.funcao === "tecnico"
                  ? '<a href="/admin.html">Painel Admin</a>'
                  : ""
              }
              <a href="#" onclick="fazerLogout(); return false;">Sair</a>
            `;
        }
      })
      .catch((error) => {
        console.error("Erro ao obter perfil:", error);
        // Limpar token inválido e atualizar a interface
        fazerLogout(false); // Não redirecionar
      });
  } else {
    // Usuário não está logado
    if (imagemUser) {
      imagemUser.src = "/imagens/user-icon.png";
      imagemUser.alt = "Usuário não logado";
    }

    if (dropdownMenu) {
      // Menu para usuários não logados
      dropdownMenu.innerHTML = `
          <a href="/login.html">Entrar</a>
        `;
    }
  }
}

// Função para formatar o nome da função do usuário
function formatarFuncao(funcao) {
  const funcoes = {
    admin: "Administrador",
    tecnico: "Técnico",
    recepcao: "Recepção",
    visualizador: "Visualizador",
  };

  return funcoes[funcao] || funcao;
}

// Função para fazer logout
function fazerLogout(redirecionar = true) {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");

  if (redirecionar) {
    window.location.href = "/index.html";
  } else {
    // Apenas atualizar a interface
    const imagemUser = document.querySelector(".imagem-user");
    const dropdownMenu = document.querySelector(".dropdown-menu");

    if (imagemUser) {
      imagemUser.src = "/imagens/user-icon.png";
      imagemUser.alt = "Usuário não logado";
    }

    if (dropdownMenu) {
      dropdownMenu.innerHTML = `
          <a href="/login.html">Entrar</a>
        `;
    }
  }
}
