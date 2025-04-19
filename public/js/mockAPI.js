// Mock API para testar sem backend real
console.log('Iniciando Mock API');

// Dados simulados
const mockData = {
    veiculos: [
        { id: 1, marca: 'Toyota', modelo: 'Corolla', ano: 2020, cor: 'Branco', matricula: 'AB-12-CD', vin: '1HGCM82633A123456', pneus: '205/55R16', jante: '16' },
        { id: 2, marca: 'BMW', modelo: 'X5', ano: 2019, cor: 'Preto', matricula: 'EF-34-GH', vin: '5UXKR0C51J0123456', pneus: '255/50R19', jante: '19' },
        { id: 3, marca: 'Audi', modelo: 'A4', ano: 2021, cor: 'Cinza', matricula: 'IJ-56-KL', vin: 'WAUZZZ8K0GA123456', pneus: '225/45R17', jante: '17' }
    ],
    intervencoes: [
        { id: 1, veiculo_id: 1, data: '2023-04-15', tipo: 'Manutenção Preventiva', tecnico: 'João Silva', descricao: 'Troca de óleo e filtros', veiculo_marca: 'Toyota', veiculo_modelo: 'Corolla', veiculo_matricula: 'AB-12-CD' },
        { id: 2, veiculo_id: 2, data: '2023-03-20', tipo: 'Manutenção Corretiva', tecnico: 'Manuel Oliveira', descricao: 'Substituição da bomba de água', veiculo_marca: 'BMW', veiculo_modelo: 'X5', veiculo_matricula: 'EF-34-GH' },
        { id: 3, veiculo_id: 3, data: '2023-04-02', tipo: 'Serviços Elétricos', tecnico: 'António Santos', descricao: 'Diagnóstico do sistema elétrico', veiculo_marca: 'Audi', veiculo_modelo: 'A4', veiculo_matricula: 'IJ-56-KL' }
    ],
    usuarios: [
        { id: 1, nome: 'Administrador', email: 'admin@autosys.com', funcao: 'admin', data_cadastro: '2023-01-01', imagem: null },
        { id: 2, nome: 'Técnico', email: 'tecnico@autosys.com', funcao: 'tecnico', data_cadastro: '2023-01-15', imagem: null },
        { id: 3, nome: 'Recepcionista', email: 'user@autosys.com', funcao: 'recepcao', data_cadastro: '2023-02-01', imagem: null }
    ]
};

// Inicializar autenticação simulada
if (!localStorage.getItem('token')) {
    console.log('Simulando login de administrador');
    localStorage.setItem('token', 'mock-token-123456');
    localStorage.setItem('usuario', JSON.stringify({
        id: 1,
        nome: 'Administrador',
        email: 'admin@autosys.com',
        funcao: 'admin'
    }));
}

// Interceptar chamadas fetch
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    // Para facilitar o debug
    console.log(`Fetch interceptado: ${url}`);
    
    if (typeof url === 'string' && url.includes('/api/')) {
        console.log('Processando como chamada de API mock');
        return mockFetch(url, options);
    }
    
    return originalFetch(url, options);
};

// Processar chamadas mock
function mockFetch(url, options = {}) {
    const urlObj = new URL(url, window.location.origin);
    const path = urlObj.pathname;
    const params = urlObj.searchParams;
    const method = options.method || 'GET';
    
    console.log(`Mock API: ${method} ${path}`);
    
    // Simular delay de rede
    return new Promise(resolve => {
        setTimeout(() => {
            const response = processApiCall(path, method, params, options);
            resolve(response);
        }, 300);
    });
}

