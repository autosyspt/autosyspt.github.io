document.addEventListener('DOMContentLoaded', function() {
  // Inicializar o menu mobile
  initMobileMenu();
  
  // Inicializar o dropdown do usuário
  initUserDropdown();
  
  // Inicializar o formulário de pesquisa
  initSearchForm();
  
  // Inicializar os filtros de intervenção (será chamado após carregar os dados)
});

// Função para inicializar o menu mobile
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const menuMobile = document.getElementById('menu-mobile');
  
  if (menuToggle && menuMobile) {
      menuToggle.addEventListener('click', function() {
          if (menuMobile.classList.contains('open')) {
              menuMobile.classList.remove('open');
              menuToggle.innerHTML = '☰';
              menuToggle.style.color = '#ff5d00';
          } else {
              menuMobile.classList.add('open');
              menuToggle.innerHTML = '✕';
              menuToggle.style.color = 'white';
          }
      });
      
      // Fechar o menu ao clicar em um link
      const links = menuMobile.querySelectorAll('a');
      links.forEach(link => {
          link.addEventListener('click', () => {
              menuMobile.classList.remove('open');
              menuToggle.innerHTML = '☰';
              menuToggle.style.color = '#ff5d00';
          });
      });
  }
}

// Função para inicializar o dropdown
function initDropdown() {
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  
  if (dropdownToggle && dropdownMenu) {
      // Abrir/fechar o dropdown ao clicar no botão
      dropdownToggle.addEventListener('click', function(event) {
          event.preventDefault();
          dropdownMenu.classList.toggle('active');
      });
      
      // Fechar o dropdown ao clicar fora dele
      document.addEventListener('click', function(event) {
          if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
              dropdownMenu.classList.remove('active');
          }
      });
  }
}

// Função para inicializar o formulário de pesquisa
function initSearchForm() {
  const form = document.querySelector('.pesquisa form');
  const selectPesquisa = document.getElementById('pesquisar-select');
  const inputPesquisa = document.getElementById('search-input');
  
  if (form) {
      form.addEventListener('submit', function(event) {
          event.preventDefault();
          
          // Validar o formulário
          if (selectPesquisa.value === 'default' || !inputPesquisa.value.trim()) {
              alert('Por favor, selecione uma opção e digite um termo de pesquisa.');
              return;
          }
          
          // Realizar a pesquisa
          realizarPesquisa(selectPesquisa.value, inputPesquisa.value);
      });
  }
  
  // Verificar se há parâmetros na URL para pesquisa automática
  const urlParams = new URLSearchParams(window.location.search);
  const tipoParam = urlParams.get('tipo');
  const termoParam = urlParams.get('termo');
  
  if (tipoParam && termoParam) {
      // Preencher o formulário com os parâmetros da URL
      if (selectPesquisa) {
          selectPesquisa.value = tipoParam;
      }
      if (inputPesquisa) {
          inputPesquisa.value = termoParam;
      }
      
      // Realizar a pesquisa automaticamente
      realizarPesquisa(tipoParam, termoParam);
  }
}

// Função para realizar a pesquisa no banco de dados
function realizarPesquisa(tipo, termo) {
  // Exibir indicador de carregamento
  const resultadoPesquisa = document.querySelector('.container-info');
  if (resultadoPesquisa) {
      resultadoPesquisa.innerHTML = '<div class="loading">Carregando...</div>';
  }
  
  // URL da API para buscar dados do veículo
  const apiUrl = `api/veiculos/pesquisar?tipo=${encodeURIComponent(tipo)}&termo=${encodeURIComponent(termo)}`;
  
  // Realizar a requisição ao servidor
  fetch(apiUrl)
      .then(response => {
          if (!response.ok) {
              throw new Error('Erro na resposta do servidor');
          }
          return response.json();
      })
      .then(data => {
          if (data && !data.erro) {
              // Exibir os resultados
              exibirResultados(data);
              resultadoPesquisa.style.display = 'block';
          } else {
              // Exibir mensagem de erro
              exibirErro('Veículo não encontrado. Verifique os dados e tente novamente.');
          }
      })
      .catch(error => {
          console.error('Erro ao buscar dados:', error);
          exibirErro('Erro ao conectar com o servidor. Tente novamente mais tarde.');
      });
}
function realizarRequisicaoAutenticada(url, metodo = 'GET', dados = null) {
  const token = localStorage.getItem('autoSysToken');
  
  const opcoes = {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };
  
  if (dados && (metodo === 'POST' || metodo === 'PUT')) {
    opcoes.body = JSON.stringify(dados);
  }
  
  return fetch(url, opcoes)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro na resposta do servidor');
      }
      return response.json();
    });
}

