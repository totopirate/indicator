

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// cfgi-chart.js 
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                              1 : ( 1.1 , 1.2 , 1.3 , 1.4 , 1.5 )
//                                              // GESTION DU GRAPHIQUE DU : CFGI ( Crypto Fear and Greed Index ) :

// ===================================================================================================================================
//                                1.1 :
//                                // Palette des couleurs des zones du CFGi (du plus petit au plus grand)
// ===================================================================================================================================
//                                1.2 :
//                                // Chargement et affichage du graphique CFGI
// ===================================================================================================================================
//                                1.3 :
//                                // Resize du graphique CFGI si besoin
// ===================================================================================================================================
//                                1.4 :
//                                // Affiche les zones fixes (Fibonacci) sur le graphique CFGI
// ===================================================================================================================================
//                                1.5 :
//                                // Supprime toutes les lignes/zones Fibonacci du graphique CFGI
// ===================================================================================================================================





// 1.1 :
// ===================================================================================================================================
//                                // Palette des couleurs des zones du CFGi (du plus petit au plus grand)

const zoneColorsCFGI = [
	{ color: 'rgb(7, 49, 2)'            , label: "Extreme Fear"        },    // 0–20
	{ color: 'rgba(60, 221, 28, 0.47)'  , label: "Fear / Extreme Fear" },    // 20–40
	{ color: 'rgba(235, 235, 74, 0.57)' , label: "Neutral / Fear"      },    // 40–60
	{ color: 'rgba(233, 157, 15, 0.5)'  , label: "Greed / Neutral"     },    // 60–80
	{ color: 'rgba(224, 19, 19, 0.66)'  , label: "Extreme Greed"       },    // 80–100
];


const zoneColorsCFGI2 = [
	{ color: 'rgb(7, 49, 2)'     },    // 0–20
	{ color: 'rgb(35, 187, 93)'  },    // 20–40
	{ color: 'rgb(235, 235, 74)' },    // 40–60
	{ color: 'rgb(233, 157, 15)' },    // 60–80
	{ color: 'rgb(224, 19, 19)'  },    // 80–100
];





// 1.2 :
// ===================================================================================================================================
//                                // Chargement et affichage du graphique CFGI

let chartCFGI;
let baseSeriesCFGI;
let fibLinesCFGI = [];
let coloredSeriesCFGI = [];
let priceLineLabelCFGI;

fetchAndDrawCFGIChart();

async function fetchAndDrawCFGIChart() {
	const response = await fetch("https://api.alternative.me/fng/?limit=0&format=json");
	const json = await response.json();
	const dataRaw = json.data.reverse();
	const data = dataRaw.map(item => ({
		time: new Date(Number(item.timestamp) * 1000).toISOString().split("T")[0],
		value: Number(item.value),
	}));

	chartCFGI = LightweightCharts.createChart(document.getElementById("chartCFGI"), {
		width: document.getElementById("chartCFGI").clientWidth,
		height: 500,
		layout: { background: { color: "#fff" }, textColor: "#000" },
		grid: { vertLines: { color: "#eee" }, horzLines: { color: "#eee" } },
		timeScale: { timeVisible: true, rightOffset: 50, barSpacing: 5 },
		handleScroll: { mouseWheel: true, pressedMouseMove: true },
		handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
		priceScale: { borderVisible: true },
		crosshair: {
			mode: LightweightCharts.CrosshairMode.Normal,
			vertLine: { color: 'rgba(0,0,0,0.5)', width: 1 },
			horzLine: { color: 'rgba(0,0,0,0.5)', width: 1 }
		},
	});

	chartCFGI.timeScale().applyOptions({
		minBarSpacing: 0.01,
		fixLeftEdge: false,
		fixRightEdge: false,
	});

	baseSeriesCFGI = chartCFGI.addLineSeries({
		color: 'rgba(0, 0, 255, 0.21)',
		lineWidth: 2,
		lastValueVisible: false, // désactive l’étiquette auto
	});
	baseSeriesCFGI.setData(data);
	chartCFGI.timeScale().fitContent();

	// Trouver la zone d’un score donné
	function findZoneIndex(value) {
		const fibLevels = [0, 20, 40, 60, 80, 100];
		for (let i = 0; i < fibLevels.length - 1; i++) {
			if (value >= fibLevels[i] && value < fibLevels[i + 1]) return i;
		}
		return fibLevels.length - 2;
	}

	// Ajout de l’étiquette dynamique selon la zone
	const lastValue = data[data.length - 1].value;
	const zoneIndex = findZoneIndex(lastValue);
	const zoneInfo = zoneColorsCFGI[zoneIndex] || { color: 'rgba(0,0,0,0.6)', label: '' };

	priceLineLabelCFGI = baseSeriesCFGI.createPriceLine({
		price: lastValue,
		color: zoneInfo.color,
		lineWidth: 3,
		axisLabelVisible: true,
		title: `${zoneInfo.label}`,
	});

	// Bouton du Cfgi
	document.getElementById('btnDrawFiboCFGI').onclick = () => drawFixedFibonacciZones(data);
	document.getElementById('btnClearFiboCFGI').onclick = clearFibonacciCFGI;


	// stocke le mapping date => CFGI pour l'overlay sur BTC
	window.cfgiMap = {};
	data.forEach(d => window.cfgiMap[d.time] = d.value);
}


