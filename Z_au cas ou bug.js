// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------     

// cbbi-chart-fibo

// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                              1 : ( 1.1 , 1.2 , 1.3 , 1.4 )

// ===================================================================================================================================
//                                1.1 :
//                                CBBI-FIBONACCI.JS - Gestion du graphique CBBI et zones Fibonacci colorées
// ===================================================================================================================================
//                                1.2 :
//                                Initialisation du graphique CBBI au chargement
// ===================================================================================================================================
//                                1.3 :
//                                Fonction principale : Récupérer les données CBBI et dessiner le graphique initial
// ===================================================================================================================================
//                                1.4 :
//                                Redimensionnement automatique du graphique à la taille du container
// ===================================================================================================================================



// 1.1 :
// ===================================================================================================================================
//                                CBBI-FIBONACCI.JS - Gestion du graphique CBBI et zones Fibonacci colorées

// Variables globales du graphique, séries et lignes Fibonacci
let chart;

let fibLines = [];
let coloredSeries = [];

let baseSeries;

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
//                                Initialisation du graphique CBBI au chargement

fetchAndDrawChart();




// 1.3 :
// ===================================================================================================================================
//                                Fonction principale : Récupérer les données CBBI et dessiner le graphique initial

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
	chart = LightweightCharts.createChart(document.getElementById("chart"), {
		width: document.getElementById("chart").clientWidth,
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
	baseSeries = chart.addLineSeries({
		color: 'blue',
		lineWidth: 2
	});
	baseSeries.setData(data);
	chart.timeScale().fitContent();

    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------                

	// Initialisation des contrôles de couleur pour les zones                                                          // SURPIMER EN RAPPORT AVEC 3.1 
	setupColorControls();                                                                                              //inutile  

    // -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------                



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
}



// 1.4 :
// ===================================================================================================================================
//                                Redimensionnement automatique du graphique à la taille du container

window.addEventListener('resize', () => {
	if (chart) {
		chart.resize(document.getElementById('chart').clientWidth, 500);
	}
});

// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------                







// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------     


// cbbi-fibo-line.js


// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                              2 : ( 2.1 , 2.2 )


// ===================================================================================================================================
//                                2.1 :
//                                Dessine les lignes Fibonacci + trace les segments colorés sur les zones selon les valeurs données
// ===================================================================================================================================
//                                2.2 :
//                                Efface toutes les lignes Fibonacci et séries colorées du graphique
// ===================================================================================================================================



// 2.1 :
// ===================================================================================================================================
//                                Dessine les lignes Fibonacci + trace les segments colorés sur les zones selon les valeurs données


function drawFibonacciColoredLine(price1, price2, data) {

	
	clearFibonacci();    // Efface tout ce qui a déjà été tracé précédemment (lignes et segments)

	const levels = [0, 0.146, 0.236, 0.382, 0.5, 0.618, 0.786, 0.854, 0.90, 1];    // Niveaux standards de Fibonacci (entre 0 et 1)


	const maxPrice = Math.max(price1, price2);    // Détermine le prix le plus ( haut )  entre les deux points donnés
	const minPrice = Math.min(price1, price2);    // Détermine le prix le plus ( bas  )  entre les deux points donnés


	// Pour chaque niveau, calcule le prix correspondant et trace une ligne rouge horizontale	
	levels.forEach(level => {                                                       
		const fibPrice = maxPrice - (maxPrice - minPrice) * (1 - level);

		const line = baseSeries.createPriceLine({
			price: fibPrice,
			color: 'rgba(255,0,0,0.7)',
			lineWidth: 1,
			lineStyle: LightweightCharts.LineStyle.Solid,
			axisLabelVisible: true,
			title: `Fib ${(level*100).toFixed(1)}%`,    // Affiche le pourcentage (ex: "Fib 61.8%")
		});


		fibLines.push(line);    // Stocke chaque ligne dans fibLines pour pouvoir les supprimer ensuite
	});

	const fibPrices = levels.map(level => maxPrice - (maxPrice - minPrice) * (1 - level));    // Prépare la liste des niveaux de prix des zones Fibonacci, dans le même ordre


	// Fonction utilitaire pour trouver dans quelle zone Fibonacci se trouve une valeur donnée	
	function findZone(value) {
		for (let i = 0; i < fibPrices.length - 1; i++) {
			const high = Math.max(fibPrices[i], fibPrices[i + 1]);
			const low = Math.min(fibPrices[i], fibPrices[i + 1]);

			if (value >= low && value <= high) return i;    // Retourne l'index de la zone si la valeur est comprise entre deux niveaux
		}

		return fibPrices.length - 2;    // Si aucune zone ne correspond, retourner la dernière possible
	}

	let segments = [];    // Préparation du découpage des données en segments par zone

	// Début du premier segment
	let currentZone = findZone(data[0].value);
	let currentSegment = [data[0]];

	// Boucle sur toutes les valeurs pour créer les segments par zone	
	for (let i = 1; i < data.length; i++) {
		const zone = findZone(data[i].value);

		// Si la valeur appartient à la même zone, on continue le segment
		if (zone === currentZone) {
			currentSegment.push(data[i]);
		} else {
			// Si la zone change, on clôt le segment précédent et on en commence un nouveau	
			segments.push({
				zone: currentZone,
				points: currentSegment,
				startTime: currentSegment[0].time,
				endTime: currentSegment[currentSegment.length - 1].time
			});

			currentZone = zone;
			currentSegment = [data[i]];
		}
	}

	// Ajoute le dernier segment s’il en reste un
	if (currentSegment.length) {
		segments.push({
			zone: currentZone,
			points: currentSegment,
			startTime: currentSegment[0].time,
			endTime: currentSegment[currentSegment.length - 1].time
		});
	}


	window.cbbiSegments = segments;    // Sauvegarde globale des segments pour d'autres traitements (ex: recoloration)


	// Supprime les anciennes séries colorées du graphique	
	coloredSeries.forEach(s => chart.removeSeries(s));
	coloredSeries = [];

	// Trace une nouvelle série pour chaque segment avec la couleur associée à sa zone
	segments.forEach(({ zone, points }) => {
		const rgbaColor = zoneColors[zone] ? zoneColors[zone].color : 'rgba(0,0,0,0.4)';

		const series = chart.addLineSeries({
			color: rgbaColor,
			lineWidth: 3,
			priceLineVisible: false,
			lastValueVisible: false,
		});

		series.setData(points);
		coloredSeries.push(series);
	});
}



// 2.2 :
// ===================================================================================================================================
//                                Efface toutes les lignes Fibonacci et séries colorées du graphique

function clearFibonacci() {

	fibLines.forEach(line => baseSeries.removePriceLine(line));    // Supprime chaque ligne de prix de la série principale (les lignes rouges)
	fibLines = [];    // Réinitialise le tableau
	
	coloredSeries.forEach(series => chart.removeSeries(series));   // Supprime chaque série colorée du graphique
	coloredSeries = [];    // Réinitialise le tableau

}



// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------                






























// -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------                


// cbbi-controls.js             SUPRESION DE CE BLOCK utiliser uniquement dans BLOC 1.3 // Initialisation des contrôles de couleur pour les zones  ( setupColorControls(); )


// --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                              3 : ( 3.1 ; 3.2 )

// ===================================================================================================================================
//                                3.1 :
//                                Configuration des contrôles utilisateur pour modifier les couleurs et opacités des zones
//
//
//
//                              SUPRESION DE CE BLOCK + 	// Initialisation des contrôles de couleur pour les zones  ( setupColorControls(); ) DU BLOC 1.3
//                              ( gerer les changement de couleur manuellment par lutilisateur )
//
//
//
// ===================================================================================================================================
//                                3.2 :
//                                Redessine les segments colorés selon les couleurs et opacités modifiées par l’utilisateur
//
//
//                              SUPRESION DE CE BLOCK  car utilisation uniquement dans ( 3.1 : Configuration des contrôles utilisateur pour modifier les couleurs et opacités des zones ) 
//                              ( gerer les changement de couleur manuellment par lutilisateur )
//
//
//
// ===================================================================================================================================



// 3.1 :
// ===================================================================================================================================
//                                Configuration des contrôles utilisateur pour modifier les couleurs et opacités des zones


function setupColorControls() {                                                                                        //inutile 
	const container = document.getElementById('colorControls');                                                       
	if (!container) return; // Arrête la fonction si l'élément HTML 'colorControls' n'existe pas                       

	container.innerHTML = ''; // Vide le conteneur pour éviter les doublons à chaque appel                            

	zoneColors.forEach((zone, index) => {
		const label = document.createElement('label');
		label.style.flexDirection = 'row'; // Mise en page horizontale


		// Crée un texte descriptif pour la zone (ex : "Zone 1 :")

		const text = document.createElement('span');                                                                   
		text.textContent = `Zone ${index + 1} : `;                                                                     
		label.appendChild(text);


		// Crée un input type color pour choisir la couleur

		const colorInput = document.createElement('input');                                                            
		colorInput.type = 'color';
		colorInput.value = rgbaToHex(zone.color); // Convertit la couleur RGBA vers HEX
		colorInput.dataset.zoneIndex = index;     // Stocke l'index de zone dans un attribut data                               
		label.appendChild(colorInput);

		// Affiche l’opacité actuelle en texte
		const opacityLabel = document.createElement('span');                                                          
		opacityLabel.className = 'opacity-label';
		opacityLabel.textContent = (zone.alpha).toFixed(2); // Format texte : "0.65"                                           
		label.appendChild(opacityLabel);

		// Crée un slider pour modifier l’opacité
		const opacityInput = document.createElement('input');                                                          
		opacityInput.type = 'range';
		opacityInput.min = 0;
		opacityInput.max = 1;                                                                                                      
		opacityInput.step = 0.05;
		opacityInput.value = zone.alpha;
		opacityInput.dataset.zoneIndex = index;
		label.appendChild(opacityInput);

		container.appendChild(label);                                                                                                                                                            

		// Quand on change la couleur dans le color picker                                                           
		colorInput.oninput = e => {
			const idx = Number(e.target.dataset.zoneIndex);
			const alpha = zoneColors[idx].alpha;                                                                                     
			const hex = e.target.value;
			// Met à jour la couleur RGBA dans la zone concernée
			zoneColors[idx].color = hexToRgba(hex, alpha);
			if (coloredSeries.length > 0) {
				// Redessine les segments colorés si déjà affichés
				redrawColoredSeries();
			}
		};

		// Quand on change l’opacité via le slider
		opacityInput.oninput = e => {                                                                              
			const idx = Number(e.target.dataset.zoneIndex);
			const alpha = Number(e.target.value);                                                                               
			zoneColors[idx].alpha = alpha;
			// Reconstruit la couleur RGBA avec la nouvelle opacité
			const hex = rgbaToHex(zoneColors[idx].color);
			zoneColors[idx].color = hexToRgba(hex, alpha);
			// Met à jour le texte d’opacité visible
			opacityLabel.textContent = alpha.toFixed(2);
			if (coloredSeries.length > 0) {
				// Redessine les segments colorés
				redrawColoredSeries();
			}
		};
	});
}


// 3.2 :
// ===================================================================================================================================
//                                Redessine les segments colorés selon les couleurs et opacités modifiées par l’utilisateur

function redrawColoredSeries() {
	if (!baseSeries) return;
	const baseData = baseSeries.data(); // Récupère les données de la série principale
	if (!baseData || baseData.length === 0) return;
	if (typeof window._fibPrice1 === 'undefined' || typeof window._fibPrice2 === 'undefined') return;

	const price1 = window._fibPrice1;
	const price2 = window._fibPrice2;

	// Supprime toutes les anciennes séries colorées du graphique
	coloredSeries.forEach(s => chart.removeSeries(s));
	coloredSeries = [];

	// Liste des niveaux Fibonacci utilisés pour découper les segments
	const levels = [0, 0.146, 0.236, 0.382, 0.5, 0.618, 0.786, 0.854, 0.90, 1];
	const maxPrice = Math.max(price1, price2);
	const minPrice = Math.min(price1, price2);

	// Calcule les prix correspondant aux niveaux Fibonacci
	const fibPrices = levels.map(level => maxPrice - (maxPrice - minPrice) * (1 - level));

	// Fonction locale pour identifier à quelle zone appartient un prix
	function findZone(value) {
		for (let i = 0; i < fibPrices.length - 1; i++) {
			const high = Math.max(fibPrices[i], fibPrices[i + 1]);
			const low = Math.min(fibPrices[i], fibPrices[i + 1]);
			if (value >= low && value <= high) return i;
		}
		return fibPrices.length - 2; // Défaut : dernière zone
	}

	// Regroupe les données (baseData) en segments selon leur zone
	let segments = [];
	let currentZone = findZone(baseData[0].value);
	let currentSegment = [baseData[0]];

	for (let i = 1; i < baseData.length; i++) {
		const zone = findZone(baseData[i].value);
		if (zone === currentZone) {
			currentSegment.push(baseData[i]);
		} else {
			segments.push({ zone: currentZone, points: currentSegment });
			currentZone = zone;
			currentSegment = [baseData[i]];
		}
	}

	// N'ajoute que si le dernier segment contient des points
	if (currentSegment.length) {
		segments.push({ zone: currentZone, points: currentSegment });
	}

	// Dessine chaque segment avec sa couleur et opacité associée
	segments.forEach(({ zone, points }) => {
		const rgbaColor = zoneColors[zone] ? zoneColors[zone].color : 'rgba(0,0,0,0.4)';
		const series = chart.addLineSeries({
			color: rgbaColor,
			lineWidth: 3,
			priceLineVisible: false,
			lastValueVisible: false,
		});
		series.setData(points);
		coloredSeries.push(series);
	});
}


// ===================================================================================================================================
//                                5.1 : color-utils.js
//                                Fonctions utilitaires de conversion entre rgba et hex
//
//
//
//                               SURPRIMER CAR UTILISER UNIQUEMENT PAR BLOCK 3 cbbi-controls.js  
//
// ===================================================================================================================================

function rgbaToHex(rgba) {
	const result = rgba.match(/rgba?\((\d+), ?(\d+), ?(\d+)(?:, ?([\d.]+))?\)/);
	if (!result) return "#000000";
	let r = parseInt(result[1]).toString(16).padStart(2, "0");
	let g = parseInt(result[2]).toString(16).padStart(2, "0");
	let b = parseInt(result[3]).toString(16).padStart(2, "0");
	return `#${r}${g}${b}`;
}

function hexToRgba(hex, alpha = 1) {
	let r = parseInt(hex.slice(1, 3), 16);
	let g = parseInt(hex.slice(3, 5), 16);
	let b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r},${g},${b},${alpha})`;
}

