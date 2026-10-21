// ---------- RÄTSELDATEN ----------
const N = 17;

// Bäume als [Zeile, Spalte], gezählt ab 0
const BAEUME = [[0, 4], [0, 6], [0, 7], [0, 11], [0, 15], [1, 0], [1, 2], [1, 10], [1, 16], [2, 2], [2, 5], [2, 8], [2, 11], [3, 4], [3, 16], [4, 1], [5, 9], [5, 14], [6, 0], [6, 4],
[6, 6], [6, 12], [6, 16], [7, 4], [7, 6], [7, 8], [7, 10], [8, 2], [8, 7], [8, 11], [8, 14], [9, 15], [9, 16], [10, 2], [10, 5], [10, 10], [10, 11], [11, 13], [12, 1], [12, 3], [12, 6],
[12, 15], [13, 3], [13, 11], [13, 12], [13, 16], [14, 1], [14, 3], [14, 6], [14, 9], [14, 12], [15, 2], [15, 8], [15, 9], [15, 16], [16, 1], [16, 5], [16, 7], [16, 15]];

// Lösung: Zelte, sortiert Zeile für Zeile
const LOESUNG = [[0, 0], [0, 2], [0, 8], [0, 10], [0, 12], [0, 14], [0, 16], [1, 4], [1, 6], [2, 1], [2, 9], [2, 12], [3, 3], [3, 5], [3, 15], [4, 0], [4, 9], [5, 4], [5, 6], [5, 12],
[5, 16], [6, 1], [6, 14], [7, 3], [7, 5], [7, 7], [7, 9], [7, 11], [8, 1], [8, 13], [8, 15], [9, 7], [9, 11], [10, 1], [10, 4], [10, 9], [10, 16], [11, 6], [11, 14], [12, 0], [12, 4],
[12, 11], [12, 16], [13, 2], [13, 6], [13, 9], [13, 13], [14, 0], [14, 4], [14, 16], [15, 10], [15, 12], [16, 0], [16, 2], [16, 4], [16, 6], [16, 8], [16, 14], [16, 16]];

const ZEILEN = [7, 2, 3, 3, 2, 4, 2, 5, 3, 2, 4, 2, 4, 4, 3, 2, 7];
const SPALTEN = [5, 4, 3, 2, 6, 2, 5, 2, 2, 5, 2, 3, 4, 2, 4, 2, 6];

// Die Zelte tragen (Zeile für Zeile gelesen) die Rechenregel:
// "JEDE ZAHL HOCH DREI TEILE DURCH EINUNDSIEBZIG DER REST IST IHRE STELLE"
const ANLEITUNG = [..."JEDEZAHLHOCHDREITEILEDURCHEINUNDSIEBZIGDERRESTISTIHRESTELLE"];

// Der Satz, der am Ende herauskommen soll
const WOERTER = ["WANDERN", "DURCH", "DEN", "HARZ", "MIT", "ÜBERNACHTUNG", "IM", "SCHLOSSHOTEL", "BALLENSTEDT"];
const ZIEL = [...WOERTER.join("")];
const L = ZIEL.length; // 59

// VORRAT kommt aus spielseite.html (alle markierten Buchstaben)

const SPEICHER = "papa-zeltraetsel";

// ---------- HILFSFUNKTIONEN ----------
// rechnet aus Zeile und Spalte eine Nummer von 0 bis 288
const key = (r, c) => r * N + c;
// alle Baum-Nummern, damit man schnell prüfen kann: Steht hier ein Baum?
const baumSet = new Set(BAEUME.map(([r, c]) => key(r, c)));

const buchstabenAufZelt = new Map(LOESUNG.map(([r, c], i) => [key(r, c), ZIEL[i]]));

//--------- ZUSTAND ----------

let feldZustand = new Array(N * N).fill(0);   // 0 = leer, 1 = Zelt, 2 = Wiese
let geloest = false;
let fertig = false;

try {
    const gespeichert = JSON.parse(localStorage.getItem(SPEICHER));
    if (Array.isArray(gespeichert) && gespeichert.length === N * N) {
        feldZustand = gespeichert;
    }
} catch (e) { }


function speichern() {
    try {
        localStorage.setItem(SPEICHER, JSON.stringify(feldZustand));
    } catch (e) { }
}

