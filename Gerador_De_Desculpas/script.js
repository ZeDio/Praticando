(function () {
    const PHRASES = [
        "O gato desligou o Wi-Fi bem na hora da reunião!",
        "Fui abduzido, mas voltei a tempo de mandar essa mensagem.",
        "Acordei numa conferência de zumbis e perdi a noção do tempo.",
        "Meu café entrou em greve e eu não consegui funcionar.",
        "Tive que ensinar meu cachorro a usar o Excel, demorou mais que eu imaginava.",
        "A senha do meu cérebro expirou, aguardando reset.",
        "Me teletransportei para outro fuso horário, retorno em breve.",
        "Fui chamado para uma missão secreta pela minha mãe.",
        "Meu modem entrou em meditação profunda.",
        "Meu despertador fez hora extra dormindo.",
        "Meu computador achou que hoje era domingo e se recusou a ligar.",
        "Fui salvar um arquivo e acabei salvando minha sanidade por engano.",
        "O vento levou minha conexão junto com a dignidade.",
        "Minha geladeira estava triste, tive que consolá-la.",
        "Meu gato achou que o teclado era cama e declarou território.",
        "A atualização do Windows começou justo quando eu estava inspirado.",
        "A energia acabou, mas meu sono não.",
        "Fui tomar um café e voltei com uma filosofia de vida.",
        "Meu microfone decidiu entrar em modo ninja.",
        "Meu fone de ouvido se aposentou sem aviso prévio.",
        "Recebi um convite urgente para um duelo com o travesseiro.",
        "O universo me deu tela azul por alguns minutos.",
        "Meu mouse fugiu pra USB desconhecida.",
        "Estava tentando achar o botão 'motivação' e acabei clicando em 'soneca'.",
        "Meu antivírus confundiu meu foco com uma ameaça e bloqueou.",
        "A impressora pediu férias e me deixou na mão.",
        "Meu relógio achou que estávamos em Marte e mudou o horário.",
        "Fui perseguido por uma aba de notificações e precisei me esconder.",
        "O aplicativo travou de vergonha do meu desempenho.",
        "Meu cérebro entrou em modo avião sem aviso.",
        "A cadeira giratória me hipnotizou por alguns minutos.",
        "O Wi-Fi decidiu meditar e ficou em silêncio total.",
        "Meu teclado se ofendeu e parou de digitar sozinho.",
        "Um bug emocional me impediu de funcionar normalmente.",
        "Meu alarme achou que era feriado nacional.",
        "Fui atualizar o navegador e ele atualizou minha paciência também.",
        "O GPS da minha vida recalculou a rota e me perdi.",
        "Meu cérebro ficou em buffering.",
        "Tentei reiniciar o dia, mas o botão travou.",
        "Meu celular entrou em modo drama.",
        "Estava resolvendo um conflito diplomático entre meu sofá e meu corpo.",
        "Meu roteador se candidatou a monge e vive em silêncio.",
        "Meu café estava em manutenção programada.",
        "O tempo travou na hora que eu precisava correr.",
        "Fui trollado pelo despertador — ele tocou no fuso errado.",
        "O universo deu alt+tab em mim.",
        "Meu teclado entrou em greve por melhores condições de digitação.",
        "Uma força cósmica me puxou pro lado errado da produtividade.",
        "Meu notebook pediu um tempo no relacionamento.",
        "Estava prestes a chegar, mas entrei num loop de procrastinação infinita.",
        "Meu gato fez um update no sistema e deletou minha agenda.",
        "O botão 'levantar' do meu corpo estava desativado.",
        "Tive que ajudar meu ventilador a lidar com uma crise existencial.",
        "Perdi a luta contra o cobertor — e ele venceu por nocaute.",
        "O Wi-Fi decidiu praticar desapego e se foi sem avisar.",
        "O tempo se perdeu tentando me encontrar.",
        "Meu HD interno está fragmentado demais pra funcionar direito.",
        "Fui refém de uma tempestade de notificações.",
        "Meu cérebro tirou uma folga sem me consultar.",
        "Fui testar o modo avião… e o avião decolou sem mim.",
        "Meu cachorro roubou meu lugar de produtividade.",
        "Fui resolver um bug pessoal e o sistema travou.",
        "Meu controle remoto da vida ficou sem pilha.",
        "Estava em uma reunião com o destino, ele pediu mais prazo.",
        "A internet me deixou no modo 'modo offline'.",
        "O universo aplicou um patch e eu ainda não reiniciei.",
        "Fui hackeado pela preguiça.",
        "Meu antivírus achou que a motivação era um vírus e excluiu.",
        "Fui bloqueado pela realidade.",
        "Meu roteador decidiu que hoje seria um dia de introspecção.",
        "O tempo piscou e eu perdi o horário.",
        "Meu gato derrubou o plano A, o B e o C.",
        "O despertador tocou, mas o sono venceu de virada.",
        "Minha mente travou um duelo com o cansaço — e perdeu."
    ];

    const KEY_HISTORY = 'desculpas_history_v1';
    const KEY_THEME = 'desculpas_theme_v1';

    const btnGen = document.getElementById('generate');
    const btnHist = document.getElementById('history');
    const phraseEl = document.getElementById('phrase');
    const modal = document.getElementById('modal');
    const modalList = document.getElementById('modalList');
    const modalClose = document.getElementById('modalClose');
    const toggleTheme = document.getElementById('toggleTheme');

    function saveHistory(arr) { localStorage.setItem(KEY_HISTORY, JSON.stringify(arr.slice(0, 10))); }
    function loadHistory() { try { return JSON.parse(localStorage.getItem(KEY_HISTORY)) || []; } catch (e) { return []; } }
    function saveTheme(t) { localStorage.setItem(KEY_THEME, t); }
    function loadTheme() { return localStorage.getItem(KEY_THEME) || null; }

    function showPhrase(text) {
        phraseEl.classList.remove('show');
        requestAnimationFrame(() => {
            phraseEl.textContent = text;
            phraseEl.classList.add('show');
        });
    }

    function generate() {
        const idx = Math.floor(Math.random() * PHRASES.length);
        const text = PHRASES[idx];
        showPhrase(text);
        const hist = loadHistory();
        hist.unshift(text);
        saveHistory(hist.slice(0, 10));
    }

    function renderModalList() {
        const hist = loadHistory();
        modalList.innerHTML = '';
        if (hist.length === 0) {
            const el = document.createElement('div'); el.className = 'modal-item'; el.textContent = 'Nenhuma frase gerada ainda.'; modalList.appendChild(el); return;
        }
        hist.forEach((t, i) => {
            const el = document.createElement('div'); el.className = 'modal-item'; el.textContent = (i + 1) + '. ' + t; modalList.appendChild(el);
        });
    }

    function openModal() { renderModalList(); modal.classList.add('visible'); modal.setAttribute('aria-hidden', 'false'); }
    function closeModal() { modal.classList.remove('visible'); modal.setAttribute('aria-hidden', 'true'); }

    function applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            toggleTheme.textContent = '☀️';
        } else {
            document.documentElement.removeAttribute('data-theme');
            toggleTheme.textContent = '🌙';
        }
        toggleTheme.setAttribute('aria-pressed', theme === 'light');
        saveTheme(theme);
    }

    (function init() {
        const t = loadTheme();
        if (t) applyTheme(t);

        btnGen.addEventListener('click', () => generate());
        btnHist.addEventListener('click', () => openModal());
        modalClose.addEventListener('click', () => closeModal());
        modal.addEventListener('click', (ev) => { if (ev.target === modal) closeModal(); });

        toggleTheme.addEventListener('click', () => {
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            applyTheme(isLight ? 'dark' : 'light');
        });

        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    })();
})();