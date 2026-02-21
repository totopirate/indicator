// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// indicator-main/RSI/rsi-chart.js
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                              1 : (1.1, 1.2, 1.3, 1.4)
//                                              // GESTION DU GRAPHIQUE RSI MENSUEL BITCOIN
// ===================================================================================================================================
//                                1.1 :
//                                // Variables globales et configuration du graphique RSI
// ===================================================================================================================================
//                                1.2 :
//                                // Couleurs arc-en-ciel RSI
// ===================================================================================================================================
//                                1.3 :
//                                // Fonction fetchFullHistory() : récupération historique BTC quotidien
// ===================================================================================================================================
//                                1.4 :
//                                // Conversion des données journalières en données mensuelles
// ===================================================================================================================================
//                                1.5 :
//                                // Calcul du RSI mensuel
// ===================================================================================================================================
//                                1.6 :
//                                // Création graphique RSI avec LightweightCharts
// ===================================================================================================================================
//                                1.7 :
//                                // Fonction updateSeriesColoring() : applique couleurs arc-en-ciel si activé
// ===================================================================================================================================
//                                1.8 :
//                                // INIT : Lancement initial du graphique RSI
// ===================================================================================================================================
//                                1.9 :
//                                // Accordions et boutons toggle couleur / légende 
// ===================================================================================================================================
//                                1.10 :
//                                // Redimensionnement automatique du graphique à la taille du container
// ===================================================================================================================================




// 1.1 :
// ===================================================================================================================================
//                                // Variables globales et configuration du graphique RSI

let rsiChart;                          // Chart principal
let rsiBaseSeries;                      // Série principale du RSI
let rsiLine30;                          // Ligne RSI 30
let rsiline50;                          // Ligne RSI 50
let rsiLine70;                          // Ligne RSI 70

let rsiMonthlyCache = null;             // Cache RSI mensuel
let btcDailyCache = null;               // Cache prix BTC quotidien

let colorOn = false;                     // Gestion coloration arc-en-ciel

let statusEl = document.getElementById('status');                  // Statut chargement

const btnToggleColor = document.getElementById('btnToggleColor');  // Bouton toggle couleur
const btnLegend = document.getElementById('btnLegend');            // Bouton toggle légende
const legendOverlay = document.getElementById('legendOverlay');    // Overlay légende



// 1.2 :
// ===================================================================================================================================
//                                // Couleurs arc-en-ciel RSI

function rsiColor(val) {
    if(val < 20) return '#ffffff';  
    if(val < 30) return '#811aca';
    if(val < 40) return '#0000ff'; 
    if(val < 50) return '#00bfff';
    if(val < 60) return '#00ff7f'; 
    if(val < 70) return '#ffff00';
    if(val < 80) return '#ffa500';
    if(val < 90) return '#ff0000';
    return '#a3a0a0';
}







 

// 1.3 :
// ===================================================================================================================================
//                                // Fonction fetchFullHistory() : récupération historique BTC quotidien

