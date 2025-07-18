console.log("admin.js loaded successfully");

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded fired, starting verification...");
    verificarAdmin();
    carregarVeiculos();

    const btnLogout = document.getElementById('btn-logout');
    const btnMobileLogout = document.getElementById('btn-mobile-logout');

    if (btnLogout) btnLogout.addEventListener('click', fazerLogout);
    if (btnMobileLogout) btnMobileLogout.addEventListener('click', fazerLogout);

    const btnNovoVeiculo = document.getElementById('btn-novo-veiculo');
    const btnSalvarVeiculo = document.getElementById('btn-salvar-veiculo');

    if (btnNovoVeiculo) btnNovoVeiculo.addEventListener('click', () => abrirModalVeiculo());
    if (btnSalvarVeiculo) btnSalvarVeiculo.addEventListener('click', salvarVeiculo);

    const pesquisaVeiculo = document.getElementById('pesquisa-veiculo');
    if (pesquisaVeiculo) {
        pesquisaVeiculo.addEventListener('input', debounce(function () {
            carregarVeiculos(1, this.value);
        }, 500));
    }

    // Intervenções event listeners
    const btnNovaIntervencao = document.getElementById('btn-nova-intervencao');
    const btnSalvarIntervencao = document.getElementById('btn-salvar-intervencao');

    if (btnNovaIntervencao) btnNovaIntervencao.addEventListener('click', () => abrirModalIntervencao());
    if (btnSalvarIntervencao) btnSalvarIntervencao.addEventListener('click', salvarIntervencao);

    const pesquisaIntervencao = document.getElementById('pesquisa-intervencao');
    if (pesquisaIntervencao) {
        pesquisaIntervencao.addEventListener('input', debounce(function () {
            carregarIntervencoes(1, this.value);
        }, 500));
    }

    // Usuários event listeners
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const btnSalvarUsuario = document.getElementById('btn-salvar-usuario');

    if (btnNovoUsuario) btnNovoUsuario.addEventListener('click', () => abrirModalUsuario());
    if (btnSalvarUsuario) btnSalvarUsuario.addEventListener('click', salvarUsuario);

    const pesquisaUsuario = document.getElementById('pesquisa-usuario');
    if (pesquisaUsuario) {
        pesquisaUsuario.addEventListener('input', debounce(function () {
            carregarUsuarios(1, this.value);
        }, 500));
    }

    // Tab switching handlers
    const adminTabs = document.querySelectorAll('#adminTabs button[data-bs-toggle="tab"]');
    adminTabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function (event) {
            const target = event.target.getAttribute('data-bs-target');
            if (target === '#intervencoes') {
                carregarIntervencoes();
                carregarVeiculosParaSelect();
            } else if (target === '#usuarios') {
                carregarUsuarios();
            }
        });
    });
});

async function verificarAdmin() {
    console.log("verificarAdmin started");
    
    try {
        console.log("Fetching session...");
        const res = await fetch("../link/endp.php/session");
        console.log("Session response status:", res.status);
        
        const json = await res.json();
        console.log("Session data:", json);
        
        if (json.ok && json.user && json.user.permissao === "manager") {
            console.log("✅ User authenticated as manager - staying on page");
        } else {
            console.log("❌ User not authenticated as manager - redirecting");
            console.log("Details:", {
                ok: json.ok,
                hasUser: !!json.user,
                permission: json.user?.permissao
            });
            window.location.href = "../login.html";
        }
    } catch (err) {
        console.error("❌ Error in verificarAdmin:", err);
        window.location.href = "../login.html";
    }
}

async function fazerLogout() {
    try {
        await fetch('../link/endp.php/logout', {
            method: 'POST',
            credentials: 'include'
        });
        console.log('Logout successful');
        window.location.href = '../login.html';
    } catch (error) {
        alert('Erro ao terminar sessão.');
    }
}

