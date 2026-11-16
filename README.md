# Extrator de Termos

Aplicação simples em HTML, CSS e JavaScript para criar glossários a partir de documentos jurídicos para facilitar a utilização em CatTools.

## Funcionalidades

### Extrair termos
- Extrai expressões entre aspas.
- Extrai palavras e expressões em CAIXA ALTA.
- Gera um arquivo XLSX com um termo por linha.
- Formatado para utilizar em projetos de tradução.

## Tecnologias
- HTML
- CSS
- JavaScript
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) para leitura do DOCX.
- [SheetJS](https://sheetjs.com/) para geração do XLSX.

## Como executar

### Simples

1. Baixe ou clone o projeto.
2. Abra o arquivo `index.html` em um navegador moderno.
3. Escolha a operação desejada.
4. Selecione um arquivo `.docx`.
5. Clique no botão para processar e depois em **Baixar arquivo XLSX**.

### Docker

1. Ajuste a porta do docker-compose.yml conforme sua preferência
2. Abra o terminal na pasta do projeto e execute o comando `docker compose up -d`
3. Acesse via navegador `localhost:8088`

As bibliotecas Mammoth.js e SheetJS são carregadas por CDN, portanto é necessária conexão com a internet ao abrir a aplicação.

## Observações

- O processamento é feito no navegador; o documento não é enviado para um servidor.
- A conversão prioriza o conteúdo textual. Formatação, imagens, cabeçalhos, rodapés e paginação do Word não são reproduzidos no Excel.
- Parágrafos são colocados em linhas separadas. Tabelas são convertidas mantendo a separação entre células.