// Função para simular uma resposta da API (remover em ambiente de produção)
function simulateApiResponse(tipo, termo) {
  // Para fins de demonstração, sempre retornamos o mesmo veículo
  // Em um ambiente real, você faria uma busca no banco de dados
  
  // Simular um tempo de resposta
  return new Promise(resolve => {
      setTimeout(() => {
          // Se o termo for "naoexiste", simulamos um erro
          if (termo.toLowerCase() === 'naoexiste') {
              resolve({ erro: true, mensagem: 'Veículo não encontrado' });
              return;
          }
          
          // Caso contrário, retornamos dados mockados
          resolve({
              veiculo: {
                  id: 1,
                  marca: 'Toyota',
                  modelo: 'Corolla',
                  ano: 2020,
                  cor: 'Preto',
                  matricula: '12-AB-34',
                  vin: 'JTDB32E30A1234567',
                  pneus: '205/55 R16',
                  jante: 'Liga leve 16"',
                  imagem: 'https://via.placeholder.com/300x200?text=Toyota+Corolla'
              },
              intervencoes: [
                  {
                      id: 1,
                      data: '2023-10-15',
                      tipo: 'Manutenção Preventiva',
                      descricao: 'Troca de óleo e filtros',
                      tecnico: 'João Silva'
                  },
                  {
                      id: 2,
                      data: '2023-08-22',
                      tipo: 'Manutenção Corretiva',
                      descricao: 'Substituição da correia de distribuição',
                      tecnico: 'António Costa'
                  },
                  {
                      id: 3,
                      data: '2023-05-10',
                      tipo: 'Serviços Elétricos e Eletrônicos',
                      descricao: 'Substituição da bateria',
                      tecnico: 'Maria Santos'
                  },
                  {
                      id: 4,
                      data: '2023-02-05',
                      tipo: 'Serviços de Funilaria e Pintura',
                      descricao: 'Reparo de amassado na porta traseira',
                      tecnico: 'Pedro Oliveira'
                  },
                  {
                      id: 5,
                      data: '2022-11-18',
                      tipo: 'Serviços de Ar-condicionado',
                      descricao: 'Recarga de gás e limpeza do sistema',
                      tecnico: 'Ana Rodrigues'
                  }
              ]
          });
      }, 500); // Simular um delay de 500ms
  });
}

// Função para exibir mensagem de erro
function exibirErro(mensagem) {
  const containerInfo = document.querySelector('.container-info');
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
  document.querySelector('.modelo').textContent = `Modelo: ${veiculo.modelo}`;
  document.querySelector('.marca').textContent = `Marca: ${veiculo.marca}`;
  document.querySelector('.ano').textContent = `Ano: ${veiculo.ano}`;
  document.querySelector('.cor').textContent = `Cor: ${veiculo.cor}`;
  document.querySelector('.pneus').textContent = `Pneus: ${veiculo.pneus}`;
  document.querySelector('.jante').textContent = `Jante: ${veiculo.jante}`;
  
  // Preencher a imagem do veículo
  const imagemModelo = document.querySelector('.imagem-modelo img');
  if (imagemModelo && veiculo.imagem) {
      imagemModelo.src = veiculo.imagem;
      imagemModelo.alt = `${veiculo.marca} ${veiculo.modelo}`;
  }
  
  // Preencher o histórico de intervenções
  preencherIntervencoesHTML(data.intervencoes);
  
  // Inicializar os filtros
  initFiltros();
}