function debounce(func, wait) {
    let timeout;
    return function () {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

async function carregarVeiculos(pagina = 1, termoPesquisa = '') {
    console.log("carregarVeiculos called");
    try {
        let url = `../link/endp.php/getCars?pagina=${pagina}`;
        if (termoPesquisa) {
            url += `&pesquisa=${encodeURIComponent(termoPesquisa)}`;
        }

        const response = await fetch(url);
        const json = await response.json();
        console.log("Vehicle data:", json);

        if (json.ok) {
            exibirVeiculos(json.veiculos || []);
            exibirPaginacao(json.pagina || 1, json.totalPaginas || 1, termoPesquisa);
            exibirInfoPaginacao(json.pagina || 1, json.total || 0, (json.veiculos || []).length);
        } else {
            exibirAlerta("Erro ao carregar veículos.", 'danger');
        }
    } catch (error) {
        console.error("Erro em carregarVeiculos:", error);
        exibirAlerta("Erro na ligação com o servidor.", 'danger');
    }
}

function exibirVeiculos(veiculos) {
    const tabela = document.getElementById('tabela-veiculos');
    if (!tabela) return;

    let html = '';
    if (veiculos.length === 0) {
        html = '<tr><td colspan="7" class="text-center">Nenhum veículo encontrado</td></tr>';
    } else {
        veiculos.forEach(v => {
            html += `<tr>
                <td>${v.id}</td>
                <td>${v.marca}</td>
                <td>${v.modelo}</td>
                <td>${v.matricula || 'N/A'}</td>
                <td>${v.ano}</td>
                <td>${v.cor}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="editarVeiculo(${v.id})">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmarExclusao(${v.id})">
                        <i class="bi bi-trash"></i> Excluir
                    </button>
                </td>
            </tr>`;
        });
    }

    tabela.innerHTML = html;
}

function exibirPaginacao(paginaAtual, totalPaginas, termoPesquisa = '') {
    const paginacao = document.getElementById('paginacao-veiculos');
    if (!paginacao) return;

    let html = '';
    
    if (totalPaginas <= 1) {
        paginacao.innerHTML = '';
        return;
    }

    // Botão Anterior
    html += `<li class="page-item ${paginaAtual <= 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="event.preventDefault(); carregarVeiculos(${paginaAtual - 1}, '${termoPesquisa}')">Anterior</a>
    </li>`;

    // Páginas numeradas
    let startPage = Math.max(1, paginaAtual - 2);
    let endPage = Math.min(totalPaginas, paginaAtual + 2);

    // Primeira página
    if (startPage > 1) {
        html += `<li class="page-item">
            <a class="page-link" href="#" onclick="event.preventDefault(); carregarVeiculos(1, '${termoPesquisa}')">1</a>
        </li>`;
        if (startPage > 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    // Páginas do meio
    for (let i = startPage; i <= endPage; i++) {
        html += `<li class="page-item ${i === paginaAtual ? 'active' : ''}">
            <a class="page-link" href="#" onclick="event.preventDefault(); carregarVeiculos(${i}, '${termoPesquisa}')">${i}</a>
        </li>`;
    }

    // Última página
    if (endPage < totalPaginas) {
        if (endPage < totalPaginas - 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        html += `<li class="page-item">
            <a class="page-link" href="#" onclick="event.preventDefault(); carregarVeiculos(${totalPaginas}, '${termoPesquisa}')">${totalPaginas}</a>
        </li>`;
    }

    // Botão Próximo
    html += `<li class="page-item ${paginaAtual >= totalPaginas ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="event.preventDefault(); carregarVeiculos(${paginaAtual + 1}, '${termoPesquisa}')">Próximo</a>
    </li>`;

    paginacao.innerHTML = html;
}

function exibirInfoPaginacao(paginaAtual, totalItens, itensNaPagina) {
    // Add pagination info above the table
    const tabelaContainer = document.querySelector('.table-responsive');
    if (!tabelaContainer) return;
    
    // Remove existing info if present
    const existingInfo = document.querySelector('.pagination-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    if (totalItens > 0) {
        const startItem = ((paginaAtual - 1) * 10) + 1;
        const endItem = startItem + itensNaPagina - 1;
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'pagination-info mb-2 text-muted small';
        infoDiv.innerHTML = `Mostrando ${startItem} a ${endItem} de ${totalItens} veículos`;
        
        tabelaContainer.parentNode.insertBefore(infoDiv, tabelaContainer);
    }
}

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

async function carregarDadosVeiculo(id) {
    try {
        const response = await fetch(`../link/endp.php/getCar/${id}`);
        const veiculo = await response.json();

        document.getElementById('veiculo-id').value = veiculo.id || '';
        document.getElementById('veiculo-marca').value = veiculo.marca || '';
        document.getElementById('veiculo-modelo').value = veiculo.modelo || '';
        document.getElementById('veiculo-ano').value = veiculo.ano || '';
        document.getElementById('veiculo-cor').value = veiculo.cor || '';
        document.getElementById('veiculo-matricula').value = veiculo.matricula || '';
        document.getElementById('veiculo-vin').value = veiculo.vin || '';
        document.getElementById('veiculo-imagem').value = veiculo.imagem || '';
        document.getElementById('veiculo-pneus').value = veiculo.pneus || '';
        document.getElementById('veiculo-jante').value = veiculo.jantes || '';
    } catch (error) {
        console.error("Error loading vehicle data:", error);
        exibirAlerta("Erro ao carregar veículo para edição", 'danger');
    }
}

async function salvarVeiculo() {
    try {
        const id = document.getElementById('veiculo-id').value;
        const veiculo = {
            marca: document.getElementById('veiculo-marca').value,
            modelo: document.getElementById('veiculo-modelo').value,
            ano: parseInt(document.getElementById('veiculo-ano').value),
            cor: document.getElementById('veiculo-cor').value,
            pneus: document.getElementById('veiculo-pneus').value || null
        };
        
        // Only add these fields if the form elements exist and have values
        const matriculaEl = document.getElementById('veiculo-matricula');
        const vinEl = document.getElementById('veiculo-vin');
        const imagemEl = document.getElementById('veiculo-imagem');
        const janteEl = document.getElementById('veiculo-jante');
        
        if (matriculaEl && matriculaEl.value) veiculo.matricula = matriculaEl.value;
        if (vinEl && vinEl.value) veiculo.vin = vinEl.value;
        if (imagemEl && imagemEl.value) veiculo.imagem = imagemEl.value;
        if (janteEl && janteEl.value) veiculo.jantes = janteEl.value;

        console.log('Sending vehicle data:', veiculo);

        const response = await fetch(`../link/endp.php/${id ? 'updateCar/' + id : 'createCar'}`, {
            method: id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(veiculo)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        let json;
        try {
            json = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Response was:', responseText);
            throw new Error('Servidor retornou resposta inválida. Verifique os logs do servidor.');
        }

        if (json.ok) {
            bootstrap.Modal.getInstance(document.getElementById('veiculoModal')).hide();
            carregarVeiculos();
            exibirAlerta(`Veículo ${id ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
        } else {
            throw new Error(json.mensagem || json.error || 'Erro ao salvar');
        }

    } catch (error) {
        console.error('Save vehicle error:', error);
        exibirAlerta('Erro ao salvar veículo: ' + error.message, 'danger');
    }
}

function confirmarExclusao(id) {
    const modal = new bootstrap.Modal(document.getElementById('confirmacaoModal'));
    const btn = document.getElementById('btn-confirmar-exclusao');

    const novoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(novoBtn, btn);

    novoBtn.addEventListener('click', () => excluirVeiculo(id));
    modal.show();
}

async function excluirVeiculo(id) {
    try {
        const response = await fetch(`../link/endp.php/deleteCar/${id}`, {
            method: 'DELETE'
        });

        const json = await response.json();
        if (json.ok) {
            bootstrap.Modal.getInstance(document.getElementById('confirmacaoModal')).hide();
            carregarVeiculos();
            exibirAlerta('Veículo excluído com sucesso!', 'success');
        } else {
            throw new Error(json.mensagem || json.error || 'Erro ao excluir');
        }
    } catch (error) {
        exibirAlerta('Erro ao excluir veículo: ' + error.message, 'danger');
    }
}

function editarVeiculo(id) {
    abrirModalVeiculo(id);
}

function exibirAlerta(mensagem, tipo) {
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show`;
    alerta.role = 'alert';
    alerta.innerHTML = `
        ${mensagem}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;

    const container = document.querySelector('.container');
    container.insertBefore(alerta, container.firstChild);

    setTimeout(() => {
        alerta.classList.remove('show');
        setTimeout(() => alerta.remove(), 150);
    }, 5000);
}

// ============= INTERVENÇÕES FUNCTIONS =============

async function carregarIntervencoes(pagina = 1, termoPesquisa = '') {
    console.log("carregarIntervencoes called");
    try {
        let url = `../link/endp.php/getInterventions?pagina=${pagina}`;
        if (termoPesquisa) {
            url += `&pesquisa=${encodeURIComponent(termoPesquisa)}`;
        }

        const response = await fetch(url);
        const json = await response.json();
        console.log("Intervention data:", json);

        if (json.ok) {
            exibirIntervencoes(json.intervencoes || []);
            exibirPaginacaoIntervencoes(json.pagina || 1, json.totalPaginas || 1, termoPesquisa);
            exibirInfoPaginacaoIntervencoes(json.pagina || 1, json.total || 0, (json.intervencoes || []).length);
        } else {
            exibirAlerta("Erro ao carregar intervenções.", 'danger');
        }
    } catch (error) {
        console.error("Erro em carregarIntervencoes:", error);
        exibirAlerta("Erro na ligação com o servidor.", 'danger');
    }
}

function exibirIntervencoes(intervencoes) {
    const tabela = document.getElementById('tabela-intervencoes');
    if (!tabela) return;

    let html = '';
    if (intervencoes.length === 0) {
        html = '<tr><td colspan="6" class="text-center">Nenhuma intervenção encontrada</td></tr>';
    } else {
        intervencoes.forEach(i => {
            const dataFormatada = new Date(i.data_inter).toLocaleDateString('pt-PT');
            html += `<tr>
                <td>${i.id}</td>
                <td>${i.veiculo_info || 'N/A'}</td>
                <td>${dataFormatada}</td>
                <td>${i.nome}</td>
                <td>${i.descricao || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="editarIntervencao(${i.id})">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmarExclusaoIntervencao(${i.id})">
                        <i class="bi bi-trash"></i> Excluir
                    </button>
                </td>
            </tr>`;
        });
    }

    tabela.innerHTML = html;
}

function exibirPaginacaoIntervencoes(paginaAtual, totalPaginas, termoPesquisa = '') {
    const paginacao = document.getElementById('paginacao-intervencoes');
    if (!paginacao) return;

    let html = '';
    
    if (totalPaginas <= 1) {
        paginacao.innerHTML = '';
        return;
    }

    // Botão Anterior
    html += `<li class="page-item ${paginaAtual <= 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="event.preventDefault(); carregarIntervencoes(${paginaAtual - 1}, '${termoPesquisa}')">Anterior</a>
    </li>`;

    // Páginas numeradas
    let startPage = Math.max(1, paginaAtual - 2);
    let endPage = Math.min(totalPaginas, paginaAtual + 2);

    // Primeira página
    if (startPage > 1) {
        html += `<li class="page-item">
            <a class="page-link" href="#" onclick="event.preventDefault(); carregarIntervencoes(1, '${termoPesquisa}')">1</a>
        </li>`;
        if (startPage > 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    // Páginas do meio
    for (let i = startPage; i <= endPage; i++) {
        html += `<li class="page-item ${i === paginaAtual ? 'active' : ''}">
            <a class="page-link" href="#" onclick="event.preventDefault(); carregarIntervencoes(${i}, '${termoPesquisa}')">${i}</a>
        </li>`;
    }

    // Última página
    if (endPage < totalPaginas) {
        if (endPage < totalPaginas - 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        html += `<li class="page-item">
            <a class="page-link" href="#" onclick="event.preventDefault(); carregarIntervencoes(${totalPaginas}, '${termoPesquisa}')">${totalPaginas}</a>
        </li>`;
    }

    // Botão Próximo
    html += `<li class="page-item ${paginaAtual >= totalPaginas ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="event.preventDefault(); carregarIntervencoes(${paginaAtual + 1}, '${termoPesquisa}')">Próximo</a>
    </li>`;

    paginacao.innerHTML = html;
}

function exibirInfoPaginacaoIntervencoes(paginaAtual, totalItens, itensNaPagina) {
    const tabelaContainer = document.querySelector('#intervencoes .table-responsive');
    if (!tabelaContainer) return;
    
    // Remove existing info if present
    const existingInfo = document.querySelector('#intervencoes .pagination-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    if (totalItens > 0) {
        const startItem = ((paginaAtual - 1) * 10) + 1;
        const endItem = startItem + itensNaPagina - 1;
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'pagination-info mb-2 text-muted small';
        infoDiv.innerHTML = `Mostrando ${startItem} a ${endItem} de ${totalItens} intervenções`;
        
        tabelaContainer.parentNode.insertBefore(infoDiv, tabelaContainer);
    }
}

async function carregarVeiculosParaSelect() {
    try {
        const response = await fetch('../link/endp.php/getCars?limite=1000');
        const json = await response.json();
        
        if (json.ok) {
            const select = document.getElementById('intervencao-veiculo');
            if (select) {
                select.innerHTML = '<option value="">Selecione um veículo</option>';
                json.veiculos.forEach(veiculo => {
                    select.innerHTML += `<option value="${veiculo.id}">${veiculo.marca} ${veiculo.modelo} - ${veiculo.matricula || veiculo.id}</option>`;
                });
            }
        }
    } catch (error) {
        console.error("Erro ao carregar veículos para select:", error);
    }
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
        // Set today's date as default
        document.getElementById('intervencao-data').value = new Date().toISOString().split('T')[0];
    }

    modal.show();
}

async function carregarDadosIntervencao(id) {
    try {
        const response = await fetch(`../link/endp.php/getIntervention/${id}`);
        const intervencao = await response.json();

        document.getElementById('intervencao-id').value = intervencao.id || '';
        document.getElementById('intervencao-veiculo').value = intervencao.carro_id || '';
        document.getElementById('intervencao-data').value = intervencao.data_inter || '';
        document.getElementById('intervencao-tipo').value = intervencao.nome || '';
        document.getElementById('intervencao-tecnico').value = intervencao.mec_id || '';
        document.getElementById('intervencao-descricao').value = intervencao.descricao || '';
    } catch (error) {
        console.error("Error loading intervention data:", error);
        exibirAlerta("Erro ao carregar intervenção para edição", 'danger');
    }
}

async function salvarIntervencao() {
    try {
        const id = document.getElementById('intervencao-id').value;
        const intervencao = {
            carro_id: document.getElementById('intervencao-veiculo').value,
            data_inter: document.getElementById('intervencao-data').value,
            nome: document.getElementById('intervencao-tipo').value,
            descricao: document.getElementById('intervencao-descricao').value
        };

        // Add mec_id if provided
        const mecId = document.getElementById('intervencao-tecnico').value;
        if (mecId) {
            intervencao.mec_id = mecId;
        }

        console.log('Sending intervention data:', intervencao);

        const response = await fetch(`../link/endp.php/${id ? 'updateIntervention/' + id : 'createIntervention'}`, {
            method: id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(intervencao)
        });

        console.log('Response status:', response.status);
        
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        let json;
        try {
            json = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Response was:', responseText);
            throw new Error('Servidor retornou resposta inválida. Verifique os logs do servidor.');
        }

        if (json.ok) {
            bootstrap.Modal.getInstance(document.getElementById('intervencaoModal')).hide();
            carregarIntervencoes();
            exibirAlerta(`Intervenção ${id ? 'atualizada' : 'cadastrada'} com sucesso!`, 'success');
        } else {
            throw new Error(json.mensagem || json.error || 'Erro ao salvar');
        }

    } catch (error) {
        console.error('Save intervention error:', error);
        exibirAlerta('Erro ao salvar intervenção: ' + error.message, 'danger');
    }
}

function confirmarExclusaoIntervencao(id) {
    const modal = new bootstrap.Modal(document.getElementById('confirmacaoModal'));
    const btn = document.getElementById('btn-confirmar-exclusao');

    const novoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(novoBtn, btn);

    novoBtn.addEventListener('click', () => excluirIntervencao(id));
    modal.show();
}

async function excluirIntervencao(id) {
    try {
        const response = await fetch(`../link/endp.php/deleteIntervention/${id}`, {
            method: 'DELETE'
        });

        const json = await response.json();
        if (json.ok) {
            bootstrap.Modal.getInstance(document.getElementById('confirmacaoModal')).hide();
            carregarIntervencoes();
            exibirAlerta('Intervenção excluída com sucesso!', 'success');
        } else {
            throw new Error(json.mensagem || json.error || 'Erro ao excluir');
        }
    } catch (error) {
        exibirAlerta('Erro ao excluir intervenção: ' + error.message, 'danger');
    }
}

function editarIntervencao(id) {
    abrirModalIntervencao(id);
}

// ============= USUÁRIOS FUNCTIONS =============

async function carregarUsuarios(pagina = 1, termoPesquisa = '') {
    console.log("carregarUsuarios called");
    try {
        let url = `../link/endp.php/getUsers?pagina=${pagina}`;
        if (termoPesquisa) {
            url += `&pesquisa=${encodeURIComponent(termoPesquisa)}`;
        }

        const response = await fetch(url);
        const json = await response.json();
        console.log("User data:", json);

        if (json.ok) {
            exibirUsuarios(json.usuarios || []);
            exibirPaginacaoUsuarios(json.pagina || 1, json.totalPaginas || 1, termoPesquisa);
            exibirInfoPaginacaoUsuarios(json.pagina || 1, json.total || 0, (json.usuarios || []).length);
        } else {
            exibirAlerta("Erro ao carregar usuários.", 'danger');
        }
    } catch (error) {
        console.error("Erro em carregarUsuarios:", error);
        exibirAlerta("Erro na ligação com o servidor.", 'danger');
    }
}

function exibirUsuarios(usuarios) {
    const tabela = document.getElementById('tabela-usuarios');
    if (!tabela) return;

    let html = '';
    if (usuarios.length === 0) {
        html = '<tr><td colspan="6" class="text-center">Nenhum usuário encontrado</td></tr>';
    } else {
        usuarios.forEach(u => {
            html += `<tr>
                <td>${u.id}</td>
                <td>${u.nome}</td>
                <td>${u.email}</td>
                <td>${u.permissao}</td>
                <td>-</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="editarUsuario(${u.id})">
                        <i class="bi bi-pencil"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmarExclusaoUsuario(${u.id})">
                        <i class="bi bi-trash"></i> Excluir
                    </button>
                </td>
            </tr>`;
        });
    }

    tabela.innerHTML = html;
}

function exibirPaginacaoUsuarios(paginaAtual, totalPaginas, termoPesquisa = '') {
    const paginacao = document.getElementById('paginacao-usuarios');
    if (!paginacao) return;

    let html = '';
    
    if (totalPaginas <= 1) {
        paginacao.innerHTML = '';
        return;
    }

    // Botão Anterior
    html += `<li class="page-item ${paginaAtual <= 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="event.preventDefault(); carregarUsuarios(${paginaAtual - 1}, '${termoPesquisa}')">Anterior</a>
    </li>`;

    // Páginas numeradas
    let startPage = Math.max(1, paginaAtual - 2);
    let endPage = Math.min(totalPaginas, paginaAtual + 2);

    // Primeira página
    if (startPage > 1) {
        html += `<li class="page-item">
            <a class="page-link" href="#" onclick="event.preventDefault(); carregarUsuarios(1, '${termoPesquisa}')">1</a>
        </li>`;
        if (startPage > 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    // Páginas do meio
    for (let i = startPage; i <= endPage; i++) {
        html += `<li class="page-item ${i === paginaAtual ? 'active' : ''}">
            <a class="page-link" href="#" onclick="event.preventDefault(); carregarUsuarios(${i}, '${termoPesquisa}')">${i}</a>
        </li>`;
    }

    // Última página
    if (endPage < totalPaginas) {
        if (endPage < totalPaginas - 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        html += `<li class="page-item">
            <a class="page-link" href="#" onclick="event.preventDefault(); carregarUsuarios(${totalPaginas}, '${termoPesquisa}')">${totalPaginas}</a>
        </li>`;
    }

    // Botão Próximo
    html += `<li class="page-item ${paginaAtual >= totalPaginas ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="event.preventDefault(); carregarUsuarios(${paginaAtual + 1}, '${termoPesquisa}')">Próximo</a>
    </li>`;

    paginacao.innerHTML = html;
}

function exibirInfoPaginacaoUsuarios(paginaAtual, totalItens, itensNaPagina) {
    const tabelaContainer = document.querySelector('#usuarios .table-responsive');
    if (!tabelaContainer) return;
    
    // Remove existing info if present
    const existingInfo = document.querySelector('#usuarios .pagination-info');
    if (existingInfo) {
        existingInfo.remove();
    }
    
    if (totalItens > 0) {
        const startItem = ((paginaAtual - 1) * 10) + 1;
        const endItem = startItem + itensNaPagina - 1;
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'pagination-info mb-2 text-muted small';
        infoDiv.innerHTML = `Mostrando ${startItem} a ${endItem} de ${totalItens} usuários`;
        
        tabelaContainer.parentNode.insertBefore(infoDiv, tabelaContainer);
    }
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

async function carregarDadosUsuario(id) {
    try {
        const response = await fetch(`../link/endp.php/getUser/${id}`);
        const usuario = await response.json();

        document.getElementById('usuario-id').value = usuario.id || '';
        document.getElementById('usuario-nome').value = usuario.nome || '';
        document.getElementById('usuario-email').value = usuario.email || '';
        document.getElementById('usuario-funcao').value = usuario.permissao || '';
        document.getElementById('usuario-imagem').value = usuario.imagem || '';
        // Don't populate password field for security
        document.getElementById('usuario-senha').value = '';
    } catch (error) {
        console.error("Error loading user data:", error);
        exibirAlerta("Erro ao carregar usuário para edição", 'danger');
    }
}

async function salvarUsuario() {
    try {
        const id = document.getElementById('usuario-id').value;
        const usuario = {
            nome: document.getElementById('usuario-nome').value,
            email: document.getElementById('usuario-email').value,
            permissao: document.getElementById('usuario-funcao').value,
            imagem: document.getElementById('usuario-imagem').value || null
        };

        // Only include password if it's provided - using 'palavra' field name
        const senha = document.getElementById('usuario-senha').value;
        if (senha) {
            usuario.palavra = senha;
        }

        console.log('Sending user data:', usuario);

        const response = await fetch(`../link/endp.php/${id ? 'updateUser/' + id : 'createUser'}`, {
            method: id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        });

        console.log('Response status:', response.status);
        
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        let json;
        try {
            json = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Response was:', responseText);
            throw new Error('Servidor retornou resposta inválida. Verifique os logs do servidor.');
        }

        if (json.ok) {
            bootstrap.Modal.getInstance(document.getElementById('usuarioModal')).hide();
            carregarUsuarios();
            exibirAlerta(`Usuário ${id ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
        } else {
            throw new Error(json.mensagem || json.error || 'Erro ao salvar');
        }

    } catch (error) {
        console.error('Save user error:', error);
        exibirAlerta('Erro ao salvar usuário: ' + error.message, 'danger');
    }
}

function confirmarExclusaoUsuario(id) {
    const modal = new bootstrap.Modal(document.getElementById('confirmacaoModal'));
    const btn = document.getElementById('btn-confirmar-exclusao');

    const novoBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(novoBtn, btn);

    novoBtn.addEventListener('click', () => excluirUsuario(id));
    modal.show();
}

async function excluirUsuario(id) {
    try {
        const response = await fetch(`../link/endp.php/deleteUser/${id}`, {
            method: 'DELETE'
        });

        const json = await response.json();
        if (json.ok) {
            bootstrap.Modal.getInstance(document.getElementById('confirmacaoModal')).hide();
            carregarUsuarios();
            exibirAlerta('Usuário excluído com sucesso!', 'success');
        } else {
            throw new Error(json.mensagem || json.error || 'Erro ao excluir');
        }
    } catch (error) {
        exibirAlerta('Erro ao excluir usuário: ' + error.message, 'danger');
    }
}

function editarUsuario(id) {
    abrirModalUsuario(id);
}
