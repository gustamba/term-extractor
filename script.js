const uploadForm = document.getElementById("uploadForm");
const operationSelect = document.getElementById("operation");
const extractionOptions = document.getElementById("extractionOptions");
const submitButton = document.getElementById("submitButton");
const downloadLink = document.getElementById("downloadLink");
const statusMessage = document.getElementById("status");

operationSelect.addEventListener("change", () => {
    const isExtract = operationSelect.value === "extract";
    extractionOptions.hidden = !isExtract;
    submitButton.textContent = isExtract ? "Extrair termos" : "Converter para XLSX";
    clearResult();
});

uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = document.getElementById("fileInput").files[0];
    if (!file) {
        showStatus("Selecione um arquivo .docx.", "error");
        return;
    }

    if (!file.name.toLowerCase().endsWith(".docx")) {
        showStatus("Formato inválido. Selecione um arquivo .docx.", "error");
        return;
    }

    clearResult();
    submitButton.disabled = true;
    submitButton.textContent = "Processando...";
    showStatus("Processando documento...", "info");

    try {
        const arrayBuffer = await readFile(file);
        const workbook = XLSX.utils.book_new();

        if (operationSelect.value === "extract") {
            const result = await mammoth.extractRawText({ arrayBuffer });
            const type = document.getElementById("extractionType").value;
            const terms = extractTerms(result.value, type);

            if (terms.length === 0) {
                showStatus("Nenhum termo foi encontrado no documento.", "error");
                return;
            }

            const worksheet = XLSX.utils.aoa_to_sheet([
                ["Glossário"],
                ...terms.map(term => [term])
            ]);
            XLSX.utils.book_append_sheet(workbook, worksheet, "Glossário");
            downloadWorkbook(workbook, buildFileName(file.name, "glossario"));
            showStatus(`${terms.length} termo(s) encontrado(s). Planilha pronta!`, "success");
        } else {
            const result = await mammoth.convertToHtml({ arrayBuffer });
            const rows = extractDocumentRows(result.value);

            if (rows.length === 0) {
                showStatus("Não foi encontrado conteúdo para converter.", "error");
                return;
            }

            const worksheet = XLSX.utils.aoa_to_sheet(rows);
            worksheet["!cols"] = calculateColumnWidths(rows);
            XLSX.utils.book_append_sheet(workbook, worksheet, "Documento");
            downloadWorkbook(workbook, buildFileName(file.name, "convertido"));
            showStatus(`Documento convertido: ${rows.length} linha(s) adicionada(s) à planilha.`, "success");
        }
    } catch (error) {
        console.error(error);
        showStatus("Erro ao processar o documento. Verifique se o arquivo é um DOCX válido.", "error");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = operationSelect.value === "extract"
            ? "Extrair termos"
            : "Converter para XLSX";
    }
});

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => resolve(event.target.result);
        reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
        reader.readAsArrayBuffer(file);
    });
}

function extractTerms(content, type) {
    const quotesPattern = /("|“)[^"”]+("|”)/g;
    const capslockPattern = /\b[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+(?:\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+)*\b/g;

    let matches = [];
    if (type === "quotes") {
        matches = content.match(quotesPattern) || [];
        return [...new Set(matches.map(term => term.replace(/["“”]/g, "").trim()).filter(Boolean))];
    }

    if (type === "capslock") {
        matches = content.match(capslockPattern) || [];
        return [...new Set(matches.map(term => term.trim()).filter(Boolean))];
    }

    return [];
}

// Converte parágrafos e tabelas do DOCX em linhas/células do Excel.
function extractDocumentRows(html) {
    const parser = new DOMParser();
    const documentHtml = parser.parseFromString(html, "text/html");
    const rows = [];

    function addParagraphs(parent) {
        for (const child of parent.children) {
            if (child.tagName === "P") {
                const text = child.textContent.trim();
                if (text) rows.push([text]);
            } else if (child.tagName === "TABLE") {
                for (const tableRow of child.querySelectorAll("tr")) {
                    const cells = [...tableRow.querySelectorAll(":scope > th, :scope > td")]
                        .map(cell => cell.textContent.trim());
                    if (cells.some(Boolean)) rows.push(cells);
                }
            } else {
                addParagraphs(child);
            }
        }
    }

    addParagraphs(documentHtml.body);
    return rows;
}

function calculateColumnWidths(rows) {
    const maxColumns = Math.max(...rows.map(row => row.length));
    return Array.from({ length: maxColumns }, (_, columnIndex) => ({
        wch: Math.min(
            Math.max(...rows.map(row => String(row[columnIndex] || "").length), 12),
            60
        )
    }));
}

function downloadWorkbook(workbook, fileName) {
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.style.display = "inline-block";
}

function buildFileName(originalName, suffix) {
    const name = originalName.replace(/\.docx$/i, "");
    return `${name}_${suffix}.xlsx`;
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = type;
}

function clearResult() {
    statusMessage.textContent = "";
    statusMessage.className = "";
    downloadLink.style.display = "none";
    if (downloadLink.href.startsWith("blob:")) {
        URL.revokeObjectURL(downloadLink.href);
    }
    downloadLink.removeAttribute("href");
}
