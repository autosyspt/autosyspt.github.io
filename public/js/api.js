// Módulo para gerenciar chamadas à API
const API = {
  baseUrl: '/api',
  
  // Função para obter o token do localStorage
  getToken() {
    return localStorage.getItem('token');
  },

  // Configuração padrão para requisições autenticadas
  authHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  },

  // Método genérico para fazer requisições
  async fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Mesclar cabeçalhos padrão com cabeçalhos específicos
    const headers = options.headers 
      ? { ...this.authHeaders(), ...options.headers }
      : this.authHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Se o status for 401 (não autorizado), limpar token e redirecionar para login
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login.html';
        return null;
      }

      // Para respostas 204 (No Content), retornamos um objeto vazio
      if (response.status === 204) {
        return {};
      }

      // Para outras respostas, tentamos obter o JSON
      const data = await response.json();
      
      // Se a resposta não foi bem-sucedida, lançamos um erro
      if (!response.ok) {
        throw new Error(data.mensagem || 'Ocorreu um erro na requisição');
      }
      
      return data;
    } catch (error) {
      console.error(`Erro na requisição para ${url}:`, error);
      throw error;
    }
  },

  // AUTENTICAÇÃO
  async login(email, senha) {
    return this.fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
  },

  async obterUsuarioAtual() {
    return this.fetch('/auth/me');
  },

  async solicitarRedefinicaoSenha(email) {
    return this.fetch('/auth/esqueci-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
  },

  async redefinirSenha(token, nova_senha) {
    return this.fetch('/auth/redefinir-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, nova_senha })
    });
  },

  // VEÍCULOS
  async listarVeiculos(pagina = 1, pesquisa = '') {
    return this.fetch(`/veiculos?pagina=${pagina}&pesquisa=${encodeURIComponent(pesquisa)}`);
  },

  async obterVeiculo(id) {
    return this.fetch(`/veiculos/${id}`);
  },

  async criarVeiculo(dados) {
    return this.fetch('/veiculos', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  },

  async atualizarVeiculo(id, dados) {
    return this.fetch(`/veiculos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
  },

  async excluirVeiculo(id) {
    return this.fetch(`/veiculos/${id}`, {
      method: 'DELETE'
    });
  },

  // INTERVENÇÕES
  async listarIntervencoes(pagina = 1, filtros = {}) {
    // Construir query params a partir dos filtros
    const params = new URLSearchParams({
      pagina: pagina,
      ...filtros
    });
    
    return this.fetch(`/intervencoes?${params.toString()}`);
  },

  async obterIntervencao(id) {
    return this.fetch(`/intervencoes/${id}`);
  },

  async criarIntervencao(dados) {
    return this.fetch('/intervencoes', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  },

  async atualizarIntervencao(id, dados) {
    return this.fetch(`/intervencoes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
  },

  async atualizarStatusIntervencao(id, status) {
    return this.fetch(`/intervencoes/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async excluirIntervencao(id) {
    return this.fetch(`/intervencoes/${id}`, {
      method: 'DELETE'
    });
  },

  async obterEstatisticasIntervencoes() {
    return this.fetch('/intervencoes/estatisticas/dashboard');
  },

  // USUÁRIOS
  async listarUsuarios(pagina = 1, pesquisa = '') {
    return this.fetch(`/usuarios?pagina=${pagina}&pesquisa=${encodeURIComponent(pesquisa)}`);
  },

  async obterUsuario(id) {
    return this.fetch(`/usuarios/${id}`);
  },

  async criarUsuario(dados) {
    return this.fetch('/usuarios', {
      method: 'POST',
      body: JSON.stringify(dados)
    });
  },

  async atualizarUsuario(id, dados) {
    return this.fetch(`/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
  },

  async excluirUsuario(id) {
    return this.fetch(`/usuarios/${id}`, {
      method: 'DELETE'
    });
  },

  async alterarSenha(senha_atual, nova_senha) {
    return this.fetch('/usuarios/alterar-senha', {
      method: 'POST',
      body: JSON.stringify({ senha_atual, nova_senha })
    });
  },

  async listarTecnicos() {
    return this.fetch('/usuarios/lista/tecnicos');
  }
};

// Exportar o módulo API
window.API = API;