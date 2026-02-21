

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------  

// indicator-main/Btc/Cross/line-verticale.js
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                              2 : ( 2.1 , 2.2 , 2.3 )
//                                              // GESTION DES LINE VERTICAL HALVING DU : BTC :

// ===================================================================================================================================
//                                2.1 :
//                                // Ajoute ou supprime les lignes verticales des croisements alternatifs sur le graphique BTC
// ===================================================================================================================================
//                                2.2 :
//                                // Ecouteur bouton clic
// ===================================================================================================================================
//                                2.3 :
//                                // Données croisements alternatifs intégrées
// ===================================================================================================================================





//  2.1 :
// ===================================================================================================================================
//                                // Ajoute ou supprime les lignes verticales des croisements alternatifs sur le graphique BTC

let altCrossingLines = [];
let altCrossingsVisible = false;

function toggleAltCrossingLines(chart, currentScale) {
	if (altCrossingsVisible) {
		altCrossingLines.forEach(line => chart.removeSeries(line));
		altCrossingLines = [];
		altCrossingsVisible = false;
		return;
	}

	let minPrice = currentScale === 'log' ? -100 : -100;
	let maxPrice = currentScale === 'log' ? 100 : 1e6;

	const now = Math.floor(Date.now() / 1000); // date actuelle en secondes

	altCbbiCrossings.forEach(cross => {
		const timeInSeconds = Math.floor(new Date(cross.date).getTime() / 1000);
		const isFuture = timeInSeconds > now;

		const lineSeries = chart.addLineSeries({
			color: isFuture ? 'rgba(0, 204, 255, 0.7)' : 'rgba(255, 0, 0, 0.7)', // 🔵 futur / 🔴 passé
			lineWidth: 0.8,
			priceLineVisible: false,
			lastValueVisible: false,
			crossHairMarkerVisible: false,
			autoscaleInfoProvider: () => null,
		});

		lineSeries.setData([
			{ time: timeInSeconds, value: minPrice },
			{ time: timeInSeconds, value: maxPrice },
		]);

		altCrossingLines.push(lineSeries);
	});

	altCrossingsVisible = true;
}



// 2.2 :
// ===================================================================================================================================
//                                // Ecouteur bouton clic (paramétrable par ID)

// Stockage global pour tous les graphiques
window.chartInstances = {}; // clé = divId, valeur = chart

// Fonction d'initialisation d'un bouton toggle
function initToggleAltBtn(toggleAltBtnId, chartDivId) {
    const btn = document.getElementById(toggleAltBtnId);
    if (!btn) return;

    btn.addEventListener('click', () => {
        const chart = window.chartInstances[chartDivId]; // on récupère le graphique correspondant
        if (!chart) {
            console.warn(`Graphique ${chartDivId} non trouvé.`);
            return;
        }
        toggleAltCrossingLines(chart, window.currentScale);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const toggleBtns = [
		{ btnId: "toggleAltBtn1", chartDivId: "chartBTC1" },
        { btnId: "toggleAltBtn2", chartDivId: "chartBTC2" },
        { btnId: "toggleAltBtn3", chartDivId: "chartBTC3" },
        { btnId: "toggleAltBtn4", chartDivId: "chartBTC4" }
    ];

    toggleBtns.forEach(b => {
        initToggleAltBtn(b.btnId, b.chartDivId);
    });
});

//  .3 :
// ===================================================================================================================================
//                                // Données croisements alternatifs intégrées

const altCbbiCrossings = [
  { date: "2012-11-28" },
  { date: "2016-07-09" },
  { date: "2020-05-11" },
  { date: "2024-04-19" },
  { date: "2028-04-19" },
  { date: "2032-04-19" },
];
