

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------  

// cbbi-chart-fibo.js
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                              1 : ( 1.1 , 1.2 , 1.3 , 1.4 )
//                                              // GESTION DU GRAPHIQUE DU : CBBI ( Crypto Bitcoin Bull Run Index ):

// ===================================================================================================================================
//                                1.1 :
//                                // Gestion du graphique CBBI et zones Fibonacci colorées
// ===================================================================================================================================
//                                1.2 :
//                                // Initialisation du graphique CBBI au chargement
// ===================================================================================================================================
//                                1.3 :
//                                // Fonction principale : Récupérer les données CBBI et dessiner le graphique initial
// ===================================================================================================================================
//                                1.4 :
//                                // Redimensionnement automatique du graphique à la taille du container
// ===================================================================================================================================





// 1.1 :
// ===================================================================================================================================
//                                // Gestion du graphique CBBI et zones Fibonacci colorées

// Variables globales du graphique, séries et lignes Fibonacci
let cbbiChart;                                                                                     // ici chart en cbbiChart

let cbbiFibLines = [];                                                                             // ici fiblines en cbbiFiblines 

let cbbiColoredSeries = [];                                                                        // ici coloredSeries en cbbiColoredSeries
    
let cbbiBaseSeries;                                                                                // ici baseSeries en cbbiBaseSeries
 
