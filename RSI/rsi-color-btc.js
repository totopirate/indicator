// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------    
// indicator-main/Rsi/rsi-color-btc.js
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                              2 : ( 2.1 , 2.2 , 2.3 , 2.4 , 2.5 , 2.6 )
//                                              // GESTION COLORATION RSI DU : BTC
// ===================================================================================================================================
//                                2.1 :
//                                // Couleurs des zones RSI
// ===================================================================================================================================
//                                2.2 :
//                                // Fonction pour déterminer la zone RSI
// ===================================================================================================================================
//                                2,3 :
//                                // Dessine une superposition colorée (RSI) sur le graphique BTC
// ===================================================================================================================================
//                                2.4 :
//                                // Toggle RSI overlay sur BTC (Bouton)
// ===================================================================================================================================
//                                2.5 :
//                                // Quand on change l’échelle du graphique BTC
// ===================================================================================================================================
//                                2.6 :
//                                // Resize handler si besoin
// ===================================================================================================================================




// 2.1 :
// ===================================================================================================================================
//                                // Couleurs des zones RSI

const rsiColors2 = [
    '#ffffff',
    '#811aca',
    '#0000ff',
    '#00bfff',
    '#00ff7f',
    '#ffff00',
    '#ffa500',
    '#ff0000',
    
    '#a3a0a0',
];



// 2.2 :
// ===================================================================================================================================
//                                // Fonction pour déterminer la zone RSI

function findRsiZone2(value) {
    if(value < 20) return 0;
    if(value < 30) return 1;
    if(value < 40) return 2;
    if(value < 50) return 3;
    if(value < 60) return 4;
    if(value < 70) return 5;
    if(value < 80) return 6;
    if(value < 90) return 7;
    return 8;
}




// 2.3 :
// ===================================================================================================================================
//                                // Dessine une superposition colorée (RSI) sur le graphique BTC

let rsiColoredSeriesOnBTC = [];
let isRSIVisibleOnBTC = false;

function drawRSIColorOverlayOnBTC() {
    if (!window.chartInstance || !rsiMonthlyCache) return;

    rsiColoredSeriesOnBTC.forEach(s => window.chartInstance.removeSeries(s));
    rsiColoredSeriesOnBTC = [];

    const btcData = window.currentScale === 'log' ? window.btcPriceDataLog : window.btcPriceDataArith;
    if (!btcData) return;

    // Fonction pour récupérer le RSI le plus proche dans le passé
    const getClosestRSI = (time) => {
        for (let i = rsiMonthlyCache.length - 1; i >= 0; i--) {
            if (rsiMonthlyCache[i].time <= time) return rsiMonthlyCache[i];
        }
        return null;
    };

    btcData.forEach(pt => {
        const rsiPt = getClosestRSI(pt.time);
        pt.rsiValue = rsiPt ? rsiPt.value : null;
        pt.zone = (pt.rsiValue !== null) ? findRsiZone2(pt.rsiValue) : null;
    });

    const segments = [];
    let currentZone = null;
    let currentSegment = [];

    for (let i = 0; i < btcData.length; i++) {
        const pt = btcData[i];
        if (pt.zone === null) {
            if (currentSegment.length > 1) segments.push({ zone: currentZone, points: [...currentSegment] });
            currentSegment = [];
            currentZone = null;
            continue;
        }
        if (currentZone === null || pt.zone === currentZone) {
            currentSegment.push(pt);
            currentZone = pt.zone;
        } else {
            currentSegment.push(pt);
            segments.push({ zone: currentZone, points: [...currentSegment] });
            currentSegment = [pt];
            currentZone = pt.zone;
        }
    }
    if (currentSegment.length > 1) segments.push({ zone: currentZone, points: [...currentSegment] });

    segments.forEach(({ zone, points }) => {
        const color = rsiColors2[zone] || 'rgba(0,0,0,0.4)';
        const series = window.chartInstance.addLineSeries({
            color: color,
            lineWidth: 3,
            priceLineVisible: false,
            lastValueVisible: false,
        });
        series.setData(points);
        rsiColoredSeriesOnBTC.push(series);
    });

    console.log(`RSI segments créés : ${segments.length}`);
}




// 2.4 :
// ===================================================================================================================================
//                                // Toggle RSI overlay sur BTC (Bouton)

// Toggle RSI overlay sur BTC (Bouton)
document.getElementById('toggleRSIonBTC').onclick = () => {
    isRSIVisibleOnBTC = !isRSIVisibleOnBTC;
    if (isRSIVisibleOnBTC) {
        drawRSIColorOverlayOnBTC();
        document.getElementById('toggleRSIonBTC').textContent = "Masquer  mode 4 ( Zone-Rsi-Mensuelle )"; 
    } else {
        rsiColoredSeriesOnBTC.forEach(s => window.chartInstance.removeSeries(s));
        rsiColoredSeriesOnBTC = [];
        document.getElementById('toggleRSIonBTC').textContent = "Afficher  mode 4 ( Zone-Rsi-Mensuelle )"; 
    }
};


// 2.5 :
// ===================================================================================================================================
//                                // Quand on change l’échelle du graphique BTC

document.getElementById('scaleSelector1').addEventListener('change', e => {
    window.currentScale = e.target.value;

    // Mets à jour la série BTC principale
    updateBTCChartData(window.btcLineSeries, window.chartInstance, window.btcPriceDataArith, window.btcPriceDataLog, window.currentScale);

    // Mets à jour l’overlay RSI si actif
    if (isRSIVisibleOnBTC) {
        drawRSIColorOverlayOnBTC();
    }
});



// 2.6 :
// ===================================================================================================================================
//                                // Resize handler si besoin

window.addEventListener('resize', () => {
    if (window.chartInstance) {
        const chartContainer = document.getElementById('chartBTC1'); // ou le div correspondant
        if (chartContainer) {
            window.chartInstance.applyOptions({ width: chartContainer.clientWidth });
        }
    }
});
