
// deno_main.ts

// This imports the parser.js file. 
// Since parser.js is a UMD that assigns to `self` or `this`, 
// importing it should execute the factory and assign iRealRenderer to global scope.
import "./parser.js";

// Access the global class
const ParserClass = (self as any).iRealRenderer;

if (!ParserClass) {
    console.error("Error: iRealRenderer class not found in global scope after import.");
    Deno.exit(1);
}

// Example URL from the user request
const DEFAULT_URL = "irealbook://A%20Walkin%20Thing%3DCarter%20Benny%3DMedium%20Swing%3DD-%3Dn%3D%7B*AT44D-%20D-/C%20%7CBh7%2C%20Bb7(A7b9)%20%7CD-/A%20G-7%20%7CD-/F%20sEh%2CA7%2C%7CY%7ClD-%20D-/C%20%7CBh7%2C%20Bb7(A7b9)%20%7CD-/A%20G-7%20%7CN1D-/F%20sEh%2CA7%7D%20%20%20%20%20%20%20%20%20%20%20%20Y%7CN2sD-%2CG-%2ClD-%20%5D%5B*BC-7%20F7%20%7CBb%5E7%20%7CC-7%20F7%20%7CBb%5E7%20n%20%7C%7CC-7%20F7%20%7CBb%5E7%20%7CB-7%20E7%20%7CA7%2Cp%2Cp%2Cp%2C%5D%5B*AD-%20D-/C%20%7CBh7%2C%20Bb7(A7b9)%20%7CD-/A%20G-7%20%7CD-/F%20sEh%2CA7%2C%7C%7ClD-%20D-/C%20%7CBh7%2C%20Bb7(A7b9)%20%7CD-/A%20G-7%20%7CD-/F%20sEh%2CA7Z";

// Check for args
const url = Deno.args[0] || DEFAULT_URL;

console.log("Parsing URL...");
try {
    const renderer = new ParserClass();
    const songData = renderer.parse(url);

    console.log(`Song Title: ${songData.title}`);
    console.log(`Composer: ${songData.composer}`);

    const svg = renderer.renderSVG(songData);

    const outPath = "output.svg";
    await Deno.writeTextFile(outPath, svg);

    console.log(`Successfully generated SVG at ${outPath}`);

} catch (e) {
    console.error("Error during processing:", e);
}
