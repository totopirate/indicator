// m2-chart.js

// URL API publique pour M2 (via FRED JSON API)
// Ici, on utilise une version CORS-friendly via stlouisfed.org JSON, mais pour local test, on peut mocker.
const M2_API_URL = "https://api.stlouisfed.org/fred/series/observations?series_id=M2SL&api_key=DEMO_KEY&file_type=json";

// Conteneur Chart.js
const ctxM2 = document.getElementById("chartM2").getContext("2d");

async function fetchM2Data() {
  try {
    const res = await fetch(M2_API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Transforme les données en format Chart.js : labels + valeurs
    const labels = [];
    const values = [];
    data.observations.forEach(obs => {
      if (obs.value !== ".") { // Ignore les valeurs manquantes
        labels.push(obs.date);
        values.push(parseFloat(obs.value));
      }
    });

    return { labels, values };
  } catch (err) {
    console.error("Erreur M2:", err);
    return { labels: [], values: [] };
  }
}

async function drawM2Chart() {
  const { labels, values } = await fetchM2Data();

  if (!labels.length) {
    ctxM2.font = "16px Arial";
    ctxM2.fillText("Erreur chargement M2", 50, 50);
    return;
  }

  new Chart(ctxM2, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "M2 Global",
        data: values,
        borderColor: "#007bff",
        borderWidth: 2,
        fill: false,
        pointRadius: 0, // pas de points, ligne continue
        tension: 0.2 // ligne légèrement courbée
      }]
    },
    options: {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true }
      },
      scales: {
        x: {
          display: true,
          title: { display: true, text: "Date" },
          ticks: { maxRotation: 45, minRotation: 45 }
        },
        y: {
          display: true,
          title: { display: true, text: "M2 (USD)" },
          beginAtZero: false
        }
      }
    }
  });
}

// Lance le graphique
drawM2Chart();