async function fetchFullHistory() {
    if (btcDailyCache) return btcDailyCache;

    let allData = [];
    let toTs = Math.floor(Date.now() / 1000);
    const oldestTimestamp = Math.floor(new Date('2010-01-01T00:00:00Z').getTime() / 1000);
    const limit = 2000;

    try {
        while(toTs > oldestTimestamp) {
            const res = await fetch(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=BTC&tsym=USD&limit=${limit}&toTs=${toTs}`);
            const json = await res.json();
            if(!json || !json.Data || json.Data.Data.length === 0) break;
            allData = json.Data.Data.concat(allData);
            toTs = json.Data.Data[0].time - 1;
            if (json.Data.Data[0].time <= oldestTimestamp) break;
        }
        btcDailyCache = allData.filter(d => d.time >= oldestTimestamp);
        return btcDailyCache;
    } catch (e) {
        console.error('Erreur chargement données BTC :', e);
        throw e;
    }
}


// 1.4 :
// ===================================================================================================================================
//                                // Conversion des données journalières en données mensuelles

function convertToMonthlyFromDaily(rawDaily) {
    const monthlyMap = {};
    rawDaily.forEach(d => {
        const date = new Date(d.time * 1000);
        const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
        if(!monthlyMap[key] || d.time > monthlyMap[key].time) {
            monthlyMap[key] = { time: d.time, close: d.close };
        }
    });
    return Object.values(monthlyMap).sort((a,b)=>a.time-b.time);
}


// 1.5 :
// ===================================================================================================================================
//                                // Calcul du RSI mensuel

function calculateMonthlyRSI(monthlyData) {
    if(!monthlyData || monthlyData.length < 2) return [];
    const period = 14;
    const result = [];
    const changes = [];
    for(let i=1; i<monthlyData.length; i++) changes.push(monthlyData[i].close - monthlyData[i-1].close);

    const gains = changes.map(c => c>0?c:0);
    const losses = changes.map(c => c<0?Math.abs(c):0);

    let avgGain = 0, avgLoss = 0;
    if(gains.length >= period) {
        avgGain = gains.slice(0, period).reduce((a,b)=>a+b,0)/period;
        avgLoss = losses.slice(0, period).reduce((a,b)=>a+b,0)/period;
        const firstRSI = avgLoss===0?100:100-(100/(1+(avgGain/avgLoss)));
        result.push({ time: monthlyData[period].time, value: firstRSI });

        for(let i=period; i<gains.length; i++) {
            avgGain = (avgGain*(period-1)+gains[i])/period;
            avgLoss = (avgLoss*(period-1)+losses[i])/period;
            result.push({ time: monthlyData[i+1].time, value: 100-(100/(1+(avgGain/avgLoss))) });
        }
    }
    return result;
}


// 1.6 :
// ===================================================================================================================================
//                                // Création graphique RSI avec LightweightCharts

function createChart(containerId) {
    // Création du graphique avec LightweightCharts (structure identique à cbbi-chart-fibo.js)

    // ► Création du graphique RSI avec LightweightCharts
    const chartRsi = LightweightCharts.createChart(document.getElementById(containerId), {   // ici chart en chartRsi
        width: document.getElementById(containerId).clientWidth,
        height: 500,

        layout: {
            background: { color: 'rgba(42, 48, 61, 0.6)'  },
            textColor: "#fff"
        },

        grid: {
            vertLines: { color: 'rgba(60, 63, 70, 0.6)' },
            horzLines: { color: 'rgba(60, 63, 70, 0.6)' }
        },

        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
            vertLine: { color: '#cccccc', width: 1 },
            horzLine: { color: '#cccccc', width: 1 }
        },

        priceScale: { borderVisible: true },
        rightPriceScale: { borderColor: '#cccccc', visible: true },

        timeScale: {
            borderColor: '#cccccc',
            timeVisible: true,
            secondsVisible: false,
            rightOffset: 0,
            barSpacing: 5,
            minBarSpacing: 0.1,
            fixLeftEdge: false
        },

        handleScroll: {
            mouseWheel: true,
            pressedMouseMove: true
        },

        handleScale: {
            mouseWheel: true,
            pinch: true,
            axisPressedMouseMove: true
        }
    });


    const baseSeries = chartRsi.addLineSeries({ color:'#9abaf7ff', lineWidth: 2 });

    // ✅ Mettre les vraies données du RSI
    if (rsiMonthlyCache && rsiMonthlyCache.length) {
        baseSeries.setData(rsiMonthlyCache);
        chartRsi.timeScale().fitContent(); // ← ajuste automatiquement le graphique pour afficher toute la série
    }
        
    const s70 = chartRsi.addLineSeries({ color:'#ef4444', lineWidth:1 , priceLineVisible:true, lastValueVisible:true });
    const s50 = chartRsi.addLineSeries({ color:'#e0e1e9ff', lineWidth:1 , priceLineVisible:true, lastValueVisible:true });   
    const s30 = chartRsi.addLineSeries({ color:'#22c55e', lineWidth:1 , priceLineVisible:true, lastValueVisible:true });

    s70.setData([{ time:rsiMonthlyCache?.[0]?.time||0, value:70 }, { time:rsiMonthlyCache?.[rsiMonthlyCache.length-1]?.time||0, value:70 }]);
    s50.setData([{ time:rsiMonthlyCache?.[0]?.time||0, value:50 }, { time:rsiMonthlyCache?.[rsiMonthlyCache.length-1]?.time||0, value:50 }]);
    s30.setData([{ time:rsiMonthlyCache?.[0]?.time||0, value:30 }, { time:rsiMonthlyCache?.[rsiMonthlyCache.length-1]?.time||0, value:30 }]);    

    // Assignation correcte pour updateSeriesColoring()
 

    return { chartRsi, baseSeries, s70, s50, s30 };
}



// 1.7 :
// ===================================================================================================================================
//                                // Fonction updateSeriesColoring() : applique couleurs arc-en-ciel si activé

function updateSeriesColoring() {
    if(!rsiBaseSeries || !rsiMonthlyCache) return;
    const points = rsiMonthlyCache.map(p => ({
        time:p.time,
        value:p.value,
        color:colorOn?rsiColor(p.value):undefined
    }));
    rsiBaseSeries.setData(points);
    
}



// 1.8 :
// ===================================================================================================================================
//                                // INIT : Lancement initial du graphique RSI
async function drawRSI() {
    try {
        statusEl.textContent = 'Chargement des données BTC...';
        const raw = await fetchFullHistory();
        statusEl.textContent = 'Conversion mensuelle & calcul RSI...';

        const monthly = convertToMonthlyFromDaily(raw);
        const rsiMonthly = calculateMonthlyRSI(monthly);
        rsiMonthlyCache = rsiMonthly;

        if(rsiChart) { try { rsiChart.remove(); } catch(e){ } rsiChart = null; }

        const created = createChart('rsi-chart');
        rsiChart = created.chartRsi;
        rsiBaseSeries = created.baseSeries;


        updateSeriesColoring();

        statusEl.textContent = 'Données chargées — RSI affiché';

        window.addEventListener('resize', () => {
            rsiChart.applyOptions({ width:document.getElementById('rsi-chart').clientWidth });
        });

    } catch(err) {
        console.error(err);
        statusEl.textContent = 'Erreur chargement données — voir console';
    }
}

// Lancement principal
drawRSI();


// 1.9 :
// ===================================================================================================================================
//                                // Accordions et boutons toggle couleur / légende

// ► Accordions pour sections
document.querySelectorAll('.accordion-header').forEach(btn => {
    btn.addEventListener('click', () => btn.parentElement.classList.toggle('open'));
});

// ► Bouton toggle couleur RSI
btnToggleColor.addEventListener('click', () => {
    colorOn = !colorOn;
    btnToggleColor.classList.toggle( colorOn);
    btnToggleColor.textContent = colorOn ? ' Suprimer Color' : ' Tracer Color';
    updateSeriesColoring();
});



// ► Bouton toggle couleur RSI
btnLegend.addEventListener('click', () => {
  if (legendOverlay.style.display === 'none' || legendOverlay.style.display === '') {
    legendOverlay.style.display = 'flex';  // <-- mettre flex au lieu de block
  } else {
    legendOverlay.style.display = 'none';
  }
});


// 1.10 :
// ===================================================================================================================================
//                                // Redimensionnement automatique du graphique à la taille du container

window.addEventListener('resize', () => {
    if(rsiChart) rsiChart.resize(document.getElementById('rsi-chart').clientWidth, 500);
});



 
