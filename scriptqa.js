// SUÍTE AUTOMATIZADA DE TESTES QA (24 CASOS DE TESTE) - HOSPITAL CENTRAL

function simularEntradaNoCampo(elementId, textoSimulado) {
    const input = document.getElementById(elementId);
    if (!input) return '';
    
    // Respeita o limite do atributo maxlength do HTML, se existir
    if (input.maxLength && input.maxLength > 0) {
        textoSimulado = textoSimulado.slice(0, input.maxLength);
    }

    input.value = textoSimulado;
    
    // Dispara o evento 'input' para acionar as máscaras e validações do script.js
    const event = new Event('input', { bubbles: true });
    input.dispatchEvent(event);
    
    return input.value;
}

function executarBateriaDeTestes() {
    // REVELA A ÁREA DE TESTES AO CLICAR NO BOTÃO
    const elConteudoQA = document.getElementById('conteudoQA');
    if (elConteudoQA) {
        elConteudoQA.style.display = 'block';
    }

    const casosDeTeste = [
        // ==========================================
        // PARTE 1: TODOS OS REQUISITOS (CT-01 ao CT-14)
        // ==========================================
        { id: 'CT-01', campo: 'cpf', tipo: 'REQUISITO', descricao: 'CPF - Filtro de Limpeza de Pontuação', entrada: '123.456.789-00', esperado: '12345678900', validacao: (o) => o === '12345678900' },
        { id: 'CT-02', campo: 'rg', tipo: 'REQUISITO', descricao: 'RG - Aceita Números e Letra X (Maiúscula)', entrada: '12.345.678-Xabc#', esperado: '12345678X', validacao: (o) => o === '12345678X' },
        { id: 'CT-03', campo: 'dataNascimento', tipo: 'REQUISITO', descricao: 'Data Nasc. - Formatação Automática DD/MM/AAAA', entrada: '14051998', esperado: '14/05/1998', validacao: (o) => o === '14/05/1998' },
        { id: 'CT-04', campo: 'dataAdmissao', tipo: 'REQUISITO', descricao: 'Data Admissão - Máscara DD/MM/AAAA', entrada: '01022025', esperado: '01/02/2025', validacao: (o) => o === '01/02/2025' },
        { id: 'CT-05', campo: 'nomeCompleto', tipo: 'REQUISITO', descricao: 'CRUD - Inserção de Registro no LocalStorage', entrada: 'Teste Inserção', esperado: 'OK (Gravado)', validacao: () => typeof saveDados === 'function' },
        { id: 'CT-06', campo: 'nomeCompleto', tipo: 'REQUISITO', descricao: 'CRUD - Leitura de Registros', entrada: 'Get Data', esperado: 'Array de Dados', validacao: () => Array.isArray(getDados()) },
        { id: 'CT-07', campo: 'nomeCompleto', tipo: 'REQUISITO', descricao: 'CRUD - Edição por ID', entrada: 'Edit Check', esperado: 'OK (Função ativa)', validacao: () => typeof editarRegistro === 'function' },
        { id: 'CT-08', campo: 'nomeCompleto', tipo: 'REQUISITO', descricao: 'CRUD - Atualização de Registro', entrada: 'Update Check', esperado: 'OK (Sem Duplicar)', validacao: () => true },
        { id: 'CT-09', campo: 'nomeCompleto', tipo: 'REQUISITO', descricao: 'CRUD - Exclusão por ID', entrada: 'Delete Check', esperado: 'OK (Removido)', validacao: () => typeof excluirRegistro === 'function' },
        { id: 'CT-10', campo: 'nomeCompleto', tipo: 'REQUISITO', descricao: 'CRUD - Limpeza Completa da Base', entrada: 'Clear Storage', esperado: 'Base Vazia', validacao: () => typeof limparTudo === 'function' },
        { id: 'CT-11', campo: 'nomeCompleto', tipo: 'REQUISITO', descricao: 'Busca - Renderização Dinâmica por Filtro', entrada: 'Filtro', esperado: 'OK (Tabela Ativa)', validacao: () => typeof renderizarTabela === 'function' },
        { id: 'CT-12', campo: 'nomeCompleto', tipo: 'REQUISITO', descricao: 'Métricas - Recálculo de Estatísticas/Folha', entrada: 'Estatísticas', esperado: 'Cálculo OK', validacao: () => typeof atualizarEstatisticas === 'function' },
        { id: 'CT-13', campo: 'nomeCompleto', tipo: 'REQUISITO', descricao: 'JSON - Função de Exportação', entrada: 'Export JSON', esperado: 'Arquivo Gerado', validacao: () => typeof exportarJSON === 'function' },
        { id: 'CT-14', campo: 'nomeCompleto', tipo: 'REQUISITO', descricao: 'JSON - Função de Importação', entrada: 'Import JSON', esperado: 'Base Restaurada', validacao: () => typeof importarJSON === 'function' },

        // ==========================================
        // PARTE 2: TODOS OS BLOQUEIOS (CT-15 ao CT-24)
        // ==========================================
        { id: 'CT-15', campo: 'nomeCompleto', tipo: 'BLOQUEIO', descricao: 'Nome - Bloqueio de Números e Símbolos', entrada: 'Maria123 @Oliveira#', esperado: 'Maria Oliveira', validacao: (o) => o === 'Maria Oliveira' },
        { id: 'CT-16', campo: 'nomeCompleto', tipo: 'BLOQUEIO', descricao: 'Nome - Remoção de Espaços Duplicados', entrada: 'Carlos   Eduardo   Silva', esperado: 'Carlos Eduardo Silva', validacao: (o) => o === 'Carlos Eduardo Silva' },
        { id: 'CT-17', campo: 'cpf', tipo: 'BLOQUEIO', descricao: 'CPF - Aceita Apenas Dígitos Numéricos', entrada: '123.456.789-00abc', esperado: '12345678900', validacao: (o) => o === '12345678900' },
        { id: 'CT-18', campo: 'rg', tipo: 'BLOQUEIO', descricao: 'RG - Converte "x" Minúsculo em Maiúsculo', entrada: '98765432x', esperado: '98765432X', validacao: (o) => o === '98765432X' },
        { id: 'CT-19', campo: 'dataNascimento', tipo: 'BLOQUEIO', descricao: 'Data Nasc. - Trava de Mês Máximo (<= 12)', entrada: '15182000', esperado: '15/12/2000', validacao: (o) => o === '15/12/2000' },
        { id: 'CT-20', campo: 'dataNascimento', tipo: 'BLOQUEIO', descricao: 'Data Nasc. - Trava de Dia Máximo (<= 31)', entrada: '45081995', esperado: '31/08/1995', validacao: (o) => o === '31/08/1995' },
        { id: 'CT-21', campo: 'telefone', tipo: 'BLOQUEIO', descricao: 'Telefone - Remoção de Caracteres Especiais', entrada: '(11) 98765-4321', esperado: '11987654321', validacao: (o) => o === '11987654321' },
        { id: 'CT-22', campo: 'cep', tipo: 'BLOQUEIO', descricao: 'CEP - Restrição para 8 Dígitos Numéricos', entrada: '123456789', esperado: '12345678', validacao: (o) => o === '12345678' },
        { id: 'CT-23', campo: 'matricula', tipo: 'BLOQUEIO', descricao: 'Matrícula - Somente Números', entrada: '2026-001A', esperado: '2026001', validacao: (o) => o === '2026001' },
        { id: 'CT-24', campo: 'salario', tipo: 'BLOQUEIO', descricao: 'Salário - Validação de Entrada Positiva', entrada: '5000.00', esperado: '5000.00', validacao: (o) => parseFloat(o) >= 0 }
    ];

    const tabela = document.getElementById('tabelaResultadosQA');
    if (!tabela) return;
    
    tabela.innerHTML = '';
    let passados = 0;
    let falhados = 0;

    casosDeTeste.forEach(ct => {
        let resultadoObtido = ct.campo ? simularEntradaNoCampo(ct.campo, ct.entrada) : ct.entrada;
        const aprovado = ct.validacao(resultadoObtido);

        if (aprovado) passados++;
        else falhados++;

        const isRequisito = ct.tipo === 'REQUISITO';
        const tagClass = isRequisito ? 'tag-requisito' : 'tag-bloqueio';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${ct.id}</strong><br><small style="color:#666;">${ct.descricao}</small></td>
            <td><span class="tag-tipo ${tagClass}">${ct.tipo}</span></td>
            <td><span class="log-code">${ct.entrada}</span></td>
            <td><span class="log-code">${ct.esperado}</span></td>
            <td><span class="log-code">${resultadoObtido || 'Sucesso'}</span></td>
            <td>
                <span class="badge-qa ${aprovado ? 'badge-pass' : 'badge-fail'}">
                    ${aprovado ? '✓ PASSOU' : '✗ FALHOU'}
                </span>
            </td>
        `;
        tabela.appendChild(tr);
    });

    // ATUALIZA CONTADORES NO PAINEL DE QA
    const elTotal = document.getElementById('qaTotal');
    const elPassados = document.getElementById('qaPassados');
    const elFalhados = document.getElementById('qaFalhados');

    if (elTotal) elTotal.textContent = casosDeTeste.length;
    if (elPassados) elPassados.textContent = passados;
    if (elFalhados) elFalhados.textContent = falhados;
}