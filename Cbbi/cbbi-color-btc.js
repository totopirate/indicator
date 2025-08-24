

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------    

// cbbi-color-btc.js
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                              3 : ( 3.1 , 3.2 , 3.3 , 3.4 , 3.5 , 3.6 )
//                                              // GESTION COLORATION DU : BTC EN MODE FIBO 1 :

// ===================================================================================================================================
//                                3.1 :
//                                // initialise window.cbbiMap
// ===================================================================================================================================
//                                3.2 :
//                                // Couleurs des zones Fibonacci (rgba + alpha)
// ===================================================================================================================================
//                                3.3 :
//                                // Dessine une superposition colorée (CBBI) sur le graphique BTC selon les zones de Fibonacci
// ===================================================================================================================================
//                                3.4 :
//                                // Resize handler si besoin 
// ===================================================================================================================================
//                                3.5 :
//                                // Toggle CFGI overlay sur BTC 
// ===================================================================================================================================
//                                3.6 :
//                                // Quand on change l’échelle du graphique BTC
// ===================================================================================================================================





// 3.1 :
// ===================================================================================================================================
//                                // initialise window.cbbiMap

async function loadCBBIMap() {
  const response = await fetch("https://colintalkscrypto.com/cbbi/data/latest.json");
  const json = await response.json();

  const timestamps = Object.keys(json.Confidence);
  const values = Object.values(json.Confidence);

  const cbbiMap = {};
  for (let i = 0; i < timestamps.length; i++) {
    const date = new Date(Number(timestamps[i]) * 1000).toISOString().split("T")[0];
    cbbiMap[date] = values[i] * 100;
  }

  window.cbbiMap = cbbiMap;
}


// 3.2 :
// ===================================================================================================================================
//                                // Couleurs des zones Fibonacci (rgba + alpha)

let zoneColors3 = [{
	color: 'rgba(216, 176, 240, 0.9)',
	alpha: 0.9
}, {
	color: 'rgba(233, 157, 15, 0.9)',
	alpha: 0.9
}, {
	color: 'rgba(201, 201, 38, 0.9)',
	alpha: 0.9
}, {
	color: 'rgba(43, 146, 23, 0.9)',
	alpha: 0.9
}, {
	color: 'rgba(9, 217, 245, 0.9)',
	alpha: 0.9
}, {
	color: 'rgba(107, 145, 224, 0.9)',
	alpha: 0.9
}, {
	color: 'rgba(216, 11, 11, 0.9)',
	alpha: 0.9
}, {
	color: 'rgba(164, 164, 165, 0.9)',
	alpha: 0.9
}, {
	color: 'rgba(0, 0, 0, 0.9)',
	alpha: 0.9
}, ];


// 3.3 :
// ===================================================================================================================================
//                                // Dessine une superposition colorée (CBBI) sur le graphique BTC selon les zones de Fibonacci

let cbbiColoredSeriesonBtc = [];         
let isCBBIVisibleOnBTC = false;


