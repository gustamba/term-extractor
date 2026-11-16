# Extrator de Termos

Aplicação simples em HTML, CSS e JavaScript para trabalhar com documentos Word (`.docx`) e gerar planilhas Excel (`.xlsx`).

## Funcionalidades

### 1. Extrair termos
- Extrai expressões entre aspas.
- Extrai palavras e expressões em CAIXA ALTA.
- Gera um arquivo XLSX com um termo por linha.

### 2. Converter DOCX para XLSX
- Lê o conteúdo do documento Word.
- Coloca cada parágrafo em uma linha da planilha.
- Converte as linhas de tabelas do Word em linhas e células da planilha.
- Gera um arquivo XLSX para download.

## Tecnologias
- HTML
- CSS
- JavaScript
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) para leitura do DOCX.
- [SheetJS](https://sheetjs.com/) para geração do XLSX.

## Como executar

Não é necessário instalar Node.js ou configurar um backend.

1. Baixe ou clone o projeto.
2. Abra o arquivo `index.html` em um navegador moderno.
3. Escolha a operação desejada.
4. Selecione um arquivo `.docx`.
5. Clique no botão para processar e depois em **Baixar arquivo XLSX**.

As bibliotecas Mammoth.js e SheetJS são carregadas por CDN, portanto é necessária conexão com a internet ao abrir a aplicação.

## Observações

- O processamento é feito no navegador; o documento não é enviado para um servidor.
- A conversão prioriza o conteúdo textual. Formatação, imagens, cabeçalhos, rodapés e paginação do Word não são reproduzidos no Excel.
- Parágrafos são colocados em linhas separadas. Tabelas são convertidas mantendo a separação entre células.
