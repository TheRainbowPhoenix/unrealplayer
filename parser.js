/**
 * iReal Pro Parser and SVG Generator
 * 
 * Handles parsing of 'irealbook://' and 'irealb://' URL schemes.
 * Generates an SVG representation of the chord chart.
 */

// Universal module definition
(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.iRealRenderer = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    class IRealRenderer {
        constructor() {
            this.song = null;
        }

        parse(url) {
            let decoded = decodeURIComponent(url);
            let dataString = "";
            if (decoded.startsWith("irealbook://")) {
                dataString = decoded.replace("irealbook://", "");
            } else if (decoded.startsWith("irealb://")) {
                dataString = decoded.replace("irealb://", "");
            } else {
                dataString = decoded;
            }

            // Split into components
            // 1=Title 2=Composer 3=Style 4=Key 5=n 6=ChordProgression
            const components = dataString.split("=");

            this.song = {
                title: components[0] || "Unknown",
                composer: components[1] || "Unknown",
                style: components[2] || "Medium Swing",
                key: components[3] || "C",
                n: components[4] || "",
                progressionRaw: components.slice(5).join("=")
            };

            this.song.systems = this.parseProgression(this.song.progressionRaw);
            return this.song;
        }

        parseProgression(raw) {
            const systems = [];
            let currentSystem = { cells: [], annotations: [] };
            let rawCells = []; // Temporary holder for cell content

            // Tokenizing the raw string
            // We need to identify tokens: 
            // - Bar lines: | [ ] { } Z
            // - Time signatures: T\d\d
            // - Rehearsal marks: *[A-Z] *i *v
            // - Endings: N\d
            // - Staff text: <...>
            // - Vertical space: Y
            // - Measure repeats: x, r
            // - Small/Large: s, l (these affect rendering width/font size of chords)
            // - Chords: Everything else, or space
            // - No chord: n / p (p is pause/slash usually?)

            // Regex for tokens
            // The logic: iterate through string.
            // Some tokens are multi-char (T44, *A, <...>, N1).
            // Others are single char.

            let i = 0;
            const len = raw.length;

            while (i < len) {
                const char = raw[i];

                // Vertical Space 'Y'
                if (char === 'Y') {
                    if (currentSystem.cells.length > 0 || currentSystem.annotations.length > 0) {
                        systems.push(currentSystem);
                        currentSystem = { cells: [], annotations: [] };
                    } else {
                        systems.push({ cells: [], annotations: [], isSpacer: true });
                    }
                    i++;
                    continue;
                }

                // Time Signature T44
                if (char === 'T' && i + 2 < len && /\d/.test(raw[i + 1]) && /\d/.test(raw[i + 2])) {
                    currentSystem.annotations.push({
                        type: 'timeSig',
                        value: raw.substring(i + 1, i + 3),
                        index: currentSystem.cells.length
                    });
                    i += 3;
                    continue;
                }

                // Rehearsal Marks *A
                if (char === '*' && i + 1 < len) {
                    currentSystem.annotations.push({
                        type: 'rehearsal',
                        value: raw[i + 1],
                        index: currentSystem.cells.length
                    });
                    i += 2;
                    continue;
                }

                // Endings N1
                if (char === 'N' && i + 1 < len) {
                    // Check if next char is digit, if not, treat as normal char? 
                    // Usually N is ending. 
                    // But if 'No Chord' is 'n', then N is okay.
                    // If it's just 'N' chord? No, 'N' is not a valid root.
                    currentSystem.annotations.push({
                        type: 'ending',
                        value: raw[i + 1],
                        index: currentSystem.cells.length
                    });
                    i += 2;
                    continue;
                }

                // Staff Text <...>
                if (char === '<') {
                    let endInfo = raw.indexOf('>', i);
                    if (endInfo !== -1) {
                        const content = raw.substring(i + 1, endInfo);
                        currentSystem.annotations.push({
                            type: 'text',
                            value: content,
                            index: currentSystem.cells.length
                        });
                        i = endInfo + 1;
                        continue;
                    }
                }

                // Bar Lines
                if ("|[]{Z".indexOf(char) !== -1) {
                    let type = 'single';
                    if (char === '[') type = 'double-start';
                    if (char === ']') type = 'double-end';
                    if (char === '{') type = 'repeat-start';
                    if (char === '}') type = 'repeat-end';
                    if (char === 'Z') type = 'final';

                    currentSystem.annotations.push({
                        type: 'barline',
                        style: type,
                        index: currentSystem.cells.length
                    });
                    i++;
                    continue;
                }

                // Formatting
                if (char === 's') {
                    currentSystem.annotations.push({ type: 'format', value: 'small', index: currentSystem.cells.length });
                    i++; continue;
                }
                if (char === 'l') {
                    currentSystem.annotations.push({ type: 'format', value: 'normal', index: currentSystem.cells.length });
                    i++; continue;
                }

                // Separator
                if (char === ',') {
                    i++;
                    continue;
                }

                // Space
                if (char === ' ') {
                    currentSystem.cells.push({ type: 'space', content: '' });
                    i++;
                } else {
                    // Tokenizer for Chord or Symbol
                    let token = "";
                    let startI = i;
                    while (i < len) {
                        const c = raw[i];
                        // Break on reserved chars
                        if (" []{}ZYT*N<,sl".indexOf(c) !== -1) {
                            if (c === 'T' && i + 2 < len && /\d/.test(raw[i + 1])) break;
                            if (c === 'N' && i + 1 < len && /\d/.test(raw[i + 1])) break;
                            if (c === 's' && token === "") break;
                            if (c === 'l' && token === "") break;

                            // Hard breaks
                            if (" []{}ZY<,*".indexOf(c) !== -1) break;
                        }
                        token += c;
                        i++;
                    }

                    if (token.length > 0) {
                        if (token === 'n') {
                            currentSystem.cells.push({ type: 'nc', content: 'N.C.' });
                        } else if (token === 'x') {
                            currentSystem.cells.push({ type: 'repeat-1', content: '%' });
                        } else if (token === 'r') {
                            currentSystem.cells.push({ type: 'repeat-2', content: '%%' });
                        } else {
                            currentSystem.cells.push({ type: 'chord', content: token });
                        }
                    } else {
                        // Fallback: If loop ran but token empty (immediate break), meaning i wasn't progressed inside loop?
                        // Wait. If immediate break, i == startI.
                        if (i === startI) {
                            // Force progress to avoid infinite loop
                            // Treat char as chord content
                            currentSystem.cells.push({ type: 'chord', content: raw[i] });
                            i++;
                        }
                    }
                }

                if (currentSystem.cells.length >= 16) {
                    systems.push(currentSystem);
                    currentSystem = { cells: [], annotations: [] };
                }
            }

            if (currentSystem.cells.length > 0 || currentSystem.annotations.length > 0) {
                systems.push(currentSystem);
            }

            return systems;
        }

        renderSVG(songData) {
            const cellWidth = 50;
            const systemHeight = 120;
            const systemMargin = 40;
            const startX = 60;
            const startY = 80;

            // Layout calculations
            let currentY = startY;

            // Helper to get total height first
            let totalH = startY + 100;
            songData.systems.forEach(s => {
                totalH += (s.isSpacer ? 40 : systemHeight + systemMargin);
            });
            const width = startX + (16 * cellWidth) + 60;

            let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${totalH}" viewBox="0 0 ${width} ${totalH}" style="background: #FDF6E3;">
                <style>
                    text { font-family: 'Arial', sans-serif; }
                    .title { font-size: 24px; font-weight: bold; text-anchor: middle; }
                    .composer { font-size: 16px; text-anchor: end; }
                    .style { font-size: 16px; text-anchor: start; }
                    .chord { font-size: 24px; font-weight: bold; }
                    .alt-chord { font-size: 12px; fill: #555; }
                </style>
                <text x="${width / 2}" y="40" class="title">${songData.title}</text>
                <text x="${width - 30}" y="40" class="composer">${songData.composer}</text>
                <text x="30" y="40" class="style">(${songData.style})</text>
            `;

            songData.systems.forEach(sys => {
                if (sys.isSpacer) {
                    currentY += 40;
                    return;
                }

                // Draw cells 0..15
                for (let i = 0; i < 16; i++) {
                    const cx = startX + (i * cellWidth);
                    const cy = currentY + 60;

                    // Annotations
                    const annos = sys.annotations.filter(a => a.index === i);
                    annos.forEach(a => {
                        if (a.type === 'barline') {
                            svg += this.getBarLineSVG(a.style, cx, currentY, systemHeight);
                        }
                        if (a.type === 'timeSig') {
                            svg += `<text x="${cx + 5}" y="${currentY + 40}" font-size="16" font-weight="bold">${a.value[0]}</text>`;
                            svg += `<text x="${cx + 5}" y="${currentY + 60}" font-size="16" font-weight="bold">${a.value[1]}</text>`;
                        }
                        if (a.type === 'rehearsal') {
                            svg += `<rect x="${cx}" y="${currentY - 20}" width="20" height="20" fill="black"/>`;
                            svg += `<text x="${cx + 10}" y="${currentY - 5}" fill="white" text-anchor="middle" font-weight="bold" font-size="14">${a.value}</text>`;
                        }
                        if (a.type === 'ending') {
                            svg += `<polyline points="${cx},${currentY + 10} ${cx},${currentY} ${cx + cellWidth * 4},${currentY}" fill="none" stroke="black" stroke-width="2"/>`;
                            svg += `<text x="${cx + 5}" y="${currentY + 15}" font-size="12">${a.value}.</text>`;
                        }
                        if (a.type === 'text') {
                            svg += `<text x="${cx}" y="${currentY - 10}" font-size="12" fill="#666">${a.value}</text>`;
                        }
                    });

                    // Cell content
                    if (sys.cells[i]) {
                        const cell = sys.cells[i];
                        if (cell.type === 'chord') {
                            let main = cell.content;
                            let alt = "";
                            if (main.includes('(')) {
                                const parts = main.split('(');
                                main = parts[0];
                                alt = parts[1].replace(')', '');
                            }
                            svg += `<text x="${cx + 5}" y="${cy}" class="chord">${this.formatChord(main)}</text>`;
                            if (alt) {
                                svg += `<text x="${cx + 5}" y="${cy - 25}" class="alt-chord">${this.formatChord(alt)}</text>`;
                            }
                        } else if (cell.type === 'nc') {
                            svg += `<text x="${cx + 5}" y="${cy}" class="chord" font-size="18">N.C.</text>`;
                        } else if (cell.type === 'repeat-1') {
                            svg += `<text x="${cx + 10}" y="${cy}" class="chord" fill="#444">%</text>`;
                        }
                    }
                }

                // Final annotations (index >= 16)
                sys.annotations.filter(a => a.index >= 16).forEach(a => {
                    const cx = startX + (16 * cellWidth);
                    if (a.type === 'barline') {
                        svg += this.getBarLineSVG(a.style, cx, currentY, systemHeight);
                    }
                });

                currentY += systemHeight + systemMargin;
            });

            svg += `</svg>`;
            return svg;
        }

        getBarLineSVG(style, x, y, h) {
            const bottom = y + h;
            // Stroke widths (simulated)
            const thin = 2;
            const thick = 5;
            let s = "";

            switch (style) {
                case 'single':
                    s = `<line x1="${x}" y1="${y}" x2="${x}" y2="${bottom}" stroke="black" stroke-width="${thin}"/>`;
                    break;
                case 'double-start': // [
                    s = `<line x1="${x}" y1="${y}" x2="${x}" y2="${bottom}" stroke="black" stroke-width="${thick}"/>`;
                    s += `<line x1="${x + 5}" y1="${y}" x2="${x + 5}" y2="${bottom}" stroke="black" stroke-width="${thin}"/>`;
                    break;
                case 'double-end': // ]
                    s = `<line x1="${x}" y1="${y}" x2="${x}" y2="${bottom}" stroke="black" stroke-width="${thin}"/>`;
                    s += `<line x1="${x + 5}" y1="${y}" x2="${x + 5}" y2="${bottom}" stroke="black" stroke-width="${thick}"/>`;
                    break;
                case 'final': // Z
                    s = `<line x1="${x}" y1="${y}" x2="${x}" y2="${bottom}" stroke="black" stroke-width="${thin}"/>`;
                    s += `<line x1="${x + 5}" y1="${y}" x2="${x + 5}" y2="${bottom}" stroke="black" stroke-width="${thick}"/>`;
                    break;
                case 'repeat-start': // {
                    s = `<line x1="${x}" y1="${y}" x2="${x}" y2="${bottom}" stroke="black" stroke-width="${thick}"/>`;
                    s += `<line x1="${x + 5}" y1="${y}" x2="${x + 5}" y2="${bottom}" stroke="black" stroke-width="${thin}"/>`;
                    s += `<circle cx="${x + 10}" cy="${y + h / 2 - 10}" r="3" fill="black"/>`;
                    s += `<circle cx="${x + 10}" cy="${y + h / 2 + 10}" r="3" fill="black"/>`;
                    break;
                case 'repeat-end': // }
                    s = `<circle cx="${x - 5}" cy="${y + h / 2 - 10}" r="3" fill="black"/>`;
                    s += `<circle cx="${x - 5}" cy="${y + h / 2 + 10}" r="3" fill="black"/>`;
                    s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${bottom}" stroke="black" stroke-width="${thin}"/>`;
                    s += `<line x1="${x + 5}" y1="${y}" x2="${x + 5}" y2="${bottom}" stroke="black" stroke-width="${thick}"/>`;
                    break;
            }
            return s;
        }

        formatChord(str) {
            return str.replace(/b/g, '♭').replace(/#/g, '♯').replace(/-/g, '-');
        }
    }

    return IRealRenderer;
}));
