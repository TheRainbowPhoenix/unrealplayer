
// deno_main.ts

// Since parser.js is UMD/CommonJS compatible, we can import it using createRequire
import { createRequire } from "https://deno.land/std@0.177.0/node/module.ts";
const require = createRequire(import.meta.url);

// Path to parser.js relative to this file
let iRealPro;
try {
    iRealPro = require("./parser.js");
} catch (e) {
    console.error("Could not load parser.js:", e.message);
    Deno.exit(1);
}

const { Parser, Renderer } = iRealPro;

// Example URL from the user request
const DEFAULT_URL = "irealbook://A%20Walkin%20Thing%3DCarter%20Benny%3DMedium%20Swing%3DD-%3Dn%3D%7B*AT44D-%20D-/C%20%7CBh7%2C%20Bb7(A7b9)%20%7CD-/A%20G-7%20%7CD-/F%20sEh%2CA7%2C%7CY%7ClD-%20D-/C%20%7CBh7%2C%20Bb7(A7b9)%20%7CD-/A%20G-7%20%7CN1D-/F%20sEh%2CA7%7D%20%20%20%20%20%20%20%20%20%20%20%20Y%7CN2sD-%2CG-%2ClD-%20%5D%5B*BC-7%20F7%20%7CBb%5E7%20%7CC-7%20F7%20%7CBb%5E7%20n%20%7C%7CC-7%20F7%20%7CBb%5E7%20%7CB-7%20E7%20%7CA7%2Cp%2Cp%2Cp%2C%5D%5B*AD-%20D-/C%20%7CBh7%2C%20Bb7(A7b9)%20%7CD-/A%20G-7%20%7CD-/F%20sEh%2CA7%2C%7C%7ClD-%20D-/C%20%7CBh7%2C%20Bb7(A7b9)%20%7CD-/A%20G-7%20%7CD-/F%20sEh%2CA7Z";

// Check for args
const url = Deno.args[0] || DEFAULT_URL;

console.log("Parsing URL...");
try {
    const parser = new Parser();
    const renderer = new Renderer();

    const songData = parser.parse(url);

    console.log(`Song Title: ${songData.title}`);
    console.log(`Composer: ${songData.composer}`);

    const svg = renderer.render(songData);

    const outPath = "output.svg";
    await Deno.writeTextFile(outPath, svg);

    console.log(`Successfully generated SVG at ${outPath}`);

} catch (e) {
    console.error("Error during processing:", e);
}
