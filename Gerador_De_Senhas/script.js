const senhaEl = document.getElementById("senha");
const historicoEl = document.getElementById("historico");
const btnHistorico = document.getElementById("btnHistorico");

function gerarSenha() {
    const nivel = document.getElementById("nivel").value;
    let caracteres = "abcdefghijklmnopqrstuvwxyz";
    if (nivel === "medio") caracteres += "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    if (nivel === "dificil") caracteres += "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+";

    let senha = "";
    for (let i = 0; i < 10; i++) {
        senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    senhaEl.textContent = senha;
    salvarSenha(senha);
}

function salvarSenha(senha) {
    let historico = JSON.parse(localStorage.getItem("historicoSenhas")) || [];
    historico.push(senha);
    localStorage.setItem("historicoSenhas", JSON.stringify(historico));
    atualizarHistorico(true);
}

function atualizarHistorico(isNova = false) {
    let historico = JSON.parse(localStorage.getItem("historicoSenhas")) || [];
    historicoEl.innerHTML = "";
    historico.forEach((senha, index) => {
        const div = document.createElement("div");
        div.classList.add("senha-item");
        if (isNova && index === historico.length - 1) {
            div.classList.add("nova"); // anima apenas a última adicionada
        }
        div.innerHTML = `${senha} <button onclick="removerSenha(${index}, this)">❌</button>`;
        historicoEl.appendChild(div);
    });
}

function removerSenha(index, btn) {
    let historico = JSON.parse(localStorage.getItem("historicoSenhas")) || [];
    const div = btn.parentElement;
    div.classList.add("removendo");

    setTimeout(() => {
        historico.splice(index, 1);
        localStorage.setItem("historicoSenhas", JSON.stringify(historico));
        atualizarHistorico();
    }, 400);
}

function toggleHistorico() {
    historicoEl.classList.toggle("show");
    if (historicoEl.classList.contains("show")) {
        atualizarHistorico();
        btnHistorico.textContent = "Ocultar Histórico";
    } else {
        btnHistorico.textContent = "Mostrar Histórico";
    }
}

function toggleTema() {
    const body = document.body;
    if (body.classList.contains("dark")) {
        body.classList.remove("dark");
        body.classList.add("light");
        localStorage.setItem("tema", "light");
    } else {
        body.classList.remove("light");
        body.classList.add("dark");
        localStorage.setItem("tema", "dark");
    }
}

window.onload = () => {
    const tema = localStorage.getItem("tema") || "dark";
    document.body.classList.add(tema);
};