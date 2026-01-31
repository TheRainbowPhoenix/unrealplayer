
const { Parser, Renderer } = require('./parser.js');

const rawMusic = "[T44F7   |Bb7   |F7   |C-7 F7 |Bb7   |Bo7   |F7   |A-7 D7 |G-7   |C7   |F7 D7 |G-7 C7 Z ";
// const rawMusic = "{*AT44D- D-/C |Bh7, Bb7(A7b9) |D-/A G-7 |D-/F sEh,A7,|Y|lD- D-/C |Bh7, Bb7(A7b9) |D-/A G-7 |N1D-/F sEh,A7} Y|N2sD-,G-,lD- ][*BC-7 F7 |Bb^7 |C-7 F7 |Bb^7 n ||C-7 F7 |Bb^7 |B-7 E7 |A7,p,p,p,][*AD- D-/C |Bh7, Bb7(A7b9) |D-/A G-7 |D-/F sEh,A7,||lD- D-/C |Bh7, Bb7(A7b9) |D-/A G-7 |D-/F sEh,A7Z";

const parser = new Parser();
// const unscrambled = parser.unscramble(rawMusic);

// Let's try parsing
console.log("Parsing...");
const measures = parser.parseProgression(rawMusic);

console.log("Measures found:", measures.length);
measures.forEach((m, i) => {
    if (m.type === 'break') {
        console.log(`Measure ${i}: System Break (Y)`);
    } else {
        console.log(`Measure ${i}: Start '${m.start}', End '${m.end}', Events: ${m.events.length}`);
        m.events.forEach(e => console.log(`  - ${e.type}: ${e.content || e.value || ''}`));
    }
});

// Try render
const renderer = new Renderer();
const song = { title: "Test", composer: "Me", style: "Swing", key: "C", measures: measures };
const svg = renderer.render(song);
console.log("SVG generated length:", svg.length);
require('fs').writeFileSync('output_test.svg', svg);
