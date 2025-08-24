

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------    

// cbbi-color-cycle-btc.js
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                              4 : ( 4.1 , 4.2 , 4.3 , 4.4 , 4.5 , 4.6 )
//                                              // GESTION COLORATION DU : BTC EN MODE FIBO 2 (mode cycle) :

// ===================================================================================================================================
//                                4.1 :
//                                // Initialise window.cbbiMap
// ===================================================================================================================================
//                                4.2 :
//                                // Couleurs directionnelles des zones (remplace zoneColors3)
// ===================================================================================================================================
//                                4.3 :
//                                // Affichage overlay CBBI coloré sur BTC
// ===================================================================================================================================
//                                4.4 :
//                                // Resize handler si besoin
// ===================================================================================================================================
//                                4.5 :
//                                // Toggle affichage CBBI sur BTC
// ===================================================================================================================================
//                                4.6 :
//                                // Mise à jour si on change l’échelle (arithmétique / log)
// ===================================================================================================================================





// 4.1 :
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


// 4.2 :
// ===================================================================================================================================
//                                // Couleurs directionnelles des zones (remplace zoneColors3)

const zonebtcColorsCycle4 = [ 
  { min: 0.45, max: 14.6, colorUp: 'rgba(216, 176, 240, 0.9)', colorDown: 'rgba(216, 176, 240, 0.91)' },
  { min: 14.6, max: 85.40, colorUp: 'rgba(100, 220, 100, 0.9)', colorDown: 'rgb(180, 26, 15)' },
  { min: 85.40, max: 100, colorUp: 'rgba(0, 0, 0, 0.9)', colorDown: 'rgba(0, 0, 0, 0.91)' },
];

function getColorForZoneCycle({ min, max, direction }) {
  const zone = zonebtcColorsCycle4.find(z => !(max <= z.min || min >= z.max));
  if (!zone) return 'rgba(120, 120, 120, 0.7)';
  if (direction === 'up') return zone.colorUp;
  if (direction === 'down') return zone.colorDown;
  return 'rgba(120, 120, 120, 0.7)';
}


// 4.3 :
// ===================================================================================================================================
//                                // Affichage overlay CBBI coloré sur BTC

let cbbiColoredSeriesonBtc4  = [];        
let isCBBIVisibleOnBTC4 = false;        

function drawCBBIColorOverlayOnBTCcycle() {
  if (!window.chartInstance || !window.cbbiMap) {
    console.log("Pas de chartInstance ou cbbiMap, sortie.");
    return;
  }

  cbbiColoredSeriesonBtc4.forEach(s => window.chartInstance.removeSeries(s));
  cbbiColoredSeriesonBtc4 = [];

  const btcData = window.currentScale === 'log' ? window.btcPriceDataLog : window.btcPriceDataArith;
  if (!btcData) {
    console.log("Pas de données BTC selon l'échelle", window.currentScale);
    return;
  }

  // Correction des niveaux fibonnaci pour matcher les plages de couleurs
  const fibLevels = [0, 0.45, 14.6, 85.40, 100]; 

  const findZone = cbbiValue => {
    for (let i = 0; i < fibLevels.length - 1; i++) {
      const low = fibLevels[i];
      const high = fibLevels[i + 1];
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

  btcData.forEach(pt => {
    const dateStr = new Date(pt.time * 1000).toISOString().split("T")[0];
    const cbbiVal = getClosestCBBIDate(dateStr);
    pt.cbbiValue = cbbiVal;
    pt.zone = (typeof cbbiVal !== 'undefined') ? findZone(cbbiVal) : null;
  });

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
      currentSegment.push(pt);
      segments.push({ zone: currentZone, points: [...currentSegment] });
      currentSegment = [pt];
      currentZone = pt.zone;
    }
  }

  if (currentSegment.length > 1) {
    segments.push({ zone: currentZone, points: [...currentSegment] });
  }

  console.log(`Segments Mode 2 créés : ${segments.length}`);

  let previousCbbiValue = null;
  segments.forEach(({ zone, points }) => {
    const avgCbbiValue = points.reduce((sum, pt) => sum + pt.cbbiValue, 0) / points.length;
    const direction = previousCbbiValue === null ? null : (avgCbbiValue > previousCbbiValue ? 'up' : 'down');

    const min = fibLevels[zone];
    const max = fibLevels[zone + 1];

    const color = getColorForZoneCycle({ min, max, direction });

    previousCbbiValue = avgCbbiValue;

    const series = window.chartInstance.addLineSeries({
      color,
      lineWidth: 3,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    series.setData(points);
    cbbiColoredSeriesonBtc4.push(series);
  });
}


// 4.4 :
// ===================================================================================================================================
//                                // Resize handler si besoin

window.addEventListener('resize', () => {
  if (window.chartInstance) {
    window.chartInstance.resize(document.getElementById('chartBTC').clientWidth, 500);
  }
});


// 4.5 :
// ===================================================================================================================================
//                                // Toggle affichage CBBI sur BTC (Bouton)

document.getElementById('toggleCBBIonBTC4').onclick = () => {  
  isCBBIVisibleOnBTC4 = !isCBBIVisibleOnBTC4;
  if (isCBBIVisibleOnBTC4) {
    drawCBBIColorOverlayOnBTCcycle();
    document.getElementById('toggleCBBIonBTC4').textContent = "Masquer mode 2 ( Zone-Fibo-Cycle-Cbbi )";
  } else {
    cbbiColoredSeriesonBtc4.forEach(s => window.chartInstance.removeSeries(s));
    cbbiColoredSeriesonBtc4 = [];
    document.getElementById('toggleCBBIonBTC4').textContent = "Afficher mode 2 ( Zone-Fibo-Cycle-Cbbi )";
  }
};


// 4.6 :
// ===================================================================================================================================
//                                // Mise à jour si on change l’échelle (arithmétique / log)

document.getElementById('scaleSelector').addEventListener('change', e => {
  window.currentScale = e.target.value;
  updateBTCChartData(
    window.chartInstance.getSeries()[0],
    window.chartInstance,
    window.btcPriceDataArith,
    window.btcPriceDataLog,
    window.currentScale
  );

  if (isCBBIVisibleOnBTC4) {
    drawCBBIColorOverlayOnBTCcycle();
  }
});

window.addEventListener('resize', () => {
  if (window.chartInstance) {
    window.chartInstance.resize(document.getElementById('btcChart').clientWidth, 600);
  }
});
