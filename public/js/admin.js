// Continuação do código do arquivo admin.js

// Event listener para botão de logout
const btnLogout = document.getElementById('btn-logout');
const btnMobileLogout = document.getElementById('btn-mobile-logout');

if (btnLogout) {
    btnLogout.addEventListener('click', fazerLogout);
}

if (btnMobileLogout) {
    btnMobileLogout.addEventListener('click', fazerLogout);
}

// Funções para verificar acesso
function verificarAdmin() {
    const token = localStorage.getItem('token');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    if (!token || usuario.funcao !== 'admin') {
        // Redirecionar para página de login se não for admin
        window.location.href = 'login.html';
    }
}

function verificarUsuarioLogado() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const imagemUser = document.querySelector('.imagem-user');
    
    if (usuario && usuario.imagem) {
        imagemUser.src = usuario.imagem;
    }
}

function fazerLogout() {
    // Limpar dados do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    // Redirecionar para página de login
    window.location.href = 'login.html';
}

// Funções para carregar dados
async function carregarVeiculos(pagina = 1, termoPesquisa = '') {
    try {
        const token = localStorage.getItem('token');
        let url = `api/veiculos?pagina=${pagina}`;
        
        if (termoPesquisa) {
            url += `&pesquisa=${encodeURIComponent(termoPesquisa)}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao carregar veículos');
        }
        
        const data = await response.json();
        exibirVeiculos(data.veiculos);
        criarPaginacao(data.totalPaginas, pagina, 'paginacao-veiculos', carregarVeiculos, termoPesquisa);
        
        // Também carregar veículos para o dropdown no modal de intervenção
        preencherDropdownVeiculos(data.veiculos);
        
    } catch (error) {
        exibirAlerta('Erro ao carregar veículos: ' + error.message, 'danger');
    }
}

async function carregarIntervencoes(pagina = 1, termoPesquisa = '') {
    try {
        const token = localStorage.getItem('token');
        let url = `api/intervencoes?pagina=${pagina}`;
        
        if (termoPesquisa) {
            url += `&pesquisa=${encodeURIComponent(termoPesquisa)}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao carregar intervenções');
        }
        
        const data = await response.json();
        exibirIntervencoes(data.intervencoes);
        criarPaginacao(data.totalPaginas, pagina, 'paginacao-intervencoes', carregarIntervencoes, termoPesquisa);
        
    } catch (error) {
        exibirAlerta('Erro ao carregar intervenções: ' + error.message, 'danger');
    }
}

