const config = window.DISPLAY_CONFIG;

const MONTHS_SHORT = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

const WEATHER_LABELS = {
  0: { label: "Ciel dégagé", icon: "☀️" },
  1: { label: "Principalement dégagé", icon: "🌤️" },
  2: { label: "Partiellement nuageux", icon: "⛅" },
  3: { label: "Couvert", icon: "☁️" },
  45: { label: "Brouillard", icon: "🌫️" },
  48: { label: "Brouillard givrant", icon: "🌫️" },
  51: { label: "Bruine légère", icon: "🌦️" },
  53: { label: "Bruine", icon: "🌦️" },
  55: { label: "Bruine dense", icon: "🌧️" },
  61: { label: "Pluie faible", icon: "🌧️" },
  63: { label: "Pluie", icon: "🌧️" },
  65: { label: "Forte pluie", icon: "🌧️" },
  71: { label: "Neige faible", icon: "🌨️" },
  73: { label: "Neige", icon: "🌨️" },
  75: { label: "Forte neige", icon: "❄️" },
  80: { label: "Averses", icon: "🌦️" },
  81: { label: "Averses modérées", icon: "🌧️" },
  82: { label: "Fortes averses", icon: "⛈️" },
  95: { label: "Orage", icon: "⛈️" },
};

const elements = {
  company: document.getElementById("company"),
  tagline: document.getElementById("tagline"),
  time: document.getElementById("time"),
  date: document.getElementById("date"),
  weatherIcon: document.getElementById("weather-icon"),
  weatherCity: document.getElementById("weather-city"),
  weatherTemp: document.getElementById("weather-temp"),
  weatherDesc: document.getElementById("weather-desc"),
  weatherRange: document.getElementById("weather-range"),
  birthdayHero: document.getElementById("birthday-hero"),
  heroLabel: document.getElementById("hero-label"),
  heroTitle: document.getElementById("hero-title"),
  heroSubtitle: document.getElementById("hero-subtitle"),
  upcomingList: document.getElementById("upcoming-list"),
  footerNote: document.getElementById("footer-note"),
};

let birthdays = [];

function formatDateLabel(month, day) {
  return `${String(day).padStart(2, "0")} ${MONTHS_SHORT[month - 1]}`;
}

function getTodayParts() {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    day: now.getDate(),
    date: now,
  };
}

