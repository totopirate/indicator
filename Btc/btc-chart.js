

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------  

// indicator-main/Btc/btc-chart.js
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                              1 : ( 1.1 , 1.2 , 1.3 , 1.4 , 1.5 , 1.6 )
//                                              // GESTION DU GRAPHIQUE DU : BTC ( Bitcoin ):

// ===================================================================================================================================
//                                1.1 :
//                                // Récupère un batch d’historique BTC (2000 jours max) via l’API CryptoCompare
// ===================================================================================================================================
//                                1.2 :
//                                // Récupère l’historique complet de BTC depuis 2010 (en plusieurs batches)
// ===================================================================================================================================
//                                1.3 :
//                                // Transforme les données de prix en échelle logarithmique (log10)
// ===================================================================================================================================
//                                1.4 :
//                                // Met à jour l’échelle du graphique (arithmétique ou logarithmique) avec les données correspondantes
// ===================================================================================================================================
//                                1.5 :
//                                // Création ligne droite projetée sur 3650 jours (pour graphique avec 10 ans de date suplementaire)
// ===================================================================================================================================
//                                1.6 :
//                                // Initialise, configure et affiche le graphique BTC avec Lightweight Charts
// ===================================================================================================================================
//                                1.7 :
//                                // INIT : Lancement initial du graphique BTC
// ===================================================================================================================================




// 1.1 :
// ===================================================================================================================================
//                                // Récupère un batch d’historique BTC (2000 jours max) via l’API CryptoCompare

async function fetchCryptoCompareHistodayBatch(symbol = 'BTC', currency = 'USD', toTs = Math.floor(Date.now() / 1000), limit = 2000) {
	const url = `https://min-api.cryptocompare.com/data/v2/histoday?fsym=${symbol}&tsym=${currency}&limit=${limit}&toTs=${toTs}`;
	const res = await fetch(url);
	const json = await res.json();
	if (json.Response !== 'Success') throw new Error('Erreur API Cryptocompare: ' + json.Message);
	return json.Data.Data;
}


// 1.2 :
// ===================================================================================================================================
//                                // Récupère l’historique complet de BTC depuis 2010 (en plusieurs batches)

async function fetchFullHistory() {
	let allData = [];
	let toTs = Math.floor(Date.now() / 1000);
	const oldestTimestamp = Math.floor(new Date('2010-01-01T00:00:00Z').getTime() / 1000);
	const limit = 2000;

	while (toTs > oldestTimestamp) {
		const batch = await fetchCryptoCompareHistodayBatch('BTC', 'USD', toTs, limit);
		if (batch.length === 0) break;

		allData = batch.concat(allData);
		toTs = batch[0].time - 1;
		if (batch[0].time <= oldestTimestamp) break;
	}
	return allData.filter(d => d.time >= oldestTimestamp);
}


// 1.3 :
// ===================================================================================================================================
//                                // Transforme les données de prix en échelle logarithmique (log10)

function transformToLog(data) {
	const minPositive = 0.01;
	return data.map(d => {
		const val = d.value < minPositive ? minPositive : d.value;
		return {
			time: d.time,
			value: Math.log10(val),
			originalValue: d.value,
		};
	});
}


// 1.4 :
// ===================================================================================================================================
//                                // Met à jour l’échelle du graphique (arithmétique ou logarithmique) avec les données correspondantes

function updateBTCChartData(lineSeries, chart, dataArith, dataLog, currentScale) {
	if (currentScale === 'arith') {
		lineSeries.setData(dataArith.map(d => ({ time: d.time, value: d.value })));
	} else {
		lineSeries.setData(dataLog.map(d => ({ time: d.time, value: d.value })));
	}
	chart.applyOptions({ rightPriceScale: { scaleMargins: { top: 0.2, bottom: 0.2 } } });

	const firstTime = Math.floor(new Date('2010-01-01T00:00:00Z').getTime() / 1000);
	const lastTime = Math.floor(Date.now() / 1000);
	chart.timeScale().setVisibleRange({ from: firstTime, to: lastTime });
}





// 1.5 :
// ===================================================================================================================================
//                                // Création ligne droite projetée sur 3650 jours (pour graphique avec 10 ans de date suplementaire)

