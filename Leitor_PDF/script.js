if (window.pdfjsLib)
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

const fileInput = document.getElementById('file');
const output = document.getElementById('output');
const extractBtn = document.getElementById('extract');
const copyBtn = document.getElementById('copy');
const downloadBtn = document.getElementById('download');
const clearBtn = document.getElementById('clear');
let currentFile = null;

fileInput.addEventListener('change', e => {
    currentFile = e.target.files[0];
});

extractBtn.addEventListener('click', async () => {
    if (!currentFile) {
        alert('Selecione um arquivo PDF primeiro!');
        return;
    }
    try {
        const arrayBuffer = await currentFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map(item => item.str).join(' ') + '\n\n';
        }
        output.value = text.trim();
    } catch (err) {
        alert('Erro ao extrair texto: ' + err.message);
    }
});

copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(output.value);
    alert('Texto copiado!');
});

downloadBtn.addEventListener('click', () => {
    const blob = new Blob([output.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (currentFile ? currentFile.name.replace(/\.pdf$/i, '') : 'texto') + '.txt';
    a.click();
});

clearBtn.addEventListener('click', () => {
    output.value = '';
    fileInput.value = '';
    currentFile = null;
});