function daysUntil(month, day, referenceDate = new Date()) {
  const year = referenceDate.getFullYear();
  let target = new Date(year, month - 1, day);
  if (target < new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate())) {
    target = new Date(year + 1, month - 1, day);
  }
  const diffMs = target - new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function enrichBirthdays(entries) {
  return entries
    .map((entry) => ({
      ...entry,
      daysUntil: daysUntil(entry.month, entry.day),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

function updateClock() {
  const now = new Date();
  elements.time.textContent = now.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  elements.date.textContent = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function weatherInfo(code) {
  if (WEATHER_LABELS[code]) {
    return WEATHER_LABELS[code];
  }
  if (code >= 56 && code <= 57) return { label: "Bruine verglaçante", icon: "🌧️" };
  if (code >= 66 && code <= 67) return { label: "Pluie verglaçante", icon: "🌧️" };
  if (code >= 77 && code <= 77) return { label: "Grains de neige", icon: "🌨️" };
  if (code >= 85 && code <= 86) return { label: "Averses de neige", icon: "🌨️" };
  if (code >= 96 && code <= 99) return { label: "Orage avec grêle", icon: "⛈️" };
  return { label: "Conditions variables", icon: "🌡️" };
}

async function updateWeather() {
  const { latitude, longitude, timezone, city } = config.weather;
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min");
  url.searchParams.set("timezone", timezone);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("weather request failed");
    const data = await response.json();
    const current = data.current;
    const daily = data.daily;
    const info = weatherInfo(current.weather_code);

    elements.weatherCity.textContent = city;
    elements.weatherTemp.textContent = `${Math.round(current.temperature_2m)}°C`;
    elements.weatherDesc.textContent = info.label;
    elements.weatherIcon.textContent = info.icon;
    elements.weatherRange.textContent = `Min ${Math.round(daily.temperature_2m_min[0])}°C · Max ${Math.round(daily.temperature_2m_max[0])}°C`;
  } catch (error) {
    elements.weatherDesc.textContent = "Météo indisponible";
    elements.weatherRange.textContent = "Vérifiez la connexion réseau du player";
    console.error(error);
  }
}

function renderBirthdays() {
  const upcomingWindow = config.birthdays.upcomingDays;
  const enriched = enrichBirthdays(birthdays);
  const todayBirthdays = enriched.filter((entry) => entry.daysUntil === 0);
  const upcoming = enriched.filter((entry) => entry.daysUntil > 0 && entry.daysUntil <= upcomingWindow);

  if (todayBirthdays.length > 0) {
    elements.birthdayHero.classList.remove("empty");
    elements.heroLabel.textContent = "Anniversaire du jour";
    elements.heroTitle.textContent = todayBirthdays.map((entry) => entry.name).join(" · ");
    elements.heroSubtitle.textContent =
      todayBirthdays.length === 1
        ? "Toute l'équipe BC NORD vous souhaite un très joyeux anniversaire !"
        : "Toute l'équipe BC NORD vous souhaite un très joyeux anniversaire !";
  } else if (upcoming.length > 0) {
    elements.birthdayHero.classList.add("empty");
    elements.heroLabel.textContent = "Prochains anniversaires";
    elements.heroTitle.textContent = upcoming[0].name;
    elements.heroSubtitle.textContent = `Dans ${upcoming[0].daysUntil} jour${upcoming[0].daysUntil > 1 ? "s" : ""} · ${formatDateLabel(upcoming[0].month, upcoming[0].day)}`;
  } else {
    elements.birthdayHero.classList.add("empty");
    elements.heroLabel.textContent = "Anniversaires";
    elements.heroTitle.textContent = "Aucun anniversaire imminent";
    elements.heroSubtitle.textContent = `Prochaine mise à jour dans les ${upcomingWindow} prochains jours`;
  }

  elements.upcomingList.innerHTML = "";
  const listItems = [...todayBirthdays, ...upcoming].slice(0, 8);

  if (listItems.length === 0) {
    const empty = document.createElement("li");
    empty.className = "upcoming-empty";
    empty.textContent = "Pas d'anniversaire dans les prochains jours.";
    elements.upcomingList.appendChild(empty);
    return;
  }

  for (const entry of listItems) {
    const item = document.createElement("li");
    item.className = `upcoming-item${entry.daysUntil === 0 ? " is-today" : ""}`;

    const date = document.createElement("div");
    date.className = "upcoming-date";
    date.textContent = formatDateLabel(entry.month, entry.day);

    const name = document.createElement("div");
    name.className = "upcoming-name";
    name.textContent = entry.name;

    const badge = document.createElement("div");
    badge.className = "upcoming-badge";
    badge.textContent = entry.daysUntil === 0 ? "Aujourd'hui" : `J-${entry.daysUntil}`;

    item.append(date, name, badge);
    elements.upcomingList.appendChild(item);
  }
}

async function loadBirthdays() {
  const response = await fetch(config.birthdays.dataUrl);
  if (!response.ok) throw new Error("birthdays request failed");
  birthdays = await response.json();
  renderBirthdays();
}

function applyStaticConfig() {
  elements.company.textContent = config.companyName;
  elements.tagline.textContent = config.tagline;
  elements.footerNote.textContent = `${config.companyName} · Affichage dynamique`;
  document.title = `${config.companyName} · Écran bureau`;
}

async function init() {
  applyStaticConfig();
  updateClock();
  await Promise.all([loadBirthdays(), updateWeather()]);
  renderBirthdays();

  setInterval(updateClock, config.refresh.clockMs);
  setInterval(updateWeather, config.refresh.weatherMs);
  setInterval(loadBirthdays, config.refresh.birthdaysMs);
}

init().catch((error) => {
  console.error(error);
  elements.heroTitle.textContent = "Erreur de chargement";
  elements.heroSubtitle.textContent = "Vérifiez l'URL et les fichiers JSON.";
});
