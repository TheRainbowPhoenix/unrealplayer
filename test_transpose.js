const fs = require('fs');
const path = require('path');
const { Parser, Renderer, Transposer } = require('./parser');

const raw = "Blues - Jazz=Exercise=Medium Up Swing=n=F=[T44F7   |Bb7   |F7   |C-7 F7 |Bb7   |Bo7   |F7   |A-7 D7 |G-7   |C7   |F7 D7 |G-7 C7 Z ";

const parser = new Parser();
const songs = parser.parse(raw);
const song = songs[0];
console.log(`Original Key: ${song.key}`);
console.log("Original Chords (first 4 measures):");
printChords(song);

console.log("\nTransposing to C...");
const transposedSong = Transposer.transpose(song, "C");

console.log(`New Key: ${transposedSong.key}`);
console.log("Transposed Chords:");
printChords(transposedSong);

console.log("\nTransposing to Gb...");
const transposedGb = Transposer.transpose(song, "Gb");
console.log(`New Key: ${transposedGb.key}`);
printChords(transposedGb);

function printChords(s) {
    let output = "";
    s.measures.slice(0, 12).forEach((m, i) => {
        const chords = m.events.filter(e => e.type === 'chord').map(e => e.content).join(", ");
        output += `| ${chords} `;
        if ((i + 1) % 4 === 0) output += "|\n";
    });
    console.log(output);
}
