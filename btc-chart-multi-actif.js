// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------  

// btc-chart.js
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

async function fetchFullHistory(symbol = 'BTC') {
	let allData = [];
	let toTs = Math.floor(Date.now() / 1000);
	const oldestTimestamp = Math.floor(new Date('2010-01-01T00:00:00Z').getTime() / 1000);
	const limit = 2000;

	while (toTs > oldestTimestamp) {
		const batch = await fetchCryptoCompareHistodayBatch(symbol, 'USD', toTs, limit);
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

async function drawBTCChart(asset = 'BTC') {
	try {
		// ► Chargement de l'historique complet
		const rawData = await fetchFullHistory(asset);

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

		// Si le graphique n’existe pas, on le crée (1ère fois)
		if (!window.chartInstance) {
			const chart = LightweightCharts.createChart(document.getElementById('chartBTC'), {
				width: document.getElementById('chartBTC').clientWidth,
				height: 500,
				layout: {
					background: { color: '#ffffff' },
					textColor: '#000000',
				},
				grid: {
					vertLines: { color: '#eeeeee' },
					horzLines: { color: '#eeeeee' },
				},
				crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
				rightPriceScale: { borderColor: '#cccccc', visible: true },
				timeScale: {
					borderColor: '#cccccc',
					timeVisible: true,
					secondsVisible: false,
					rightOffset: 0,
					barSpacing: 2,
					minBarSpacing: 0,
					fixLeftEdge: false,
					handleScroll: { mouseWheel: true },
				},
			});
			window.chartInstance = chart;

			// Série principale (BTC)
			const lineSeries = chart.addLineSeries({
				color: 'blue',
				lineWidth: 2,
				priceFormat: {
					type: 'custom',
					formatter: price => window.currentScale === 'log' ? (Math.pow(10, price)).toFixed(2) : price.toFixed(2),
				},
			});
			window.lineSeries = lineSeries;

			// Création de la ligne projetée rouge
			const lastRealData = window.currentScale === 'arith'
				? dataArith[dataArith.length - 1]
				: dataLog[dataLog.length - 1];
			addProjectionLine(chart, lastRealData);

			// Gestion du redimensionnement
			window.addEventListener('resize', () => {
				chart.applyOptions({ width: document.getElementById('chartBTC').clientWidth });
			});
		}

		// Mise à jour des données sur la même série et graphique existants
		updateBTCChartData(window.lineSeries, window.chartInstance, dataArith, dataLog, window.currentScale);

		// Mise à jour de la projection rouge quand les données changent
		if (window.projectionSeries && window.projectionData) {
			const lastRealData = window.currentScale === 'arith'
				? dataArith[dataArith.length - 1]
				: dataLog[dataLog.length - 1];
			const projection = [];
			const days = 3650;
			const constValue = lastRealData.value;
			for (let i = 1; i <= days; i++) {
				const time = lastRealData.time + i * 86400;
				projection.push({ time, value: constValue });
			}
			window.projectionData = {
				arith: projection,
				log: projection,
			};
			window.projectionSeries.setData(window.projectionData[window.currentScale]);
		}

	} catch (e) {
		alert(e.message);
		console.error(e);
	}
}


// 1.7 :
// ===================================================================================================================================
//                                // INIT : Lancement initial du graphique BTC

window.currentScale = 'log'; // échelle par défaut
drawBTCChart('BTC');



// ===================================================================================================================================
//                                // Gestion du sélecteur d’échelle

document.getElementById('scaleSelector').addEventListener('change', e => {
	window.currentScale = e.target.value;

	if (window.btcPriceDataArith && window.btcPriceDataLog && window.lineSeries && window.chartInstance) {
		updateBTCChartData(window.lineSeries, window.chartInstance, window.btcPriceDataArith, window.btcPriceDataLog, window.currentScale);

		if (window.projectionSeries && window.projectionData) {
			window.projectionSeries.setData(window.projectionData[window.currentScale]);
		}
	}
});


// ===================================================================================================================================
//                                // Gestion du sélecteur d’actif (BTC, ETH, ADA, etc)

document.getElementById('assetSelector').addEventListener('change', async (e) => {
	const newAsset = e.target.value;

	// Recharge le graphique avec les données du nouvel actif sans recréer le chart
	await drawBTCChart(newAsset);
});