// Couleurs des zones Fibonacci (rgba + alpha)
let zoneColors = [{
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



// 1.2 :
// ===================================================================================================================================
//                                // Initialisation du graphique CBBI au chargement


fetchAndDrawChart();


// 1.3 :
// ===================================================================================================================================
//                                // Fonction principale : Récupérer les données CBBI et dessiner le graphique initial

async function fetchAndDrawChart() {

	// Récupération des données JSON (timestamps + valeurs CBBI)
	const response = await fetch("https://colintalkscrypto.com/cbbi/data/latest.json");
	const json = await response.json();
	const timestamps = Object.keys(json.Confidence);
	const values = Object.values(json.Confidence);

	// Transformation des timestamps UNIX en dates ISO, valeurs multipliées par 100
	const data = timestamps.map((ts, i) => {
		const date = new Date(Number(ts) * 1000);
		return {
			time: date.toISOString().split("T")[0],
			value: values[i] * 100,
		};
	});

	// Création du graphique avec LightweightCharts
	cbbiChart = LightweightCharts.createChart(document.getElementById("chartCBBI"), {                  // ici chart en cbbiChart
		width: document.getElementById("chartCBBI").clientWidth,
		height: 500,
		layout: {
			background: {
				color: "#fff"
			},
			textColor: "#000"
		},
		grid: {
			vertLines: {
				color: "#eee"
			},
			horzLines: {
				color: "#eee"
			}
		},
		timeScale: {
			timeVisible: true,
			secondsVisible: false,
			rightOffset: 50,
			barSpacing: 5,
			minBarSpacing: 0.1,
		},
		handleScroll: {
			mouseWheel: true,
			pressedMouseMove: true
		},
		handleScale: {
			mouseWheel: true,
			pinch: true,
			axisPressedMouseMove: true
		},
		priceScale: {
			borderVisible: true
		},
		crosshair: {
			mode: LightweightCharts.CrosshairMode.Normal,
			vertLine: {
				color: 'rgba(0,0,0,0.5)',
				width: 1
			},
			horzLine: {
				color: 'rgba(0,0,0,0.5)',
				width: 1
			},
		},
	});



	

	// Ajout de la série principale en ligne bleue
	cbbiBaseSeries = cbbiChart.addLineSeries({                                                     // ici chart en cbbiChart  // ici baseSeries en cbbiBaseSeries
		color: 'blue',
		lineWidth: 2
	});
	cbbiBaseSeries.setData(data);
	cbbiChart.timeScale().fitContent();                                                            // ici chart en cbbiChart  // ici baseSeries en cbbiBaseSeries




	// Bouton pour dessiner la ligne Fibonacci avec les valeurs saisies
	document.getElementById('btnDrawFibo').onclick = () => {
		const value1 = parseFloat(document.getElementById('value1').value);
		const value2 = parseFloat(document.getElementById('value2').value);
		if (isNaN(value1) || isNaN(value2)) {
			alert("Merci de renseigner deux valeurs numériques valides.");
			return;
		}

		// Stockage global temporaire des prix pour réutilisation
		window._fibPrice1 = value1;
		window._fibPrice2 = value2;
		drawFibonacciColoredLine(value1, value2, data);
	};


	// Bouton pour effacer toutes les lignes Fibonacci et zones colorées
	document.getElementById('btnClearFibo').onclick = () => {
		clearFibonacci();
	};


	// Stocke cbbiMap global dès chargement du graphique principal
	window.cbbiMap = {};
	data.forEach(d => window.cbbiMap[d.time] = d.value);                                            // CBBI MAP 
 



}


// 1.4 :
// ===================================================================================================================================
//                                // Redimensionnement automatique du graphique à la taille du container

window.addEventListener('resize', () => {
	if (cbbiChart) {                                                                               // ici chart en cbbiChart 
		cbbiChart.resize(document.getElementById('chartCBBI').clientWidth, 500);                       // ici chart en cbbiChart 
	}
});


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------              







// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------   

// cbbi-fibo-line.js
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                              2 : ( 2.1 , 2.2 )
//                                              // GESTION DES FIBO DU CBBI :


// ===================================================================================================================================
//                                2.1 :
//                                // Dessine les lignes Fibonacci + trace les segments colorés sur les zones selon les valeurs données
// ===================================================================================================================================
//                                2.2 :
//                                // Efface toutes les lignes Fibonacci et séries colorées du graphique
// ===================================================================================================================================



// 2.1 :
// ===================================================================================================================================
//                                // Dessine les lignes Fibonacci + trace les segments colorés sur les zones selon les valeurs données

function drawFibonacciColoredLine(price1, price2, data) {
  clearFibonacci();

  const levels = [0, 0.146, 0.236, 0.382, 0.5, 0.618, 0.786, 0.854, 0.90, 1];
  const maxPrice = Math.max(price1, price2);
  const minPrice = Math.min(price1, price2);

  levels.forEach(level => {
    const fibPrice = maxPrice - (maxPrice - minPrice) * (1 - level);

    const line = cbbiBaseSeries.createPriceLine({
      price: fibPrice,
      color: 'rgba(255,0,0,0.7)',
      lineWidth: 1,
      lineStyle: LightweightCharts.LineStyle.Solid,
      axisLabelVisible: true,
      title: `Fib ${(level * 100).toFixed(1)}%`,
    });

    cbbiFibLines.push(line);
  });

  const fibPrices = levels.map(level => maxPrice - (maxPrice - minPrice) * (1 - level));

  function findZone(value) {
    for (let i = 0; i < fibPrices.length - 1; i++) {
      const high = Math.max(fibPrices[i], fibPrices[i + 1]);
      const low = Math.min(fibPrices[i], fibPrices[i + 1]);
      if (value >= low && value <= high) return i;
    }
    return fibPrices.length - 2;
  }

  let segments = [];
  let currentZone = findZone(data[0].value);
  let currentSegment = [data[0]];

  for (let i = 1; i < data.length; i++) {
    const zone = findZone(data[i].value);

    if (zone === currentZone) {
      currentSegment.push(data[i]);
    } else {
      const last = currentSegment[currentSegment.length - 1];
      const next = data[i];

      // Ajout du point de transition (valeur du jour suivant)
      if (next) currentSegment.push({ time: next.time, value: next.value });

      segments.push({
        zone: currentZone,
        points: currentSegment,
        startTime: currentSegment[0].time,
        endTime: currentSegment[currentSegment.length - 1].time
      });

      currentZone = zone;
      currentSegment = [next];
    }
  }

  // Dernier segment
  if (currentSegment.length) {
    const last = currentSegment[currentSegment.length - 1];
    const next = data.find(d => d.time > last.time);
    if (next) currentSegment.push({ time: next.time, value: next.value });

    segments.push({
      zone: currentZone,
      points: currentSegment,
      startTime: currentSegment[0].time,
      endTime: currentSegment[currentSegment.length - 1].time
    });
  }

  window.cbbiSegments = segments;

  cbbiColoredSeries.forEach(s => cbbiChart.removeSeries(s));
  cbbiColoredSeries = [];

  	console.log(`Zone Fibo CBBI créés : ${segments.length}`);

  segments.forEach(({ zone, points }) => {
    const rgbaColor = zoneColors[zone] ? zoneColors[zone].color : 'rgba(0,0,0,0.4)';

    const series = cbbiChart.addLineSeries({
      color: rgbaColor,
      lineWidth: 3,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    series.setData(points);
    cbbiColoredSeries.push(series);
  });


}


// 2.2 :
// ===================================================================================================================================
//                                // Efface toutes les lignes Fibonacci et séries colorées du graphique

function clearFibonacci() {

	cbbiFibLines.forEach(line => cbbiBaseSeries.removePriceLine(line));    // Supprime chaque ligne de prix de la série principale (les lignes rouges)   // ici fiblines en cbbiFiblines    // ici baseSeries en cbbiBaseSeries
	cbbiFibLines = [];    // Réinitialise le tableau                                                                                                     // ici fiblines en cbbiFiblines 
	
	cbbiColoredSeries.forEach(series => cbbiChart.removeSeries(series));   // Supprime chaque série colorée du graphique                                 // ici chart en cbbiChart    // ici coloredSeries en cbbiColoredSeries
	cbbiColoredSeries = [];    // Réinitialise le tableau                                                                                                // ici coloredSeries en cbbiColoredSeries

}



// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------   




