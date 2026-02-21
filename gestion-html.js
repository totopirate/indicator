// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------  
// indicator-main/Btc/gestion-html.js
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//                                              1 : ( 1.1 , 1.2 , 1.3 , 1.4 )
//                                              // GESTION DES FOOTERS ET SECTIONS CHARTS BTC / CBBI / CFGI / RSI :
// ===================================================================================================================================
//                                1.1 :
//                                // Fonction toggleSection pour afficher/masquer une ou plusieurs sections
// ===================================================================================================================================
//                                1.2 :
//                                // gestion des bouton pour cacher les footer de DATA 1,2,3,4
// ===================================================================================================================================





// 1.1 :
// ===================================================================================================================================
//                                // Fonction toggleSection pour afficher/masquer une ou plusieurs sections

document.addEventListener("DOMContentLoaded", () => {


    function toggleSection(sectionIds, button, showText, hideText) {

        // Si on reçoit un seul ID sous forme de string → on le transforme en tableau
        if (!Array.isArray(sectionIds)) {
            sectionIds = [sectionIds];
        }

        // Récupère uniquement les sections existantes dans le DOM
        const sections = sectionIds
            .map(id => document.getElementById(id))
            .filter(el => el !== null);

        if (sections.length === 0) return;

        const isHidden = sections[0].dataset.hidden === "true";

        sections.forEach(section => {

            if (isHidden) {
                // ✅ AFFICHER la section
                section.style.visibility = "visible";
                section.style.height = "";
                section.style.overflow = "";
                section.dataset.hidden = "false";
            } else {
                // ✅ MASQUER la section
                section.style.visibility = "hidden";
                section.style.height = "0";
                section.style.overflow = "hidden";
                section.dataset.hidden = "true";
            }

        });

        // Mise à jour du texte du bouton
        button.textContent = isHidden ? hideText : showText;

        // ✅ Resize sécurisé après repaint complet (utile pour charts)
        if (isHidden) {
            requestAnimationFrame(() => {
                window.dispatchEvent(new Event("resize"));
            });
        }
    }




// 1.2 :
// ===================================================================================================================================
//                                // gestion des bouton pour cacher les footer de DATA 1,2,3,4

    const btnMode1 = document.getElementById("btnToggleMode1Data");
    if (btnMode1) {
        btnMode1.onclick = () => {
            toggleSection(
                "section-btc",
                btnMode2,
                "Afficher DATA 1 ( BTC Chart )",
                "Masquer DATA 1 ( BTC Chart )"
            );
        };
    }


    const btnMode2 = document.getElementById("btnToggleMode2Data");
    if (btnMode2) {
        btnMode2.onclick = () => {
            toggleSection(
                ["section-cbbi", "explication-cbbi"],
                btnMode1,
                "Afficher DATA 2 ( CBBI Chart )",
                "Masquer DATA 2 ( CBBI Chart )"
            );
        };
    }


    const btnMode3 = document.getElementById("btnToggleMode3Data");
    if (btnMode3) {
        btnMode3.onclick = () => {
            toggleSection(
                ["section-cfgi", "explication-cfgi"],
                btnMode3,
                "Afficher DATA 3 ( CFGI Chart )",
                "Masquer DATA 3 ( CFGI Chart )"
            );
        };
    }


    const btnMode4 = document.getElementById("btnToggleMode4Data");
    if (btnMode4) {
        btnMode4.onclick = () => {
            toggleSection(
                ["section-rsi", "explication-rsi"],
                btnMode4,
                "Afficher DATA 4 ( RSI Chart )",
                "Masquer DATA 4 ( RSI Chart )"
            );
        };
    }

});