async function carregarUsuarios(pagina = 1, termoPesquisa = '') {
    try {
        const token = localStorage.getItem('token');
        let url = `api/usuarios?pagina=${pagina}`;
        
        if (termoPesquisa) {
            url += `&pesquisa=${encodeURIComponent(termoPesquisa)}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao carregar usuários');
        }
        
        const data = await response.json();
        exibirUsuarios(data.usuarios);
        criarPaginacao(data.totalPaginas, pagina, 'paginacao-usuarios', carregarUsuarios, termoPesquisa);
        
    } catch (error) {
        exibirAlerta('Erro ao carregar usuários: ' + error.message, 'danger');
    }
}

// Funções para exibir dados nas tabelas
function exibirVeiculos(veiculos) {
    const tabela = document.getElementById('tabela-veiculos');
    
    if (!tabela) return;
    
    let html = '';
    
    if (veiculos.length === 0) {
        html = '<tr><td colspan="7" class="text-center">Nenhum veículo encontrado</td></tr>';
    } else {
        veiculos.forEach(veiculo => {
            html += `
                <tr>
                    <td>${veiculo.id}</td>
                    <td>${veiculo.marca}</td>
                    <td>${veiculo.modelo}</td>
                    <td>${veiculo.matricula}</td>
                    <td>${veiculo.ano}</td>
                    <td>${veiculo.cor}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1" onclick="editarVeiculo(${veiculo.id})">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmarExclusao('veiculo', ${veiculo.id})">
                            <i class="bi bi-trash"></i> Excluir
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    tabela.innerHTML = html;
}

function exibirIntervencoes(intervencoes) {
    const tabela = document.getElementById('tabela-intervencoes');
    
    if (!tabela) return;
    
    let html = '';
    
    if (intervencoes.length === 0) {
        html = '<tr><td colspan="6" class="text-center">Nenhuma intervenção encontrada</td></tr>';
    } else {
        intervencoes.forEach(intervencao => {
            const data = new Date(intervencao.data).toLocaleDateString('pt-PT');
            html += `
                <tr>
                    <td>${intervencao.id}</td>
                    <td>${intervencao.veiculo_marca} ${intervencao.veiculo_modelo} (${intervencao.veiculo_matricula})</td>
                    <td>${data}</td>
                    <td>${intervencao.tipo}</td>
                    <td>${intervencao.tecnico}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1" onclick="editarIntervencao(${intervencao.id})">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmarExclusao('intervencao', ${intervencao.id})">
                            <i class="bi bi-trash"></i> Excluir
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    tabela.innerHTML = html;
}

function exibirUsuarios(usuarios) {
    const tabela = document.getElementById('tabela-usuarios');
    
    if (!tabela) return;
    
    let html = '';
    
    if (usuarios.length === 0) {
        html = '<tr><td colspan="6" class="text-center">Nenhum usuário encontrado</td></tr>';
    } else {
        usuarios.forEach(usuario => {
            const dataCadastro = new Date(usuario.data_cadastro).toLocaleDateString('pt-PT');
            const funcao = {
                'admin': 'Administrador',
                'tecnico': 'Técnico',
                'usuario': 'Usuário Regular'
            }[usuario.funcao] || usuario.funcao;
            
            html += `
                <tr>
                    <td>${usuario.id}</td>
                    <td>${usuario.nome}</td>
                    <td>${usuario.email}</td>
                    <td>${funcao}</td>
                    <td>${dataCadastro}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1" onclick="editarUsuario(${usuario.id})">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmarExclusao('usuario', ${usuario.id})">
                            <i class="bi bi-trash"></i> Excluir
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    tabela.innerHTML = html;
}

// Função para criar paginação
function criarPaginacao(totalPaginas, paginaAtual, idElemento, funcaoCarregar, termoPesquisa) {
    const paginacao = document.getElementById(idElemento);
    
    if (!paginacao) return;
    
    let html = '';
    
    // Botão Anterior
    html += `
        <li class="page-item ${paginaAtual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="event.preventDefault(); ${funcaoCarregar.name}(${paginaAtual - 1}, '${termoPesquisa}')">Anterior</a>
        </li>
    `;
    
    // Páginas numeradas
    const maxPaginas = 5;
    const metade = Math.floor(maxPaginas / 2);
    let inicio = Math.max(1, paginaAtual - metade);
    let fim = Math.min(totalPaginas, inicio + maxPaginas - 1);
    
    if (fim - inicio + 1 < maxPaginas) {
        inicio = Math.max(1, fim - maxPaginas + 1);
    }
    
    for (let i = inicio; i <= fim; i++) {
        html += `
            <li class="page-item ${i === paginaAtual ? 'active' : ''}">
                <a class="page-link" href="#" onclick="event.preventDefault(); ${funcaoCarregar.name}(${i}, '${termoPesquisa}')">${i}</a>
            </li>
        `;
    }
    
    // Botão Próximo
    html += `
        <li class="page-item ${paginaAtual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="event.preventDefault(); ${funcaoCarregar.name}(${paginaAtual + 1}, '${termoPesquisa}')">Próximo</a>
        </li>
    `;
    
    paginacao.innerHTML = html;
}

// Funções para abrir modais
function abrirModalVeiculo(id = null) {
    const modal = new bootstrap.Modal(document.getElementById('veiculoModal'));
    const titulo = document.getElementById('veiculoModalLabel');
    
    if (id) {
        titulo.textContent = 'Editar Veículo';
        carregarDadosVeiculo(id);
    } else {
        titulo.textContent = 'Novo Veículo';
        document.getElementById('form-veiculo').reset();
        document.getElementById('veiculo-id').value = '';
    }
    
    modal.show();
}

function abrirModalIntervencao(id = null) {
    const modal = new bootstrap.Modal(document.getElementById('intervencaoModal'));
    const titulo = document.getElementById('intervencaoModalLabel');
    
    if (id) {
        titulo.textContent = 'Editar Intervenção';
        carregarDadosIntervencao(id);
    } else {
        titulo.textContent = 'Nova Intervenção';
        document.getElementById('form-intervencao').reset();
        document.getElementById('intervencao-id').value = '';
        
        // Definir a data de hoje como padrão
        const hoje = new Date().toISOString().split('T')[0];
        document.getElementById('intervencao-data').value = hoje;
    }
    
    modal.show();
}

function abrirModalUsuario(id = null) {
    const modal = new bootstrap.Modal(document.getElementById('usuarioModal'));
    const titulo = document.getElementById('usuarioModalLabel');
    
    if (id) {
        titulo.textContent = 'Editar Usuário';
        carregarDadosUsuario(id);
    } else {
        titulo.textContent = 'Novo Usuário';
        document.getElementById('form-usuario').reset();
        document.getElementById('usuario-id').value = '';
    }
    
    modal.show();
}

// Funções para carregar dados para edição
async function carregarDadosVeiculo(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`api/veiculos/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao carregar dados do veículo');
        }
        
        const veiculo = await response.json();
        
        document.getElementById('veiculo-id').value = veiculo.id;
        document.getElementById('veiculo-marca').value = veiculo.marca;
        document.getElementById('veiculo-modelo').value = veiculo.modelo;
        document.getElementById('veiculo-ano').value = veiculo.ano;
        document.getElementById('veiculo-cor').value = veiculo.cor;
        document.getElementById('veiculo-matricula').value = veiculo.matricula;
        document.getElementById('veiculo-vin').value = veiculo.vin || '';
        document.getElementById('veiculo-imagem').value = veiculo.imagem || '';
        document.getElementById('veiculo-pneus').value = veiculo.pneus || '';
        document.getElementById('veiculo-jante').value = veiculo.jante || '';
        
    } catch (error) {
        exibirAlerta('Erro ao carregar dados do veículo: ' + error.message, 'danger');
    }
}

async function carregarDadosIntervencao(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`api/intervencoes/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao carregar dados da intervenção');
        }
        
        const intervencao = await response.json();
        
        document.getElementById('intervencao-id').value = intervencao.id;
        document.getElementById('intervencao-veiculo').value = intervencao.veiculo_id;
        document.getElementById('intervencao-data').value = intervencao.data.split('T')[0];
        document.getElementById('intervencao-tipo').value = intervencao.tipo;
        document.getElementById('intervencao-tecnico').value = intervencao.tecnico;
        document.getElementById('intervencao-descricao').value = intervencao.descricao;
        
    } catch (error) {
        exibirAlerta('Erro ao carregar dados da intervenção: ' + error.message, 'danger');
    }
}

async function carregarDadosUsuario(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`api/usuarios/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Falha ao carregar dados do usuário');
        }
        
        const usuario = await response.json();
        
        document.getElementById('usuario-id').value = usuario.id;
        document.getElementById('usuario-nome').value = usuario.nome;
        document.getElementById('usuario-email').value = usuario.email;
        document.getElementById('usuario-funcao').value = usuario.funcao;
        document.getElementById('usuario-imagem').value = usuario.imagem || '';
        
        // Limpar campo de senha, pois não deve ser exibido
        document.getElementById('usuario-senha').value = '';
        
    } catch (error) {
        exibirAlerta('Erro ao carregar dados do usuário: ' + error.message, 'danger');
    }
}

// Funções para salvar dados
async function salvarVeiculo() {
    try {
        const id = document.getElementById('veiculo-id').value;
        const token = localStorage.getItem('token');
        
        const veiculo = {
            marca: document.getElementById('veiculo-marca').value,
            modelo: document.getElementById('veiculo-modelo').value,
            ano: parseInt(document.getElementById('veiculo-ano').value),
            cor: document.getElementById('veiculo-cor').value,
            matricula: document.getElementById('veiculo-matricula').value,
            vin: document.getElementById('veiculo-vin').value || null,
            imagem: document.getElementById('veiculo-imagem').value || null,
            pneus: document.getElementById('veiculo-pneus').value || null,
            jante: document.getElementById('veiculo-jante').value || null
        };
        
        const url = id ? `api/veiculos/${id}` : 'api/veiculos';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(veiculo)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensagem || 'Falha ao salvar veículo');
        }
        
        // Fechar modal e recarregar dados
        const modal = bootstrap.Modal.getInstance(document.getElementById('veiculoModal'));
        modal.hide();
        
        exibirAlerta(`Veículo ${id ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
        carregarVeiculos();
        
    } catch (error) {
        exibirAlerta('Erro ao salvar veículo: ' + error.message, 'danger');
    }
}

async function salvarIntervencao() {
    try {
        const id = document.getElementById('intervencao-id').value;
        const token = localStorage.getItem('token');
        
        const intervencao = {
            veiculo_id: parseInt(document.getElementById('intervencao-veiculo').value),
            data: document.getElementById('intervencao-data').value,
            tipo: document.getElementById('intervencao-tipo').value,
            tecnico: document.getElementById('intervencao-tecnico').value,
            descricao: document.getElementById('intervencao-descricao').value
        };
        
        const url = id ? `api/intervencoes/${id}` : 'api/intervencoes';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(intervencao)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensagem || 'Falha ao salvar intervenção');
        }
        
        // Fechar modal e recarregar dados
        const modal = bootstrap.Modal.getInstance(document.getElementById('intervencaoModal'));
        modal.hide();
        
        exibirAlerta(`Intervenção ${id ? 'atualizada' : 'cadastrada'} com sucesso!`, 'success');
        carregarIntervencoes();
        
    } catch (error) {
        exibirAlerta('Erro ao salvar intervenção: ' + error.message, 'danger');
    }
}

async function salvarUsuario() {
    try {
        const id = document.getElementById('usuario-id').value;
        const token = localStorage.getItem('token');
        
        const usuario = {
            nome: document.getElementById('usuario-nome').value,
            email: document.getElementById('usuario-email').value,
            funcao: document.getElementById('usuario-funcao').value,
            imagem: document.getElementById('usuario-imagem').value || null
        };
        
        // Adicionar senha apenas se estiver preenchida
        const senha = document.getElementById('usuario-senha').value;
        if (senha) {
            usuario.senha = senha;
        }
        
        const url = id ? `api/usuarios/${id}` : 'api/usuarios';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(usuario)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensagem || 'Falha ao salvar usuário');
        }
        
        // Fechar modal e recarregar dados
        const modal = bootstrap.Modal.getInstance(document.getElementById('usuarioModal'));
        modal.hide();
        
        exibirAlerta(`Usuário ${id ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
        carregarUsuarios();
        
    } catch (error) {
        exibirAlerta('Erro ao salvar usuário: ' + error.message, 'danger');
    }
}

// Funções para exclusão
function confirmarExclusao(tipo, id) {
    const modal = new bootstrap.Modal(document.getElementById('confirmacaoModal'));
    const btnConfirmar = document.getElementById('btn-confirmar-exclusao');
    
    // Remover event listeners antigos
    const novoBtn = btnConfirmar.cloneNode(true);
    btnConfirmar.parentNode.replaceChild(novoBtn, btnConfirmar);
    
    // Adicionar novo event listener
    novoBtn.addEventListener('click', () => excluirItem(tipo, id));
    
    modal.show();
}

async function excluirItem(tipo, id) {
    try {
        const token = localStorage.getItem('token');
        let url;
        
        switch (tipo) {
            case 'veiculo':
                url = `api/veiculos/${id}`;
                break;
            case 'intervencao':
                url = `api/intervencoes/${id}`;
                break;
            case 'usuario':
                url = `api/usuarios/${id}`;
                break;
            default:
                throw new Error('Tipo inválido');
        }
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.mensagem || `Falha ao excluir ${tipo}`);
        }
        
        // Fechar modal e recarregar dados
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmacaoModal'));
        modal.hide();
        
        exibirAlerta(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} excluído com sucesso!`, 'success');
        
        // Recarregar a lista apropriada
        switch (tipo) {
            case 'veiculo':
                carregarVeiculos();
                break;
            case 'intervencao':
                carregarIntervencoes();
                break;
            case 'usuario':
                carregarUsuarios();
                break;
        }
        
    } catch (error) {
        exibirAlerta(`Erro ao excluir ${tipo}: ${error.message}`, 'danger');
    }
}

