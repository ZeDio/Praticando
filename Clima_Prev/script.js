
const apiKey = "0bb4ab5f1e70e19db0dc58428460bf99"; // coloque sua chave aqui
const cityEl = document.getElementById("city");
const tempEl = document.getElementById("temp");
const descEl = document.getElementById("desc");
const iconEl = document.getElementById("icon");

const popup = document.getElementById("popup");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

// Botão de busca manual
searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city);
        popup.style.display = "none";
    }
});

// Tentativa automática por geolocalização
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoords(lat, lon);
            popup.style.display = "none";
        },
        () => {
            // Usuário negou a permissão → mantém o popup
            console.log("Localização negada, modo manual ativado.");
        }
    );
}

function fetchWeather(city) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pt_br`)
        .then((res) => res.json())
        .then((data) => {
            if (data.cod === 200) {
                showWeather(data);
            } else {
                alert("Cidade não encontrada 😕");
                console.error("Erro da API:", data);
            }
        })
        .catch((err) => {
            console.error("Erro de conexão:", err);
            alert("Erro ao buscar o clima.");
        });
}

function fetchWeatherByCoords(lat, lon) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`)
        .then((res) => res.json())
        .then((data) => {
            if (data.cod === 200) {
                showWeather(data);
            } else {
                console.error("Erro na resposta da API:", data);
                alert("Não foi possível obter o clima pela localização.");
            }
        })
        .catch((err) => {
            console.error("Erro de conexão:", err);
        });
}

function showWeather(data) {
    // segurança: verifica se dados existem
    if (!data.weather || !data.weather[0] || !data.main) {
        console.error("Resposta inválida da API:", data);
        alert("Erro ao processar os dados do clima.");
        return;
    }

    const { name } = data;
    const { description, icon } = data.weather[0];
    const { temp } = data.main;

    cityEl.textContent = name || "Cidade não encontrada";
    tempEl.textContent = `${Math.round(temp)}°C`;
    descEl.textContent = description.charAt(0).toUpperCase() + description.slice(1);
    iconEl.src = `https://openweathermap.org/img/wn/${icon}@2x.png`;

    changeBackground(description);
}

function changeBackground(desc) {
    desc = desc.toLowerCase();
    let bg = "linear-gradient(135deg, #4facfe, #00f2fe)";

    if (desc.includes("chuva")) bg = "linear-gradient(135deg, #667db6, #0082c8, #0082c8, #667db6)";
    else if (desc.includes("nublado")) bg = "linear-gradient(135deg, #757f9a, #d7dde8)";
    else if (desc.includes("neve")) bg = "linear-gradient(135deg, #83a4d4, #b6fbff)";
    else if (desc.includes("céu limpo") || desc.includes("ensolarado")) bg = "linear-gradient(135deg, #f6d365, #fda085)";

    document.body.style.background = bg;
}