// 1.3 :
// ===================================================================================================================================
//                                // Resize du graphique CFGI si besoin

window.addEventListener('resize', () => {
	if (chartCFGI) {
		chartCFGI.resize(document.getElementById('chartCFGI').clientWidth, 500);
	}
});


// 1.4 :
// ===================================================================================================================================
//                                // Affiche les zones fixes (Fibonacci) sur le graphique CFGI

// Zones fixes : 0-20, 20-40, 40-60, 60-80, 80-100
function drawFixedFibonacciZones(data) {
	clearFibonacciCFGI();

	const fibLevels = [0, 20, 40, 60, 80, 100];

	const fibZoneLabels = [
		"Extreme Fear (0)",
		"Fear / Extreme Fear (20)",
		"Neutral / Fear (40)",
		"Greed / Neutral (60)",
		"Extreme Greed / Greed (80)",
		"Extreme Greed (100)"
	];

	fibLevels.forEach((level, index) => {
		const line = baseSeriesCFGI.createPriceLine({
			price: level,
			color: zoneColorsCFGI[index] ? zoneColorsCFGI[index].color : 'rgba(10, 0, 0, 0.81)',
			lineWidth: 1,
			lineStyle: LightweightCharts.LineStyle.Solid,
			axisLabelVisible: true,
			title: fibZoneLabels[index],
		});
		fibLinesCFGI.push(line);
	});

	function findZone(value) {
		for (let i = 0; i < fibLevels.length - 1; i++) {
			if (value >= fibLevels[i] && value < fibLevels[i + 1]) return i;
		}
		return fibLevels.length - 2;
	}

	let segments = [];
	let currentZone = findZone(data[0].value);
	let currentSegment = [data[0]];

	for (let i = 1; i < data.length; i++) {
		const point = data[i];
		const zone = findZone(point.value);

		if (zone === currentZone) {
			currentSegment.push(point);
		} else {
			const transitionValue = fibLevels[Math.max(currentZone, zone)];
			const prevPoint = data[i - 1];

			const tPrev = new Date(prevPoint.time).getTime();
			const tCurr = new Date(point.time).getTime();
			const tMid = new Date((tPrev + tCurr) / 2).toISOString().split("T")[0];

			const transitionPoint = { time: tMid, value: transitionValue };

			currentSegment.push(transitionPoint);
			segments.push({ zone: currentZone, points: [...currentSegment] });

			currentSegment = [transitionPoint, point];
			currentZone = zone;
		}
	}
	if (currentSegment.length) {
		segments.push({ zone: currentZone, points: [...currentSegment] });
	}

	coloredSeriesCFGI.forEach(s => chartCFGI.removeSeries(s));
	coloredSeriesCFGI = [];

	console.log(`Zone Sentiment CFGI créés : ${segments.length}`);

	segments.forEach(({ zone, points }) => {
		const color = zoneColorsCFGI[zone] ? zoneColorsCFGI[zone].color : 'rgba(0,0,0,0.4)';
		const series = chartCFGI.addLineSeries({
			color: color,
			lineWidth: 3,
			priceLineVisible: false,
			lastValueVisible: false,
		});
		series.setData(points);
		coloredSeriesCFGI.push(series);
	});
}


// 1.5 :
// ===================================================================================================================================
//                                // Supprime toutes les lignes/zones Fibonacci du graphique CFGI

function clearFibonacciCFGI() {
	fibLinesCFGI.forEach(line => baseSeriesCFGI.removePriceLine(line));
	fibLinesCFGI = [];

	coloredSeriesCFGI.forEach(series => chartCFGI.removeSeries(series));
	coloredSeriesCFGI = [];
}


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------