// Função para preencher dropdown de veículos no modal de intervenção
function preencherDropdownVeiculos(veiculos) {
    const select = document.getElementById('intervencao-veiculo');
    
    if (!select) return;
    
    // Manter apenas a primeira opção (Selecione um veículo)
    select.innerHTML = '<option value="">Selecione um veículo</option>';
    
    veiculos.forEach(veiculo => {
        const option = document.createElement('option');
        option.value = veiculo.id;
        option.textContent = `${veiculo.marca} ${veiculo.modelo} (${veiculo.matricula})`;
        select.appendChild(option);
    });
}

// Função auxiliar para exibir alertas
function exibirAlerta(mensagem, tipo) {
    // Criar elemento de alerta
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.role = 'alert';
    alerta.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    
    // Adicionar ao topo da página
    const container = document.querySelector('.container');
    container.insertBefore(alerta, container.firstChild);
    
    // Remover automaticamente após 5 segundos
    setTimeout(() => {
        alerta.classList.remove('show');
        setTimeout(() => alerta.remove(), 150);
    }, 5000);
}

// Funções para edição de itens
function editarVeiculo(id) {
    abrirModalVeiculo(id);
}

function editarIntervencao(id) {
    abrirModalIntervencao(id);
}

function editarUsuario(id) {
    abrirModalUsuario(id);
}