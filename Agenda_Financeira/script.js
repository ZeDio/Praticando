        let editMode = false;
        let dicas = [
            "💡 Dica: Guarde pelo menos 10% do que você ganha todo mês.",
            "💡 Dica: Evite compras por impulso, pense 24h antes.",
            "💡 Dica: Anote todos os seus gastos, mesmo os pequenos.",
            "💡 Dica: Monte uma reserva de emergência de 6 meses."
        ];
        let index = 0;
        const carousel = document.getElementById("carousel");
        function showCarousel() {
            carousel.classList.remove("show");
            setTimeout(() => {
                carousel.textContent = dicas[index];
                carousel.classList.add("show");
            }, 500);
            index = (index + 1) % dicas.length;
        }
        setInterval(showCarousel, 10000);
        showCarousel();

        function showModal(type) {
            const modal = document.getElementById(type + "-modal");
            modal.classList.add("show");
            modal.classList.remove("hide");
        }
        function hideModal(type) {
            const modal = document.getElementById(type + "-modal");
            modal.classList.add("hide");
            setTimeout(() => modal.classList.remove("show"), 300);
        }
        function addItem(type) {
            const nome = document.getElementById(type + "-nome").value;
            const valor = parseFloat(document.getElementById(type + "-valor").value);
            if (!nome || isNaN(valor)) return;
            let items = JSON.parse(localStorage.getItem("items")) || [];
            items.push({ type, nome, valor });
            localStorage.setItem("items", JSON.stringify(items));
            hideModal(type);
            renderTable();
        }
        function renderTable() {
            const container = document.getElementById("table-container");
            const tbody = document.getElementById("table-body");
            const summary = document.getElementById("summary");
            let items = JSON.parse(localStorage.getItem("items")) || [];
            if (items.length === 0) {
                container.classList.remove("show");
                return;
            }
            container.classList.add("show");
            tbody.innerHTML = "";
            let totalDespesas = 0, totalGanhos = 0;
            items.forEach((item, i) => {
                let tr = document.createElement("tr");
                tr.innerHTML = `
          <td>${item.type}</td>
          <td>${item.nome}</td>
          <td>R$ ${item.valor.toFixed(2)}</td>
          <td class="edit-col ${editMode ? 'show' : ''}">
            <button onclick="removeItem(${i}, this)">❌</button>
          </td>`;
                tbody.appendChild(tr);
                if (item.type === "despesa") totalDespesas += item.valor;
                else totalGanhos += item.valor;
            });
            let sobra = totalGanhos - totalDespesas;
            summary.textContent = `Total Ganhos: R$ ${totalGanhos.toFixed(2)} | Total Despesas: R$ ${totalDespesas.toFixed(2)} | Saldo: R$ ${sobra.toFixed(2)}`;
        }
        function removeItem(index, btn) {
            let tr = btn.closest("tr");
            tr.classList.add("removing");
            setTimeout(() => {
                let items = JSON.parse(localStorage.getItem("items")) || [];
                items.splice(index, 1);
                localStorage.setItem("items", JSON.stringify(items));
                renderTable();
            }, 300);
        }
        function copyTable() {
            const table = document.querySelector("table");
            let text = "";
            for (let row of table.rows) {
                let rowText = [...row.cells].map(cell => cell.innerText).join(" | ");
                text += rowText + "\n";
            }
            navigator.clipboard.writeText(text).then(() => {
                alert("Tabela copiada!");
            });
        }
        function toggleEdit() {
            editMode = !editMode;
            renderTable();
        }
        function toggleTheme() {
            document.body.classList.toggle("light");
            const btn = document.querySelector(".theme-toggle");
            if (document.body.classList.contains("light")) {
                btn.textContent = "☀️";
            } else {
                btn.textContent = "🌙";
            }
        }
        renderTable();