// Processar as chamadas específicas
function processApiCall(path, method, params, options) {
    // VEÍCULOS
    // GET /api/veiculos
    if (path === '/api/veiculos' && method === 'GET') {
        console.log('Processando GET /api/veiculos');
        const pagina = parseInt(params.get('pagina')) || 1;
        const pesquisa = params.get('pesquisa') || '';
        
        let veiculos = [...mockData.veiculos];
        
        if (pesquisa) {
            veiculos = veiculos.filter(v => 
                v.marca.toLowerCase().includes(pesquisa.toLowerCase()) || 
                v.modelo.toLowerCase().includes(pesquisa.toLowerCase()) || 
                v.matricula.toLowerCase().includes(pesquisa.toLowerCase())
            );
        }
        
        return createResponse({
            veiculos,
            paginaAtual: pagina,
            totalPaginas: 1
        }, 200);
    }
    
    // POST /api/veiculos (criar)
    if (path === '/api/veiculos' && method === 'POST') {
        try {
            const veiculo = JSON.parse(options.body);
            veiculo.id = mockData.veiculos.length + 1;
            mockData.veiculos.push(veiculo);
            
            return createResponse({
                id: veiculo.id,
                mensagem: 'Veículo cadastrado com sucesso!'
            }, 201);
        } catch (error) {
            return createResponse({
                mensagem: 'Erro ao processar dados do veículo'
            }, 400);
        }
    }
    
    // GET /api/veiculos/:id (detalhe)
    if (path.match(/^\/api\/veiculos\/\d+$/) && method === 'GET') {
        const id = parseInt(path.split('/').pop());
        const veiculo = mockData.veiculos.find(v => v.id === id);
        
        if (!veiculo) {
            return createResponse({
                mensagem: 'Veículo não encontrado'
            }, 404);
        }
        
        return createResponse(veiculo, 200);
    }
    
    // PUT /api/veiculos/:id (atualizar)
    if (path.match(/^\/api\/veiculos\/\d+$/) && method === 'PUT') {
        const id = parseInt(path.split('/').pop());
        const index = mockData.veiculos.findIndex(v => v.id === id);
        
        if (index === -1) {
            return createResponse({
                mensagem: 'Veículo não encontrado'
            }, 404);
        }
        
        try {
            const veiculo = JSON.parse(options.body);
            mockData.veiculos[index] = { ...mockData.veiculos[index], ...veiculo, id };
            
            return createResponse({
                mensagem: 'Veículo atualizado com sucesso!'
            }, 200);
        } catch (error) {
            return createResponse({
                mensagem: 'Erro ao processar dados do veículo'
            }, 400);
        }
    }
    
    // DELETE /api/veiculos/:id (excluir)
    if (path.match(/^\/api\/veiculos\/\d+$/) && method === 'DELETE') {
        const id = parseInt(path.split('/').pop());
        const index = mockData.veiculos.findIndex(v => v.id === id);
        
        if (index === -1) {
            return createResponse({
                mensagem: 'Veículo não encontrado'
            }, 404);
        }
        
        mockData.veiculos.splice(index, 1);
        
        return createResponse({
            mensagem: 'Veículo excluído com sucesso!'
        }, 200);
    }
    
    // INTERVENÇÕES
    // GET /api/intervencoes
    if (path === '/api/intervencoes' && method === 'GET') {
        const pagina = parseInt(params.get('pagina')) || 1;
        const pesquisa = params.get('pesquisa') || '';
        
        let intervencoes = [...mockData.intervencoes];
        
        if (pesquisa) {
            intervencoes = intervencoes.filter(i => 
                i.veiculo_marca.toLowerCase().includes(pesquisa.toLowerCase()) || 
                i.veiculo_modelo.toLowerCase().includes(pesquisa.toLowerCase()) || 
                i.tipo.toLowerCase().includes(pesquisa.toLowerCase()) ||
                i.tecnico.toLowerCase().includes(pesquisa.toLowerCase())
            );
        }
        
        return createResponse({
            intervencoes,
            paginaAtual: pagina,
            totalPaginas: 1
        }, 200);
    }
    
    // POST /api/intervencoes (criar)
    if (path === '/api/intervencoes' && method === 'POST') {
        try {
            const intervencao = JSON.parse(options.body);
            intervencao.id = mockData.intervencoes.length + 1;
            
            // Adicionar informações do veículo
            const veiculo = mockData.veiculos.find(v => v.id === parseInt(intervencao.veiculo_id));
            if (veiculo) {
                intervencao.veiculo_marca = veiculo.marca;
                intervencao.veiculo_modelo = veiculo.modelo;
                intervencao.veiculo_matricula = veiculo.matricula;
            }
            
            mockData.intervencoes.push(intervencao);
            
            return createResponse({
                id: intervencao.id,
                mensagem: 'Intervenção cadastrada com sucesso!'
            }, 201);
        } catch (error) {
            return createResponse({
                mensagem: 'Erro ao processar dados da intervenção'
            }, 400);
        }
    }
    
    // GET /api/intervencoes/:id (detalhe)
    if (path.match(/^\/api\/intervencoes\/\d+$/) && method === 'GET') {
        const id = parseInt(path.split('/').pop());
        const intervencao = mockData.intervencoes.find(i => i.id === id);
        
        if (!intervencao) {
            return createResponse({
                mensagem: 'Intervenção não encontrada'
            }, 404);
        }
        
        return createResponse(intervencao, 200);
    }
    
    // PUT /api/intervencoes/:id (atualizar)
    if (path.match(/^\/api\/intervencoes\/\d+$/) && method === 'PUT') {
        const id = parseInt(path.split('/').pop());
        const index = mockData.intervencoes.findIndex(i => i.id === id);
        
        if (index === -1) {
            return createResponse({
                mensagem: 'Intervenção não encontrada'
            }, 404);
        }
        
        try {
            const intervencao = JSON.parse(options.body);
            
            // Atualizar informações do veículo se necessário
            if (intervencao.veiculo_id !== mockData.intervencoes[index].veiculo_id) {
                const veiculo = mockData.veiculos.find(v => v.id === parseInt(intervencao.veiculo_id));
                if (veiculo) {
                    intervencao.veiculo_marca = veiculo.marca;
                    intervencao.veiculo_modelo = veiculo.modelo;
                    intervencao.veiculo_matricula = veiculo.matricula;
                }
            }
            
            mockData.intervencoes[index] = { ...mockData.intervencoes[index], ...intervencao, id };
            
            return createResponse({
                mensagem: 'Intervenção atualizada com sucesso!'
            }, 200);
        } catch (error) {
            return createResponse({
                mensagem: 'Erro ao processar dados da intervenção'
            }, 400);
        }
    }
    
    // DELETE /api/intervencoes/:id (excluir)
    if (path.match(/^\/api\/intervencoes\/\d+$/) && method === 'DELETE') {
        const id = parseInt(path.split('/').pop());
        const index = mockData.intervencoes.findIndex(i => i.id === id);
        
        if (index === -1) {
            return createResponse({
                mensagem: 'Intervenção não encontrada'
            }, 404);
        }
        
        mockData.intervencoes.splice(index, 1);
        
        return createResponse({
            mensagem: 'Intervenção excluída com sucesso!'
        }, 200);
    }
    
    // USUÁRIOS
    // GET /api/usuarios
    if (path === '/api/usuarios' && method === 'GET') {
        const pagina = parseInt(params.get('pagina')) || 1;
        const pesquisa = params.get('pesquisa') || '';
        
        let usuarios = [...mockData.usuarios];
        
        if (pesquisa) {
            usuarios = usuarios.filter(u => 
                u.nome.toLowerCase().includes(pesquisa.toLowerCase()) || 
                u.email.toLowerCase().includes(pesquisa.toLowerCase())
            );
        }
        
        return createResponse({
            usuarios,
            paginaAtual: pagina,
            totalPaginas: 1
        }, 200);
    }
    
    // POST /api/usuarios (criar)
    if (path === '/api/usuarios' && method === 'POST') {
        try {
            const usuario = JSON.parse(options.body);
            usuario.id = mockData.usuarios.length + 1;
            usuario.data_cadastro = new Date().toISOString().split('T')[0];
            
            mockData.usuarios.push(usuario);
            
            return createResponse({
                id: usuario.id,
                mensagem: 'Usuário cadastrado com sucesso!'
            }, 201);
        } catch (error) {
            return createResponse({
                mensagem: 'Erro ao processar dados do usuário'
            }, 400);
        }
    }
    
    // GET /api/usuarios/:id (detalhe)
    if (path.match(/^\/api\/usuarios\/\d+$/) && method === 'GET') {
        const id = parseInt(path.split('/').pop());
        const usuario = mockData.usuarios.find(u => u.id === id);
        
        if (!usuario) {
            return createResponse({
                mensagem: 'Usuário não encontrado'
            }, 404);
        }
        
        return createResponse(usuario, 200);
    }
    
    // PUT /api/usuarios/:id (atualizar)
    if (path.match(/^\/api\/usuarios\/\d+$/) && method === 'PUT') {
        const id = parseInt(path.split('/').pop());
        const index = mockData.usuarios.findIndex(u => u.id === id);
        
        if (index === -1) {
            return createResponse({
                mensagem: 'Usuário não encontrado'
            }, 404);
        }
        
        try {
            const usuario = JSON.parse(options.body);
            mockData.usuarios[index] = { ...mockData.usuarios[index], ...usuario, id };
            
            return createResponse({
                mensagem: 'Usuário atualizado com sucesso!'
            }, 200);
        } catch (error) {
            return createResponse({
                mensagem: 'Erro ao processar dados do usuário'
            }, 400);
        }
    }
    
    // DELETE /api/usuarios/:id (excluir)
    if (path.match(/^\/api\/usuarios\/\d+$/) && method === 'DELETE') {
        const id = parseInt(path.split('/').pop());
        
        // Não permitir excluir o administrador principal
        if (id === 1) {
            return createResponse({
                mensagem: 'Não é permitido excluir o usuário administrador principal'
            }, 400);
        }
        
        const index = mockData.usuarios.findIndex(u => u.id === id);
        
        if (index === -1) {
            return createResponse({
                mensagem: 'Usuário não encontrado'
            }, 404);
        }
        
        mockData.usuarios.splice(index, 1);
        
        return createResponse({
            mensagem: 'Usuário excluído com sucesso!'
        }, 200);
    }
    
    // AUTH
    // GET /api/auth/me
    if (path === '/api/auth/me' && method === 'GET') {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        
        if (!usuario || !usuario.id) {
            return createResponse({
                mensagem: 'Usuário não autenticado'
            }, 401);
        }
        
        return createResponse(usuario, 200);
    }
    
    // Rota não encontrada
    return createResponse({
        mensagem: 'Endpoint não encontrado'
    }, 404);
}

// Criar objeto de resposta simulada
function createResponse(data, status = 200) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => Promise.resolve(data),
        text: async () => Promise.resolve(JSON.stringify(data))
    };
}

console.log('Mock API inicializada com sucesso');