

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// cfgi-color-btc.js 
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                              2 : ( 2.1 , 2.2 , 2.3 , 2.4 , 2.5 )
//                                              // GESTION COLORATION DU : BTC EN MODE CFGI :

// ===================================================================================================================================
//                                2.1 :
//                                // Trouve la valeur CFGI la plus proche pour une date donnée
// ===================================================================================================================================
//                                2.2 :
//                                // Précalcule les données BTC enrichies avec la valeur CFGI associée
// ===================================================================================================================================
//                                2.3 :
//                                // Dessine les segments colorés CFGI sur le graphique BTC
// ===================================================================================================================================
//                                2.4 :
//                                // Met à jour le graphique BTC avec l’overlay CFGI si activé
// ===================================================================================================================================
//                                2.5 :
//                                // Toggle de l’overlay CFGI sur BTC + resize + changement d’échelle
// ===================================================================================================================================





// 2.1 :
// ===================================================================================================================================
//                                // Trouve la valeur CFGI la plus proche pour une date donnée

let coloredSeriesCFGIonBTC = [];
let isCFGIVisibleOnBTC = false;
window.btcDataWithCFGI = [];

// Trouve la valeur CFGI la plus proche dans les 7 jours précédents
function getClosestCFGIDate(dateStr) {
	let d = new Date(dateStr);
	for (let i = 0; i <= 7; i++) {
		const checkDate = new Date(d.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
		if (window.cfgiMap && window.cfgiMap[checkDate] !== undefined) {
			return window.cfgiMap[checkDate];
		}
	}
	return undefined;
}


// 2.2 :
// ===================================================================================================================================
//                                // Précalcule les données BTC enrichies avec la valeur CFGI associée

// Pré-calcul du tableau BTC enrichi avec la valeur CFGI associée
function precomputeBTCWithCFGI() {
	const btcData = window.currentScale === 'log' ? window.btcPriceDataLog : window.btcPriceDataArith;
	if (!btcData || !window.cfgiMap) {
		window.btcDataWithCFGI = [];
		return;
	}
	window.btcDataWithCFGI = btcData.map(point => {
		const dateStr = new Date(point.time * 1000).toISOString().split("T")[0];
		const cfgiValue = getClosestCFGIDate(dateStr);
		return { ...point, cfgiValue };
	});
}


// 2.3 :
// ===================================================================================================================================
//                                // Dessine les segments colorés CFGI sur le graphique BTC

// Dessine les segments colorés en utilisant le tableau pré-calculé
function drawCFGIColorOverlayOnBTC() {
	if (!window.chartInstance) {
		console.log("Pas de chartInstance, sortie.");
		return;
	}
	coloredSeriesCFGIonBTC.forEach(s => window.chartInstance.removeSeries(s));
	coloredSeriesCFGIonBTC = [];

	if (!window.btcDataWithCFGI || window.btcDataWithCFGI.length === 0) {
		console.log("Pas de données BTC avec CFGI pré-calculées.");
		return;
	}

	function findZone(value) {
		if (value === undefined || value === null) return 0;
		return Math.min(Math.floor(value / 20), 4);
	}

	let segments = [];
	let currentZone = null;
	let currentSegment = [];

	window.btcDataWithCFGI.forEach(point => {
		const cfgiValue = point.cfgiValue;

		if (cfgiValue === undefined) {
			if (currentSegment.length > 1) {
				segments.push({ zone: currentZone, points: [...currentSegment] });
			}
			currentSegment = [];
			currentZone = null;
			return;
		}

		const zone = findZone(cfgiValue);

		if (currentZone === null || zone === currentZone) {
			currentSegment.push(point);
			currentZone = zone;
		} else {
			if (currentSegment.length >= 1) {
				const transitionPoint = {
					time: point.time,
					value: point.value
				};
				currentSegment.push(transitionPoint);
				segments.push({ zone: currentZone, points: [...currentSegment] });

				currentSegment = [point];
				currentZone = zone;
			} else {
				currentSegment = [point];
				currentZone = zone;
			}
		}
	});

	if (currentSegment.length > 1) {
		segments.push({ zone: currentZone, points: [...currentSegment] });
	}

    console.log(`Segments Mode Cfgi créés : ${segments.length}`);

	segments.forEach(({ zone, points }) => {
		const color = zoneColorsCFGI2[zone] ? zoneColorsCFGI2[zone].color : 'rgba(0,0,0,0.4)';
		const series = window.chartInstance.addLineSeries({
			color: color,
			lineWidth: 3,
			priceLineVisible: false,
			lastValueVisible: false,
		});
		series.setData(points);
		coloredSeriesCFGIonBTC.push(series);
	});
}


// 2.4 :
// ===================================================================================================================================
//                                // Met à jour le graphique BTC avec l’overlay CFGI si activé

// Met à jour superposition CFGI
function updateCFGIOverlay() {
	precomputeBTCWithCFGI();
	if (isCFGIVisibleOnBTC) drawCFGIColorOverlayOnBTC();
}


// 2.5 :
// ===================================================================================================================================
//                                // Toggle de l’overlay CFGI sur BTC + resize + changement d’échelle

// Activer/désactiver la superposition CFGI sur BTC
document.getElementById('toggleCFGIonBTC').onclick = () => {
	isCFGIVisibleOnBTC = !isCFGIVisibleOnBTC;
	if (isCFGIVisibleOnBTC) {
		updateCFGIOverlay();
		document.getElementById('toggleCFGIonBTC').textContent = "Masquer  Mode 3 ( Zone-Sentiment-Cfgi )";
	} else {
		coloredSeriesCFGIonBTC.forEach(s => window.chartInstance.removeSeries(s));
		coloredSeriesCFGIonBTC = [];
		document.getElementById('toggleCFGIonBTC').textContent = "Afficher  Mode 3 ( Zone-Sentiment-Cfgi )";
	}
};

// Quand on change l’échelle du graphique BTC
document.getElementById('scaleSelector').addEventListener('change', e => {
	window.currentScale = e.target.value;
	updateBTCChartData(window.chartInstance.getSeries()[0], window.chartInstance, window.btcPriceDataArith, window.btcPriceDataLog, window.currentScale);
	updateCFGIOverlay();
});

// Resize handler (si besoin)
window.addEventListener('resize', () => {
	if (window.chartInstance) {
		const container = document.getElementById('btcChart') || document.getElementById('chartBTC');
		if (container) {
			window.chartInstance.resize(container.clientWidth, 600);
		}
	}
});

// Initialisation si nécessaire
updateCFGIOverlay();
