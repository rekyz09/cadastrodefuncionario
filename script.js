// CHAVES DE LOCALSTORAGE
const STORAGE_KEY_FUNC = 'SISTEMA_FUNCIONARIOS_VALIDADO_DB_V9';
const STORAGE_KEY_PAC = 'SISTEMA_PACIENTES_VALIDADO_DB_V9';

// DETECÇÃO AUTOMÁTICA DA PÁGINA
const formFuncionario = document.getElementById('formFuncionario');
const formPaciente = document.getElementById('formPaciente');
const corpoTabela = document.getElementById('corpoTabela');
const filtroBusca = document.getElementById('filtroBusca');

// INICIALIZAÇÃO DA APLICAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    iniciarRelogio();
    aplicarMascaraEValidacoes();
    carregarDadosIniciaisSeVazio();
    renderizarTabela();
    atualizarEstatisticas();
});

// RELÓGIO DO CABEÇALHO
function iniciarRelogio() {
    const elRelogio = document.getElementById('relogio');
    if (elRelogio) {
        setInterval(() => {
            const agora = new Date();
            elRelogio.textContent = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`;
        }, 1000);
    }
}

// VALIDAÇÃO EM TEMPO REAL E MÁSCARAS AUTOMÁTICAS
function aplicarMascaraEValidacoes() {
    const campoNome = document.getElementById('nomeCompleto');
    const campoRg = document.getElementById('rg');
    const campoDataNascimento = document.getElementById('dataNascimento');
    const campoDataAdmissao = document.getElementById('dataAdmissao');
    const camposApenasNumeros = ['cpf', 'telefone', 'cep', 'matricula', 'carteirinha'];

    // 1. SOMENTE LETRAS E ESPAÇOS NO NOME
    if (campoNome) {
        campoNome.addEventListener('keypress', (e) => {
            const char = String.fromCharCode(e.which || e.keyCode);
            if (!/[a-zA-ZÀ-ÿ\s]/.test(char)) {
                e.preventDefault();
            }
        });

        campoNome.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
            e.target.value = e.target.value.replace(/\s+/g, ' ');
        });

        campoNome.addEventListener('paste', (e) => {
            e.preventDefault();
            const textoColado = (e.clipboardData || window.clipboardData).getData('text');
            const textoFiltrado = textoColado.replace(/[^a-zA-ZÀ-ÿ\s]/g, '').replace(/\s+/g, ' ');
            document.execCommand('insertText', false, textoFiltrado);
        });
    }

    // 2. RG: PERMITE NÚMEROS E A LETRA 'X' / 'x'
    if (campoRg) {
        campoRg.addEventListener('keypress', (e) => {
            const char = String.fromCharCode(e.which || e.keyCode);
            if (!/[0-9Xx]/.test(char)) {
                e.preventDefault();
            }
        });

        campoRg.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9Xx]/g, '').toUpperCase();
        });

        campoRg.addEventListener('paste', (e) => {
            e.preventDefault();
            const textoColado = (e.clipboardData || window.clipboardData).getData('text');
            const textoFiltrado = textoColado.replace(/[^0-9Xx]/g, '').toUpperCase();
            document.execCommand('insertText', false, textoFiltrado);
        });
    }

    // 3. SOMENTE NÚMEROS NOS CAMPOS NUMÉRICOS
    camposApenasNumeros.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('keypress', (e) => {
                const char = String.fromCharCode(e.which || e.keyCode);
                if (!/[0-9]/.test(char)) {
                    e.preventDefault();
                }
            });

            el.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
            });

            el.addEventListener('paste', (e) => {
                e.preventDefault();
                const textoColado = (e.clipboardData || window.clipboardData).getData('text');
                const textoFiltrado = textoColado.replace(/\D/g, '');
                document.execCommand('insertText', false, textoFiltrado);
            });
        }
    });

    // 4. MÁSCARA EXCLUSIVA DE DATA DE NASCIMENTO (COM RESTRIÇÃO DE MÊS <= 12 E DIA <= 31)
    if (campoDataNascimento) {
        campoDataNascimento.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');

            if (v.length > 8) v = v.slice(0, 8);

            // Valida o Dia (máximo 31, mínimo 01)
            if (v.length >= 2) {
                let dia = parseInt(v.slice(0, 2), 10);
                if (dia > 31) dia = 31;
                if (dia === 0) dia = 1;
                v = String(dia).padStart(2, '0') + v.slice(2);
            }

            // Valida o Mês (máximo 12, mínimo 01)
            if (v.length >= 4) {
                let mes = parseInt(v.slice(2, 4), 10);
                if (mes > 12) mes = 12;
                if (mes === 0) mes = 1;
                v = v.slice(0, 2) + String(mes).padStart(2, '0') + v.slice(4);
            }

            // Formatação com barras /
            if (v.length >= 5) {
                v = v.replace(/^(\d{2})(\d{2})(\d{1,4})$/, '$1/$2/$3');
            } else if (v.length >= 3) {
                v = v.replace(/^(\d{2})(\d{1,2})$/, '$1/$2');
            }

            e.target.value = v;
        });
    }

    // 5. MÁSCARA PADRÃO DE DATA PARA OUTROS CAMPOS (EX: ADMISSÃO)
    if (campoDataAdmissao) {
        campoDataAdmissao.addEventListener('input', (e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 8) v = v.slice(0, 8);
            if (v.length >= 5) {
                v = v.replace(/^(\d{2})(\d{2})(\d{1,4})$/, '$1/$2/$3');
            } else if (v.length >= 3) {
                v = v.replace(/^(\d{2})(\d{1,2})$/, '$1/$2');
            }
            e.target.value = v;
        });
    }
}

// DETERMINAR CHAVE DO LOCALSTORAGE
function getStorageKey() {
    return formPaciente ? STORAGE_KEY_PAC : STORAGE_KEY_FUNC;
}

// BUSCAR DADOS DO LOCALSTORAGE
function getDados() {
    const json = localStorage.getItem(getStorageKey());
    return json ? JSON.parse(json) : [];
}

// SALVAR NO LOCALSTORAGE
function saveDados(lista) {
    localStorage.setItem(getStorageKey(), JSON.stringify(lista));
    renderizarTabela();
    atualizarEstatisticas();
}

// DADOS INICIAIS DE EXEMPLO
function carregarDadosIniciaisSeVazio() {
    const atuais = getDados();
    if (atuais.length === 0) {
        if (formPaciente) {
            saveDados([{
                id: '1',
                nomeCompleto: 'Maria Aparecida da Silva',
                cpf: '98765432100',
                rg: '12345678X',
                dataNascimento: '20/10/1990',
                genero: 'Feminino',
                telefone: '11977778888',
                email: 'maria.silva@email.com',
                cep: '01001000',
                logradouro: 'Rua das Flores, 50',
                bairro: 'Centro',
                cidadeUf: 'São Paulo / SP',
                tipoAtendimento: 'Convênio / Plano de Saúde',
                nomeConvenio: 'Unimed',
                carteirinha: '123456789',
                especialidadeInteresse: 'Cardiologia',
                observacoes: 'Alergia a Penicilina'
            }]);
        } else {
            saveDados([{
                id: '1678900000001',
                nomeCompleto: 'Carlos Eduardo Santos',
                cpf: '12345678900',
                rg: '44555666X',
                dataNascimento: '14/05/1988',
                genero: 'Masculino',
                estadoCivil: 'Solteiro(a)',
                escolaridade: 'Superior Completo',
                telefone: '11987654321',
                email: 'carlos.santos@empresa.com.br',
                cep: '01001000',
                logradouro: 'Praça da Sé, 100',
                bairro: 'Sé',
                cidadeUf: 'São Paulo / SP',
                matricula: '2025014',
                departamento: 'Tecnologia da Informação',
                cargo: 'Desenvolvedor Senior',
                dataAdmissao: '01/02/2025',
                tipoContrato: 'CLT - Tempo Indeterminado',
                salario: 8500.00,
                turno: 'Integral / Comercial',
                escala: '5x2 (Segunda a Sexta)',
                modalidade: 'Híbrido',
                observacoes: 'Preferência por horários flexíveis.',
                beneficios: ['Vale-Transporte', 'Vale-Refeição / Alimentação', 'Plano de Saúde']
            }]);
        }
    }
}

// EVENTO DE SUBMIT
const formAtivo = formPaciente || formFuncionario;
if (formAtivo) {
    formAtivo.addEventListener('submit', (e) => {
        e.preventDefault();

        const idInput = document.getElementById(formPaciente ? 'pacienteId' : 'funcionarioId')?.value;
        const lista = getDados();

        let objeto = {
            id: idInput ? idInput : Date.now().toString(),
            nomeCompleto: document.getElementById('nomeCompleto').value.trim(),
            cpf: document.getElementById('cpf').value,
            rg: document.getElementById('rg').value,
            dataNascimento: document.getElementById('dataNascimento').value,
            genero: document.getElementById('genero').value,
            telefone: document.getElementById('telefone').value,
            email: document.getElementById('email').value,
            cep: document.getElementById('cep').value,
            logradouro: document.getElementById('logradouro').value,
            bairro: document.getElementById('bairro').value,
            cidadeUf: document.getElementById('cidadeUf').value,
            observacoes: document.getElementById('observacoes')?.value || ''
        };

        if (formPaciente) {
            objeto.tipoAtendimento = document.getElementById('tipoAtendimento').value;
            objeto.nomeConvenio = document.getElementById('nomeConvenio').value;
            objeto.carteirinha = document.getElementById('carteirinha').value;
            objeto.especialidadeInteresse = document.getElementById('especialidadeInteresse').value;
        } else {
            objeto.estadoCivil = document.getElementById('estadoCivil').value;
            objeto.escolaridade = document.getElementById('escolaridade').value;
            objeto.matricula = document.getElementById('matricula').value;
            objeto.departamento = document.getElementById('departamento').value;
            objeto.cargo = document.getElementById('cargo').value;
            objeto.dataAdmissao = document.getElementById('dataAdmissao').value;
            objeto.tipoContrato = document.getElementById('tipoContrato').value;
            objeto.salario = parseFloat(document.getElementById('salario').value) || 0;
            objeto.turno = document.getElementById('turno').value;
            objeto.escala = document.getElementById('escala').value;
            objeto.modalidade = document.getElementById('modalidade').value;
        }

        if (idInput) {
            const index = lista.findIndex(item => item.id === idInput);
            if (index !== -1) {
                lista[index] = objeto;
                alert('Registro atualizado com sucesso!');
            }
        } else {
            lista.push(objeto);
            alert('Cadastro realizado com sucesso!');
        }

        saveDados(lista);
        limparFormulario();
    });
}

// LIMPAR FORMULÁRIO
function limparFormulario() {
    if (formAtivo) formAtivo.reset();
    const inputId = document.getElementById(formPaciente ? 'pacienteId' : 'funcionarioId');
    if (inputId) inputId.value = '';
    const btnSalvar = document.getElementById('btnSalvar');
    if (btnSalvar) btnSalvar.textContent = '✓ Salvar Registro';
}

// RENDERIZAR TABELA DE REGISTROS
function renderizarTabela() {
    if (!corpoTabela) return;
    const lista = getDados();
    const termo = filtroBusca ? filtroBusca.value.toLowerCase() : '';

    corpoTabela.innerHTML = '';

    const filtrados = lista.filter(item => 
        item.nomeCompleto.toLowerCase().includes(termo) ||
        item.cpf.includes(termo) ||
        (item.matricula && item.matricula.toLowerCase().includes(termo)) ||
        (item.nomeConvenio && item.nomeConvenio.toLowerCase().includes(termo)) ||
        (item.especialidadeInteresse && item.especialidadeInteresse.toLowerCase().includes(termo))
    );

    if (filtrados.length === 0) {
        corpoTabela.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: #777;">Nenhum registro encontrado.</td></tr>`;
        return;
    }

    filtrados.forEach(item => {
        const tr = document.createElement('tr');

        if (formPaciente) {
            tr.innerHTML = `
                <td>
                    <strong>${item.nomeCompleto}</strong><br>
                    <small style="color: #666;">CPF: ${item.cpf}</small>
                </td>
                <td>${item.dataNascimento || '-'}</td>
                <td>
                    ${item.telefone}<br>
                    <small style="color: #555;">${item.email}</small>
                </td>
                <td>
                    ${item.tipoAtendimento}<br>
                    <small style="color: #555;">${item.nomeConvenio || '-'}</small>
                </td>
                <td><strong>${item.especialidadeInteresse}</strong></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editarRegistro('${item.id}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="excluirRegistro('${item.id}')">Excluir</button>
                </td>
            `;
        } else {
            const salarioFmt = (item.salario || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            tr.innerHTML = `
                <td><strong>${item.matricula}</strong></td>
                <td>
                    <strong>${item.nomeCompleto}</strong><br>
                    <small style="color: #666;">${item.cargo} | Nasc: ${item.dataNascimento || '-'}</small>
                </td>
                <td>${item.cpf}</td>
                <td>${item.departamento}</td>
                <td>
                    ${item.turno || 'Não informado'}<br>
                    <small style="color: #555;">${item.modalidade || '-'}</small>
                </td>
                <td><strong>${salarioFmt}</strong></td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editarRegistro('${item.id}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="excluirRegistro('${item.id}')">Excluir</button>
                </td>
            `;
        }
        corpoTabela.appendChild(tr);
    });
}

// EDITAR REGISTRO
function editarRegistro(id) {
    const lista = getDados();
    const item = lista.find(i => i.id === id);
    if (!item) return;

    const inputId = document.getElementById(formPaciente ? 'pacienteId' : 'funcionarioId');
    if (inputId) inputId.value = item.id;

    document.getElementById('nomeCompleto').value = item.nomeCompleto;
    document.getElementById('cpf').value = item.cpf;
    document.getElementById('rg').value = item.rg;
    document.getElementById('dataNascimento').value = item.dataNascimento || '';
    document.getElementById('genero').value = item.genero;
    document.getElementById('telefone').value = item.telefone;
    document.getElementById('email').value = item.email;
    document.getElementById('cep').value = item.cep;
    document.getElementById('logradouro').value = item.logradouro;
    document.getElementById('bairro').value = item.bairro;
    document.getElementById('cidadeUf').value = item.cidadeUf;
    if (document.getElementById('observacoes')) document.getElementById('observacoes').value = item.observacoes || '';

    if (formPaciente) {
        document.getElementById('tipoAtendimento').value = item.tipoAtendimento || '';
        document.getElementById('nomeConvenio').value = item.nomeConvenio || '';
        document.getElementById('carteirinha').value = item.carteirinha || '';
        document.getElementById('especialidadeInteresse').value = item.especialidadeInteresse || '';
    } else {
        document.getElementById('estadoCivil').value = item.estadoCivil || '';
        document.getElementById('escolaridade').value = item.escolaridade || '';
        document.getElementById('matricula').value = item.matricula || '';
        document.getElementById('departamento').value = item.departamento || '';
        document.getElementById('cargo').value = item.cargo || '';
        document.getElementById('dataAdmissao').value = item.dataAdmissao || '';
        document.getElementById('tipoContrato').value = item.tipoContrato || '';
        document.getElementById('salario').value = item.salario || '';
        document.getElementById('turno').value = item.turno || '';
        document.getElementById('escala').value = item.escala || '';
        document.getElementById('modalidade').value = item.modalidade || '';
    }

    const btnSalvar = document.getElementById('btnSalvar');
    if (btnSalvar) btnSalvar.textContent = '✓ Atualizar Registro';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// EXCLUIR REGISTRO
function excluirRegistro(id) {
    if (confirm('Tem certeza que deseja remover este registro?')) {
        let lista = getDados();
        lista = lista.filter(item => item.id !== id);
        saveDados(lista);
    }
}

// LIMPAR TODA A BASE
function limparTudo() {
    if (confirm('ATENÇÃO: Esta ação irá apagar TODOS os registros do LocalStorage. Deseja continuar?')) {
        localStorage.removeItem(getStorageKey());
        renderizarTabela();
        atualizarEstatisticas();
    }
}

// ATUALIZAR ESTATÍSTICAS E CÁLCULO DE FOLHA SALARIAL
function atualizarEstatisticas() {
    const lista = getDados();
    
    // 1. Atualiza Total de Cadastros
    const elTotal = document.getElementById('statTotalFuncionarios');
    if (elTotal) elTotal.textContent = lista.length;

    // 2. Calcula Folha Total e Média (para os quadros de métricas)
    const elFolhaTotal = document.getElementById('statFolhaTotal');
    const elMediaSalarial = document.getElementById('statMediaSalarial');

    if (elFolhaTotal || elMediaSalarial) {
        const totalSalarios = lista.reduce((acumulador, item) => {
            return acumulador + (parseFloat(item.salario) || 0);
        }, 0);

        const mediaSalarial = lista.length > 0 ? (totalSalarios / lista.length) : 0;

        if (elFolhaTotal) {
            elFolhaTotal.textContent = totalSalarios.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
        if (elMediaSalarial) {
            elMediaSalarial.textContent = mediaSalarial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
    }
}

// EXPORTAR DADOS EM FORMATO JSON (SUPORTE CT-23)
function exportarJSON() {
    const dados = getDados();
    const jsonStr = JSON.stringify(dados, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_base_dados_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// IMPORTAR DADOS DE UM ARQUIVO JSON (SUPORTE CT-24)
function importarJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            if (Array.isArray(dados)) {
                saveDados(dados);
                alert('Base de dados importada com sucesso!');
            } else {
                alert('Formato de JSON inválido! Esperado uma lista de registros.');
            }
        } catch (err) {
            alert('Erro ao ler o arquivo JSON: ' + err.message);
        }
    };
    reader.readAsText(file);
}