// Função para preencher as intervenções no HTML (versão completa)
function preencherIntervencoesHTML(intervencoes) {
  const containerIntervencoes = document.querySelector('.container-intervencoes');
  containerIntervencoes.innerHTML = ''; // Limpar o conteúdo anterior
  
  if (!intervencoes || intervencoes.length === 0) {
      containerIntervencoes.innerHTML = '<p>Nenhuma intervenção registrada para este veículo.</p>';
      return;
  }
  
  // Ordenar intervenções por data (mais recentes primeiro)
  intervencoes.sort((a, b) => new Date(b.data) - new Date(a.data));
  
  // Criar o HTML para cada intervenção
  intervencoes.forEach(intervencao => {
      // Formatar a data para o formato dd/mm/yyyy
      const dataObj = new Date(intervencao.data);
      const dataFormatada = `${dataObj.getDate().toString().padStart(2, '0')}/${(dataObj.getMonth() + 1).toString().padStart(2, '0')}/${dataObj.getFullYear()}`;
      
      const intervencaoElement = document.createElement('div');
      intervencaoElement.classList.add('intervencao');
      intervencaoElement.innerHTML = `
          <div class="header-intervencao">
              <span class="data-intervencao">${dataFormatada}</span>
              <span class="tipo-intervencao">${intervencao.tipo}</span>
          </div>
          <div class="body-intervencao">
              <p><strong>Descrição:</strong> ${intervencao.descricao}</p>
              <p><strong>Técnico:</strong> ${intervencao.tecnico}</p>
          </div>
      `;
      
      containerIntervencoes.appendChild(intervencaoElement);
  });
}

// Função para inicializar os filtros de intervenção
function initFiltros() {
  const checkboxes = document.querySelectorAll('.filtros-intervencao input[type="checkbox"]');
  
  if (checkboxes.length > 0) {
      checkboxes.forEach(checkbox => {
          checkbox.addEventListener('change', function() {
              // Obter todas as intervenções
              const intervencoes = document.querySelectorAll('.container-intervencoes .intervencao');
              const tipoFiltrado = this.name;
              
              if (this.checked) {
                  // Mostrar apenas as intervenções do tipo selecionado
                  intervencoes.forEach(intervencao => {
                      const tipoIntervencao = intervencao.querySelector('.tipo-intervencao').textContent;
                      if (tipoIntervencao !== tipoFiltrado) {
                          intervencao.style.display = 'none';
                      } else {
                          intervencao.style.display = 'block';
                      }
                  });
              } else {
                  // Verificar se algum outro filtro está ativo
                  const outrosFiltrosAtivos = Array.from(checkboxes).some(cb => cb !== this && cb.checked);
                  
                  if (!outrosFiltrosAtivos) {
                      // Se nenhum filtro estiver ativo, mostrar todas as intervenções
                      intervencoes.forEach(intervencao => {
                          intervencao.style.display = 'block';
                      });
                  } else {
                      // Se outros filtros estiverem ativos, verificar cada intervenção
                      intervencoes.forEach(intervencao => {
                          const tipoIntervencao = intervencao.querySelector('.tipo-intervencao').textContent;
                          const deveExibir = Array.from(checkboxes).some(cb => 
                              cb.checked && cb.name === tipoIntervencao
                          );
                          
                          intervencao.style.display = deveExibir ? 'block' : 'none';
                      });
                  }
              }
          });
      });
  }
}

// Função para inicializar o dropdown do usuário
function initUserDropdown() {
  const dropdownToggle = document.querySelector('.dropdown-toggle');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  
  if (dropdownToggle && dropdownMenu) {
      dropdownToggle.addEventListener('click', function() {
          dropdownMenu.classList.toggle('show');
      });
      
      // Fechar o dropdown ao clicar fora dele
      document.addEventListener('click', function(event) {
          if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
              dropdownMenu.classList.remove('show');
          }
      });
      
      // Verificar se o usuário está logado e atualizar a imagem
      verificarUsuarioLogado();
  }
}

// Função para verificar se o usuário está logado
function verificarUsuarioLogado() {
  const token = localStorage.getItem('autoSysToken');
  const imagemUser = document.querySelector('.imagem-user');
  const dropdownMenu = document.querySelector('.dropdown-menu');
  
  if (token) {
    realizarRequisicaoAutenticada('api/usuario/perfil')
      .then(usuario => {
        // Atualizar interface com dados do usuário
        if (imagemUser) {
          imagemUser.src = usuario.imagem || 'user-icon.png';
          imagemUser.alt = usuario.nome || 'Usuário';
        }
        
        if (dropdownMenu) {
          // Resto do código permanece o mesmo
        }
      })
      .catch(error => {
        console.error('Erro ao obter perfil:', error);
        fazerLogout();
      });
  } else {
    // Resto do código para usuário não logado permanece o mesmo
  }
}

// Função para fazer logout
function fazerLogout() {
  localStorage.removeItem('autoSysToken');
  alert('Sessão encerrada com sucesso!');
  window.location.href = 'index.html';
}