function addProjectionLine(chart, lastDataPoint) {
	const projection = [];
	const days = 3650;
	const constValue = lastDataPoint.value;

	for (let i = 1; i <= days; i++) {
		const time = lastDataPoint.time + i * 86400; // un jour = 86400 secondes
		projection.push({ time, value: constValue });
	}

	const projectionSeries = chart.addLineSeries({
		color: 'rgba(255, 0, 0, 0)',
		lineWidth: 1,
		lineStyle: LightweightCharts.LineStyle.Dotted,
		priceLineVisible: false,      //  Supprime la ligne horizontale à droite
		lastValueVisible: false,      //  Supprime l’étiquette de prix
	});


	projectionSeries.setData(projection);

	// Stockage global pour basculer entre les deux modes
	window.projectionSeries = projectionSeries;
	window.projectionData = {
		arith: projection,
		log: projection,
	};
}


// 1.6 :
// ===================================================================================================================================
//                                // Initialise, configure et affiche le graphique BTC avec Lightweight Charts


async function drawBTCChart(BtcDivID, scaleSelectorId) {
    const statusEl = document.getElementById('status-btc'); // Assure-toi d'avoir <div id="status-btc"></div> dans ton HTML

    try {
        // ► Message : Début du chargement
        if (statusEl) statusEl.textContent = 'Chargement des données BTC...';

        // ► Chargement de l'historique BTC complet
        const rawData = await fetchFullHistory();
        if (statusEl) statusEl.textContent = 'Transformation des données (arithmétique/log) en cours...';

        // ► Données échelle arithmétique
        const dataArith = rawData.map(d => ({
            time: d.time,
            value: d.close,
        }));

        window.btcPriceData = dataArith;
        window.btcPriceDataArith = dataArith; 

        // ► Données échelle logarithmique
        const dataLog = transformToLog(dataArith);
        window.btcPriceDataLog = dataLog; 

        if (statusEl) statusEl.textContent = 'Création du graphique BTC...';

        // ► Création du graphique avec LightweightCharts
        const chartContainer = document.getElementById(BtcDivID);
        const chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: 500,
            layout: {
                background: { color: 'rgba(42, 48, 61, 0.6)' },
                textColor: "#ffffffff"
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
            timeScale: { borderColor: '#cccccc', timeVisible: true, secondsVisible: false, rightOffset: 0, barSpacing: 2, minBarSpacing: 0, fixLeftEdge: false },
            handleScroll: { mouseWheel: true, pressedMouseMove: true },
            handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true }
        });

        // ► Stockage global
        window.chartInstance = chart;
        window.chartInstances[BtcDivID] = chart;

        // ► Série principale (BTC)
        const lineSeries = chart.addLineSeries({
            color: '#9abaf7ff',
            lineWidth: 2,
            priceFormat: {
                type: 'custom',
                formatter: price => window.currentScale === 'log' ? (Math.pow(10, price)).toFixed(2) : price.toFixed(2),
            },
        });
        window.btcLineSeries = lineSeries;

        // ► Échelle actuelle
        window.currentScale = 'log';

        // ► Affichage initial
        updateBTCChartData(lineSeries, chart, dataArith, dataLog, window.currentScale);

        // ► Ligne projetée rouge
        const lastRealData = window.currentScale === 'arith'
            ? dataArith[dataArith.length - 1]
            : dataLog[dataLog.length - 1];
        addProjectionLine(chart, lastRealData, window.currentScale);

        // ► Gestion du sélecteur d’échelle
        document.getElementById(scaleSelectorId).addEventListener('change', e => {
            window.currentScale = e.target.value;
            updateBTCChartData(lineSeries, chart, dataArith, dataLog, window.currentScale);

            if (window.projectionSeries && window.projectionData) {
                const projData = window.projectionData[window.currentScale];
                window.projectionSeries.setData(projData);
            }
        });

        // ► Redimensionnement dynamique
        window.addEventListener('resize', () => {
            chart.applyOptions({ width: chartContainer.clientWidth });
        });

        // ► Message : chargement terminé
        if (statusEl) statusEl.textContent = 'Données chargées — graphique BTC affiché';

    } catch (e) {
        console.error(e);
        if (statusEl) statusEl.textContent = 'Erreur chargement données BTC — voir console';
    }
}



// 1.7 :
// ===================================================================================================================================
//                                // INIT : Lancement initial du graphique BTC

document.addEventListener("DOMContentLoaded", () => {
    const charts = [
        { divId: "chartBTC1", scaleId: "scaleSelector1" },
        { divId: "chartBTC2", scaleId: "scaleSelector2" },
        { divId: "chartBTC3", scaleId: "scaleSelector3" },
        { divId: "chartBTC4", scaleId: "scaleSelector4" }
    ];

    charts.forEach(c => {
        if (document.getElementById(c.divId)) {
            drawBTCChart(c.divId, c.scaleId);
        }
    });
});
