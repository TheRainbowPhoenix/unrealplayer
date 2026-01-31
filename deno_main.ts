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

// Check for args
let urlInput = Deno.args[0];

if (!urlInput) {
    console.log("Please provide a URL or a file path containing the URL.");
    Deno.exit(0);
}

// Try to read as file
try {
    const fileInfo = await Deno.stat(urlInput);
    if (fileInfo.isFile) {
        console.log(`Reading URL from file: ${urlInput}`);
        urlInput = await Deno.readTextFile(urlInput);
        // Clean up whitespace just in case
        urlInput = urlInput.trim();
    }
} catch (e) {
    // Not a file, ignore
}

console.log("Parsing URL...");
try {
    const parser = new Parser();
    const renderer = new Renderer();

    const songs = parser.parse(urlInput);
    if (songs.length === 0) throw new Error("No songs found");

    console.log(`Found ${songs.length} songs:`);

    songs.forEach((s, i) => {
        console.log(`\n--- Song ${i + 1} ---`);
        console.log(`Title: ${s.title}`);
        console.log(`Composer: ${s.composer}`);
        console.log(`Raw Unscrambled Music: ${s.musicString}`);
    });

    if (songs.length > 0) {
        const songToRender = songs[0];
        console.log(`\nRendering first song "${songToRender.title}" to output.svg...`);
        const svg = renderer.render(songToRender);
        const outPath = "output.svg";
        await Deno.writeTextFile(outPath, svg);
        console.log(`Successfully generated SVG at ${outPath}`);
    }

} catch (e) {
    console.error("Error during processing:", e);
}
