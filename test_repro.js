
const { Parser, Renderer } = require('./parser.js');

// "A Walkin Thing" full unscrambled string provided by user logic (or extracted)
const rawMusic = "{*AT44D- D-/C |Bh7, Bb7(A7b9) |D-/A G-7 |D-/F sEh,A7,|Y|lD- D-/C |Bh7, Bb7(A7b9) |D-/A G-7 |N1D-/F sEh,A7} Y|N2sD-,G-,lD- ][*BC-7 F7 |Bb^7 |C-7 F7 |Bb^7 n ||C-7 F7 |Bb^7 |B-7 E7 |A7,p,p,p,][*AD- D-/C |Bh7, Bb7(A7b9) |D-/A G-7 |D-/F sEh,A7,||lD- D-/C |Bh7, Bb7(A7b9) |D-/A G-7 |D-/F sEh,A7Z";

const parser = new Parser();
console.log("Parsing Complex Song...");
const measures = parser.parseProgression(rawMusic);

console.log("Measures found:", measures.length);
// measures.forEach((m, i) => { ... });

const renderer = new Renderer();
const song = { title: "A Walkin Thing", composer: "Benny Carter", style: "Medium Swing", key: "D-", measures: measures };
const svg = renderer.render(song);
console.log("SVG generated length:", svg.length);
require('fs').writeFileSync('output_walkin.svg', svg);
