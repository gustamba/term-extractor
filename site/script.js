
const uploadForm = document.getElementById("uploadForm");
const submitButton = document.getElementById("submitButton");
const statusMessage = document.getElementById("status");
const fileInput = document.getElementById("fileInput");
const extractionType = document.getElementById("extractionType");

uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = fileInput.files[0];

    if (!file || !file.name.toLowerCase().endsWith(".docx")) {
        showStatus("Selecione um arquivo .docx válido.", "error");
        return;
    }

    if (typeof XLSX === "undefined" || typeof mammoth === "undefined") {
        showStatus("Não foi possível carregar as bibliotecas. Verifique sua conexão.", "error");
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Processando...";

    try {
        const arrayBuffer = await readFile(file);
        const result = await mammoth.extractRawText({ arrayBuffer });

        const terms = extractTerms(result.value, extractionType.value);

        if (terms.length === 0) {
            showStatus("Nenhum termo foi encontrado.", "error");
            return;
        }

        const workbook = XLSX.utils.book_new();

        const worksheet = XLSX.utils.aoa_to_sheet([
            ["Glossário"],
            ...terms.map(term => [term])
        ]);

        worksheet["!cols"] = [{ wch: 50 }];

        XLSX.utils.book_append_sheet(workbook, worksheet, "Glossário");

        const fileName = buildFileName(file.name);

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array"
        });

        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });

        const url = URL.createObjectURL(blob);

        showStatus(
            `${terms.length} termo(s) encontrado(s). Clique abaixo para baixar.`,
            "success",
            url,
            fileName
        );

    } catch (error) {
        console.error(error);
        showStatus("Erro ao processar o documento.", "error");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Extrair termos";
    }
});

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = event => resolve(event.target.result);
        reader.onerror = () => reject(new Error("Erro ao ler arquivo."));

        reader.readAsArrayBuffer(file);
    });
}

function extractTerms(content, type) {
    let matches = [];

    if (type === "quotes") {
        const pattern = /"([^"]+)"|'([^']+)'|“([^”]+)”|‘([^’]+)’/g;
        let match;

        while ((match = pattern.exec(content)) !== null) {
            const term = match.slice(1).find(Boolean);
            if (term) matches.push(term.trim());
        }

    } else if (type === "capslock") {
        const pattern =
            /\b[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+(?:\s+[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+)*\b/g;

        matches = content.match(pattern) || [];
    }

    return [...new Set(matches.map(term => term.trim()).filter(Boolean))];
}

function buildFileName(originalName) {
    const name = originalName.replace(/\.docx$/i, "");
    return `${name}_glossario.xlsx`;
}

function showStatus(message, type, url = null, fileName = null) {
    statusMessage.innerHTML = "";
    statusMessage.className = type;

    const text = document.createElement("p");
    text.textContent = message;
    statusMessage.appendChild(text);

    if (url && fileName) {
        const link = document.createElement("a");

        link.href = url;
        link.download = fileName;
        link.textContent = "Baixar arquivo Excel";
        link.className = "download-link";

        statusMessage.appendChild(link);
    }
}
