document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('urlInput');
    const btn = document.getElementById('generateBtn');
    const output = document.getElementById('output');
    const errorMsg = document.getElementById('errorMsg');

    // Default example from user request for convenience
    const exampleUrl = "irealbook://A%20Walkin%20Thing%3DCarter%20Benny%3DMedium%20Swing%3DD-%3Dn%3D%7B*AT44D-%20D-/C%20%7CBh7%2C%20Bb7(A7b9)%20%7CD-/A%20G-7%20%7CD-/F%20sEh%2CA7%2C%7CY%7ClD-%20D-/C%20%7CBh7%2C%20Bb7(A7b9)%20%7CD-/A%20G-7%20%7CN1D-/F%20sEh%2CA7%7D%20%20%20%20%20%20%20%20%20%20%20%20Y%7CN2sD-%2CG-%2ClD-%20%5D%5B*BC-7%20F7%20%7CBb%5E7%20%7CC-7%20F7%20%7CBb%5E7%20n%20%7C%7CC-7%20F7%20%7CBb%5E7%20%7CB-7%20E7%20%7CA7%2Cp%2Cp%2Cp%2C%5D%5B*AD-%20D-/C%20%7CBh7%2C%20Bb7(A7b9)%20%7CD-/A%20G-7%20%7CD-/F%20sEh%2CA7%2C%7C%7ClD-%20D-/C%20%7CBh7%2C%20Bb7(A7b9)%20%7CD-/A%20G-7%20%7CD-/F%20sEh%2CA7Z";

    input.value = exampleUrl;

    btn.addEventListener('click', () => {
        const url = input.value.trim();
        errorMsg.textContent = "";
        output.innerHTML = "";

        if (!url) {
            errorMsg.textContent = "Please enter a valid URL.";
            return;
        }

        try {
            // Instantiate the parser (from parser.js global scope)
            if (typeof iRealRenderer === 'undefined') {
                throw new Error("Parser library not loaded correctly.");
            }

            const renderer = new iRealRenderer();
            console.log("Parsing...");

            const songData = renderer.parse(url);
            console.log("Parsed Data:", songData);

            const svgString = renderer.renderSVG(songData);

            output.innerHTML = svgString;

        } catch (e) {
            console.error(e);
            errorMsg.textContent = "Error parsing URL: " + e.message;
        }
    });

    // Auto-click for instant preview
    btn.click();
});
