const { Parser, Renderer, Transposer } = require('./parser');

const rawString = "Blues - Jazz=Exercise=Medium Up Swing=n=F=[T44F7   |Bb7   |F7   |C-7 F7 |Bb7   |Bo7   |F7   |A-7 D7 |G-7   |C7   |F7 D7 |G-7 C7 Z ";


// Parse a song
const parser = new Parser();
const songs = parser.parse(rawString);
const originalSong = songs[0];

// Transpose to a new key (e.g., "Gb")
const transposedSong = Transposer.transpose(originalSong, "Gb");

// Render the new song
const renderer = new Renderer();
const svg = renderer.render(transposedSong);
require('fs').writeFileSync('output_transposed.svg', svg);