function drawCBBIColorOverlayOnBTC() {
	if (!window.chartInstance || !window.cbbiMap) {
		console.log("Pas de chartInstance ou cbbiMap, sortie.");
		return;
	}

	cbbiColoredSeriesonBtc.forEach(s => window.chartInstance.removeSeries(s));
	cbbiColoredSeriesonBtc = [];

	const btcData = window.currentScale === 'log' ? window.btcPriceDataLog : window.btcPriceDataArith;
	if (!btcData) {
		console.log("Pas de données BTC selon l'échelle", window.currentScale);
		return;
	}

	const fibLevels = [0, 0.146, 0.236, 0.382, 0.5, 0.618, 0.786, 0.854, 0.90, 1];

	const findZone = cbbiValue => {
		for (let i = 0; i < fibLevels.length - 1; i++) {
			const low = fibLevels[i] * 100;
			const high = fibLevels[i + 1] * 100;
			if (cbbiValue >= low && cbbiValue < high) {
				return i;
			}
		}
		return fibLevels.length - 2;
	};

	const getClosestCBBIDate = (dateStr) => {
		let d = new Date(dateStr);
		for (let i = 0; i <= 7; i++) {
			const checkDate = new Date(d.getTime() - i * 86400000).toISOString().split("T")[0];
			if (window.cbbiMap[checkDate] !== undefined) {
				return window.cbbiMap[checkDate];
			}
		}
		return undefined;
	};

	// Prétraitement : injecte cbbiValue et zone directement dans btcData
	btcData.forEach(pt => {
		const dateStr = new Date(pt.time * 1000).toISOString().split("T")[0];
		const cbbiVal = getClosestCBBIDate(dateStr);
		pt.cbbiValue = cbbiVal;
		pt.zone = (typeof cbbiVal !== 'undefined') ? findZone(cbbiVal) : null;
	});

	// Coloration rapide via segments
	const segments = [];
	let currentZone = null;
	let currentSegment = [];

	for (let i = 0; i < btcData.length; i++) {
		const pt = btcData[i];

		if (typeof pt.zone !== 'number') {
			if (currentSegment.length > 1) {
				segments.push({ zone: currentZone, points: [...currentSegment] });
			}
			currentSegment = [];
			currentZone = null;
			continue;
		}

		if (currentZone === null || pt.zone === currentZone) {
			currentSegment.push(pt);
			currentZone = pt.zone;
		} else {
			currentSegment.push(pt); // transition point inclus
			segments.push({ zone: currentZone, points: [...currentSegment] });
			currentSegment = [pt];
			currentZone = pt.zone;
		}
	}

	if (currentSegment.length > 1) {
		segments.push({ zone: currentZone, points: [...currentSegment] });
	}

	console.log(`Segments Mode 1 créés : ${segments.length}`);

	segments.forEach(({ zone, points }) => {
		const color = zoneColors3[zone] ? zoneColors3[zone].color : 'rgba(0,0,0,0.4)';
		const series = window.chartInstance.addLineSeries({
			color: color,
			lineWidth: 3,
			priceLineVisible: false,
			lastValueVisible: false,
		});
		series.setData(points);
		cbbiColoredSeriesonBtc.push(series);
	});
}


// 3.4 :
// ===================================================================================================================================
//                                // Resize handler si besoin 

window.addEventListener('resize', () => {
    if (window.chartInstance) {
        window.chartInstance.resize(document.getElementById('chartBTC').clientWidth, 500);
    }
});


// 3.5 :
// ===================================================================================================================================
//                                // Toggle CFGI overlay sur BTC (Bouton)

document.getElementById('toggleCBBIonBTC').onclick = () => {  
	isCBBIVisibleOnBTC = !isCBBIVisibleOnBTC;
	if (isCBBIVisibleOnBTC) {
		drawCBBIColorOverlayOnBTC();
		document.getElementById('toggleCBBIonBTC').textContent = "Masquer mode 1 ( Zone-Fibo-Cbbi ) ";
	} else {
		cbbiColoredSeriesonBtc.forEach(s => window.chartInstance.removeSeries(s));
		cbbiColoredSeriesonBtc = [];
		document.getElementById('toggleCBBIonBTC').textContent = "Afficher mode 1 ( Zone-Fibo-Cbbi )";
	}
};


// 3.6 :
// ===================================================================================================================================
//                               // Quand on change l’échelle du graphique BTC

document.getElementById('scaleSelector').addEventListener('change', e => {
	window.currentScale = e.target.value;
	// Met à jour la série BTC (log/arithmetic) – fonction à écrire dans ton code principal
	updateBTCChartData(window.chartInstance.getSeries()[0], window.chartInstance, window.btcPriceDataArith, window.btcPriceDataLog, window.currentScale);

	if (isCBBIVisibleOnBTC) {
		drawCBBIColorOverlayOnBTC();
	}
});

window.addEventListener('resize', () => {
	if (window.chartInstance) {
		window.chartInstance.resize(document.getElementById('btcChart').clientWidth, 600);
	}
});

