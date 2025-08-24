const { exec } = require('child_process');

function runScript(command) {
  return new Promise((resolve, reject) => {
    const process = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erreur dans ${command} :`, error.message);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Stderr dans ${command} :`, stderr);
      }
      console.log(`Résultat de ${command} :\n${stdout}`);
      resolve();
    });
  });
}

async function runBoth() {
  try {
    await runScript('node Btc/Fibo-zones/cbbi-zone-detector.js');
    await runScript('node Btc/Fibo-zones/cbbi-zone-detector-cycle.js');    
    console.log('Les trois scripts ont été exécutés avec succès.');
  } catch (e) {
    console.error('Erreur lors de l’exécution des scripts.');
  }
}

runBoth();