// ---------- SPIELFELD ----------
const spielFeld = document.getElementById("spielfeld");
const BAUM_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="var(--tanne)" d="M12 2 5 11h3l-4 6h16l-4-6h3z"/><rect x="10.8" y="17" width="2.4" height="5" fill="var(--stamm)"/></svg>';
const ZELT_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="var(--zelt)" d="M12 3 2 21h20z"/><path fill="var(--nacht)" d="M12 11 8.5 21h7z"/></svg>';

const felder = [];
const zeilenZahlen = [];
const spaltenZahlen = [];

spielFeld.appendChild(document.createElement("div"));

for (let i = 0; i < N; i++) {
    const zahl = document.createElement("div");
    zahl.classList.add("zahl");
    zahl.textContent = SPALTEN[i];
    spielFeld.appendChild(zahl);
    spaltenZahlen.push(zahl);
}

for (let r = 0; r < N; r++) {
    const zahl = document.createElement("div");
    zahl.classList.add("zahl");
    zahl.textContent = ZEILEN[r];
    spielFeld.appendChild(zahl);
    zeilenZahlen.push(zahl);
    for (let c = 0; c < N; c++) {
        //erzeugt ein neues Feld
        const feld = document.createElement("button");
        //gibt ihm die Klasse, damit das CSS greift
        feld.classList.add("feld");
        feld.dataset.zeile = r;
        feld.dataset.spalte = c;
        //setzt das Feld auf die Seite
        spielFeld.appendChild(feld);
        felder[key(r, c)] = feld;
        //prüft, ob an der Stelle ein Baum ist und fügt die Klasse "baum" hinzu
        if (baumSet.has(key(r, c))) {
            feld.classList.add("baum");
            feld.innerHTML = BAUM_SVG;
            //bäume nicht klickbar machen
            feld.disabled = true;
        } else {
            feld.addEventListener("click", () => {
                if (geloest) return;
                const k = key(r, c);
                feldZustand[k] = (feldZustand[k] + 1) % 3;
                feldZeichnen(k);
                speichern();
                pruefen();
            });
        }
    }
}

function feldZeichnen(k) {
    const feld = felder[k];
    feld.classList.remove("zelt", "wiese");
    feld.innerHTML = "";
    if (feldZustand[k] === 1) {
        feld.classList.add("zelt");
        feld.innerHTML = ZELT_SVG + `<span class="zeltbuchstabe">` + (buchstabenAufZelt.get(k) || "") + `</span>`;
    } else if (feldZustand[k] === 2) {
        feld.classList.add("wiese");
    }
}

function pruefen() {
    for (let i = 0; i < N; i++) {
        let inZeilen = 0;
        let inSpalten = 0;
        for (let j = 0; j < N; j++) {
            if (feldZustand[key(i, j)] === 1) inZeilen++;
            if (feldZustand[key(j, i)] === 1) inSpalten++;
        }
        zeilenZahlen[i].classList.toggle("passt", inZeilen === ZEILEN[i]);
        zeilenZahlen[i].classList.toggle("zuviel", inZeilen > ZEILEN[i]);
        spaltenZahlen[i].classList.toggle("passt", inSpalten === SPALTEN[i]);
        spaltenZahlen[i].classList.toggle("zuviel", inSpalten > SPALTEN[i]);
    }


    let anzahlZelte = 0;
    for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
            const k = key(r, c);
            if (baumSet.has(k)) continue;
            let konflikt = false;
            if (feldZustand[k] === 1) {
                anzahlZelte++;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const rr = r + dr;
                        const cc = c + dc;
                        if (rr >= 0 && rr < N && cc >= 0 && cc < N && feldZustand[key(rr, cc)] === 1) {
                            konflikt = true;
                        }
                    }
                }
            }

            felder[k].classList.toggle("konflikt", konflikt);
        }
    }

    const richtig = anzahlZelte === LOESUNG.length && LOESUNG.every(([r, c]) => feldZustand[key(r, c)] === 1);
    document.getElementById("status").textContent = richtig ? "Alle Zelte stehen richtig!" : anzahlZelte + " von " + LOESUNG.length + " Zelten gesetzt";

    if (richtig && !geloest) {
        alleZelteRichtig();
    }

}

function alleZelteRichtig() {
    geloest = true;
    spielFeld.classList.add("geloest");

    setTimeout(() => {
        document.getElementById("popup").classList.remove("hidden");
    }, 1500);

    const woerter = document.getElementById("woerter");
    woerter.innerHTML = "";
    WOERTER.forEach(wort => {
        const div = document.createElement("div");
        div.classList.add("wort", "richtig");
        for (const b of wort) {
            const kaestchen = document.createElement("span");
            kaestchen.classList.add("kaestchen");
            kaestchen.textContent = b;
            div.appendChild(kaestchen);
        }
        woerter.appendChild(div);
    });
    document.getElementById("aufloesung").hidden = false;

    setTimeout(() => {
        document.getElementById("popup").classList.remove("hidden");
        const skript = document.createElement("script");
        skript.src = "confetti.js";
        document.body.appendChild(skript);
    }, 2500);

}

// ---------- POPUP SCHLIESSEN ----------
// ---------- POPUP 1 SCHLIESSEN -> KÄSTCHEN ZEIGEN ----------
document.getElementById("popupZu").addEventListener("click", () => {
    document.getElementById("popup").classList.add("hidden");
    eingabeAufbauen();
    document.getElementById("aufloesung").hidden = false;
});

// ---------- BUCHSTABEN EINTRAGEN ----------
function eingabeAufbauen() {
    const woerter = document.getElementById("woerter");
    woerter.innerHTML = "";
    WOERTER.forEach(wort => {
        const div = document.createElement("div");
        div.classList.add("wort");
        for (let i = 0; i < wort.length; i++) {
            const feld = document.createElement("input");
            feld.classList.add("kaestchen");
            feld.maxLength = 1;
            // nach jedem getippten Buchstaben: groß machen, weiterspringen, prüfen
            feld.addEventListener("input", () => {
                feld.value = feld.value.toUpperCase();
                feld.classList.toggle("voll", feld.value !== "");
                if (feld.value !== "") springen(feld, 1);
                woerterPruefen();
            });
            // Rücktaste in einem leeren Feld: ein Feld zurück
            feld.addEventListener("keydown", (e) => {
                if (e.key === "Backspace" && feld.value === "") springen(feld, -1);
            });
            div.appendChild(feld);
        }
        woerter.appendChild(div);
    });
    woerter.querySelector("input").focus();
}

// springt zum nächsten (+1) oder vorherigen (-1) Kästchen
function springen(feld, richtung) {
    const alle = [...document.querySelectorAll("#woerter input")];
    const ziel = alle[alle.indexOf(feld) + richtung];
    if (ziel) ziel.focus();
}

// jedes Wort einzeln prüfen und grün färben
function woerterPruefen() {
    let alleRichtig = true;
    document.querySelectorAll("#woerter .wort").forEach((div, w) => {
        const eingabe = [...div.querySelectorAll("input")].map(f => f.value).join("");
        const richtig = eingabe === WOERTER[w];
        div.classList.toggle("richtig", richtig);
        if (!richtig) alleRichtig = false;
    });
    if (alleRichtig && !fertig) {
        fertig = true;
        document.getElementById("popupGeschenk").classList.remove("hidden");
        const skript = document.createElement("script");
        skript.src = "confetti.js";
        document.body.appendChild(skript);
    }
}

// ---------- POPUP 2 SCHLIESSEN ----------
document.getElementById("geschenkZu").addEventListener("click", () => {
    document.getElementById("popupGeschenk").classList.add("hidden");
});

// ---------- SPIEL NEU STARTEN ----------

document.getElementById("neustart").addEventListener("click", () => {
    document.getElementById("popup").classList.add("hidden");
    feldZustand.fill(0);
    geloest = false;
    spielFeld.classList.remove("geloest");
    document.getElementById("aufloesung").hidden = true;
    for (let k = 0; k < N * N; k++) {
        if (!baumSet.has(k)) {
            feldZeichnen(k);
        }
    }
    speichern();
    pruefen();
});

for (let k = 0; k < N * N; k++) {
    if (!baumSet.has(k)) {
        feldZeichnen(k);
    }
}
pruefen();
