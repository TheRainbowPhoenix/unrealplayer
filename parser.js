/**
 * iReal Pro Parser and SVG Renderer
 * 
 * Separated into Parser and Renderer classes.
 */

(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.iRealPro = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    // ==========================================
    // PARSER
    // ==========================================
    class Parser {
        constructor() {
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

            const components = dataString.split("=");

            const song = {
                title: components[0] || "Unknown",
                composer: components[1] || "Unknown",
                style: components[2] || "Medium Swing",
                key: components[3] || "C",
                n: components[4] || "",
                progressionRaw: components.slice(5).join("=")
            };

            song.systems = this.parseProgression(song.progressionRaw);
            return song;
        }

        parseProgression(raw) {
            const systems = [];
            let currentSystem = { cells: [], annotations: [] };

            let i = 0;
            const len = raw.length;

            while (i < len) {
                const char = raw[i];

                // --- Vertical Space 'Y' ---
                if (char === 'Y') {
                    if (currentSystem.cells.length > 0 || currentSystem.annotations.length > 0) {
                        systems.push(currentSystem);
                    } else {
                        // Only push spacer if it's explicitly purely empty or we want to track spacers?
                        // User code previous logic:
                        systems.push({ cells: [], annotations: [], isSpacer: true });
                    }
                    currentSystem = { cells: [], annotations: [] };
                    i++;
                    continue;
                }

                // --- WRAPPING LOGIC ---
                const isCellEntry = (char !== ' ' && !"|[]{ZTY*N<,sl".includes(char)) || char === ' ';

                if (currentSystem.cells.length >= 16 && isCellEntry && char !== ',') {
                    systems.push(currentSystem);
                    currentSystem = { cells: [], annotations: [] };
                }

                // --- ANNOTATIONS ---

                // Time Signature T44
                if (char === 'T' && i + 2 < len && /\d/.test(raw[i + 1]) && /\d/.test(raw[i + 2])) {
                    currentSystem.annotations.push({ type: 'timeSig', value: raw.substring(i + 1, i + 3), index: currentSystem.cells.length });
                    i += 3; continue;
                }

                // Rehearsal Marks *A
                if (char === '*' && i + 1 < len) {
                    currentSystem.annotations.push({ type: 'rehearsal', value: raw[i + 1], index: currentSystem.cells.length });
                    i += 2; continue;
                }

                // Endings N1
                if (char === 'N' && i + 1 < len) {
                    currentSystem.annotations.push({ type: 'ending', value: raw[i + 1], index: currentSystem.cells.length });
                    i += 2; continue;
                }

                // Staff Text <...>
                if (char === '<') {
                    let endInfo = raw.indexOf('>', i);
                    if (endInfo !== -1) {
                        currentSystem.annotations.push({ type: 'text', value: raw.substring(i + 1, endInfo), index: currentSystem.cells.length });
                        i = endInfo + 1; continue;
                    }
                }

                // Bar Lines | [ ] { } Z
                if ("|[]{Z".indexOf(char) !== -1) {
                    let type = 'single';
                    if (char === '[') type = 'double-start';
                    if (char === ']') type = 'double-end';
                    if (char === '{') type = 'repeat-start';
                    if (char === '}') type = 'repeat-end';
                    if (char === 'Z') type = 'final';

                    currentSystem.annotations.push({ type: 'barline', style: type, index: currentSystem.cells.length });
                    i++; continue;
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
                if (char === ',') { i++; continue; }

                // --- CELL CONTENT ---
                if (char === ' ') {
                    currentSystem.cells.push({ type: 'space', content: '' });
                    i++;
                } else {
                    // Tokenizer for Chord or Symbol
                    let token = "";
                    let startI = i;
                    // Read until delimiter
                    while (i < len) {
                        const c = raw[i];
                        if (" []{}ZYT*N<,sl".includes(c)) {
                            if (c === 'T' && i + 2 < len && /\d/.test(raw[i + 1])) break;
                            if (c === 'N' && i + 1 < len && /\d/.test(raw[i + 1])) break;
                            if (c === 's' && token === "") break;
                            if (c === 'l' && token === "") break;
                            if (" []{}ZY<,*".includes(c)) break;
                        }
                        token += c;
                        i++;
                    }

                    if (token.length > 0) {
                        if (token === '}') {
                            // Ignore stray brace to fix artifacts
                        } else if (token === 'n') {
                            currentSystem.cells.push({ type: 'nc', content: 'N.C.' });
                        } else if (token === 'x') {
                            currentSystem.cells.push({ type: 'repeat-1', content: '%' });
                        } else if (token === 'r') {
                            currentSystem.cells.push({ type: 'repeat-2', content: '%%' });
                        } else {
                            currentSystem.cells.push({ type: 'chord', content: token });
                        }
                    } else {
                        if (i === startI) {
                            // Should not happen if logic is correct, but just in case
                            currentSystem.cells.push({ type: 'chord', content: raw[i] });
                            i++;
                        }
                    }
                }
            }
            if (currentSystem.cells.length > 0 || currentSystem.annotations.length > 0) {
                systems.push(currentSystem);
            }
            return systems;
        }
    }

    // ==========================================
    // RENDERER
    // ==========================================
    class Renderer {
        constructor() {
            this.config = {
                padding: 40,
                // Layout: 4 Measures per line. Each measure is 220px. Total 880.
                systemWidth: 880,
                systemHeight: 140,
                systemSpacing: 60,
                measureWidth: 220,
                cellWidth: 55,
                colors: { bg: "#FDF6E3", ink: "#000000" }
            };
        }

        render(song) {
            const { padding, systemWidth, systemHeight, systemSpacing, measureWidth, cellWidth, colors } = this.config;
            const totalWidth = systemWidth + (padding * 2);

            let contentH = 100;
            song.systems.forEach(s => contentH += (s.isSpacer ? 50 : systemHeight + systemSpacing));
            const totalHeight = contentH + padding;

            let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" style="background-color: ${colors.bg}; font-family: 'Arial', sans-serif;">
                <defs>
                   <style>
                        .title { font-size: 28px; font-weight: bold; text-anchor: middle; fill: ${colors.ink}; }
                        .composer { font-size: 18px; text-anchor: end; fill: ${colors.ink}; }
                        .style { font-size: 18px; text-anchor: start; fill: ${colors.ink}; }
                        .chord-root { font-size: 32px; font-weight: bold; fill: ${colors.ink}; letter-spacing: -1px; }
                        .chord-suffix { font-size: 18px; font-weight: bold; fill: ${colors.ink}; }
                        .chord-bass { font-size: 22px; font-weight: bold; fill: ${colors.ink}; }
                        .nc { font-size: 24px; font-weight: bold; fill: ${colors.ink}; }
                        .time-sig { font-size: 24px; font-weight: bold; text-anchor: middle; letter-spacing: -2px; }
                   </style>
                </defs>
                <g class="header" transform="translate(0, 45)">
                    <text x="${totalWidth / 2}" class="title">${song.title}</text>
                    <text x="${totalWidth - padding}" class="composer">${song.composer}</text>
                    <text x="${padding}" class="style">${song.style}</text>
                </g>
                <g transform="translate(${padding}, 80)">
            `;

            let currentY = 0;

            song.systems.forEach((sys) => {
                if (sys.isSpacer) {
                    currentY += 50;
                    return;
                }

                // System Group
                svg += `<g class="system" transform="translate(0, ${currentY})">`;

                // Render 4 Measures
                for (let m = 0; m < 4; m++) {
                    const measureX = m * measureWidth;
                    // Measure Group
                    svg += `<g class="measure" transform="translate(${measureX}, 0)">`;

                    // Render 4 Cells inside this measure
                    for (let c = 0; c < 4; c++) {
                        const cellAbsIndex = (m * 4) + c;
                        const cellX = c * cellWidth;

                        // Cell Group
                        svg += `<g class="cell" transform="translate(${cellX}, 0)">`;

                        // Annotations
                        const annos = sys.annotations.filter(a => a.index === cellAbsIndex);
                        svg += this.renderAnnotations(annos, cellWidth, systemHeight);

                        // Content
                        if (sys.cells[cellAbsIndex]) {
                            svg += this.renderCellContent(sys.cells[cellAbsIndex], cellWidth, systemHeight);
                        }

                        svg += `</g>`; // end cell
                    }
                    svg += `</g>`; // end measure
                }

                // Final Barline (Index 16) - Attach to End of Measure 3
                const finalAnnos = sys.annotations.filter(a => a.index >= 16);
                if (finalAnnos.length > 0) {
                    svg += `<g class="end-bar" transform="translate(${4 * measureWidth}, 0)">`;
                    svg += this.renderAnnotations(finalAnnos, cellWidth, systemHeight);
                    svg += `</g>`;
                }

                svg += `</g>`;
                currentY += systemHeight + systemSpacing;
            });

            svg += `</g></svg>`;
            return svg;
        }

        renderAnnotations(annos, w, h) {
            let s = "";
            const chordY = (h / 2) + 15;

            annos.forEach(a => {
                if (a.type === 'barline') s += this.svgBarline(a.style, h);
                if (a.type === 'timeSig') {
                    s += `<text x="15" y="${chordY - 15}" class="time-sig">${a.value[0]}</text>`;
                    s += `<text x="15" y="${chordY + 15}" class="time-sig">${a.value[1]}</text>`;
                }
                if (a.type === 'rehearsal') {
                    s += `<rect x="-3" y="-28" width="24" height="24" fill="black"/>`;
                    s += `<text x="9" y="-11" fill="white" font-weight="bold" font-size="18" text-anchor="middle">${a.value}</text>`;
                }
                if (a.type === 'ending') {
                    // Span approx 4 cells
                    const span = w * 4;
                    s += `<polyline points="0,15 0,0 ${span},0" fill="none" stroke="black" stroke-width="2"/>`;
                    s += `<text x="5" y="12" font-size="12" font-weight="bold">${a.value}.</text>`;
                }
                if (a.type === 'text') {
                    s += `<text x="0" y="-5" font-size="14" fill="#555">${a.value}</text>`;
                }
            });
            return s;
        }

        renderCellContent(cell, w, h) {
            const chordY = (h / 2) + 15;
            const textX = 5;
            const centerX = w / 2;

            if (cell.type === 'chord') {
                return this.renderChord(cell.content, textX, chordY);
            } else if (cell.type === 'nc') {
                return `<text x="${textX}" y="${chordY}" class="nc">N.C.</text>`;
            } else if (cell.type === 'repeat-1') {
                return `<text x="${centerX}" y="${chordY}" style="font-size: 28px; font-weight: bold; text-anchor: middle;">𝄎</text>`;
            } else if (cell.type === 'repeat-2') {
                return `<text x="${centerX}" y="${chordY}" style="font-size: 28px; font-weight: bold; text-anchor: middle;">𝄎</text>`;
            }
            return "";
        }

        svgBarline(style, h) {
            const thin = 2;
            const thick = 6;
            let s = "";
            const l = (x, w) => `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="black" stroke-width="${w}" stroke-linecap="butt"/>`;

            switch (style) {
                case 'single': s = l(0, thin); break;
                // Double Start: Thick then Thin at 0
                case 'double-start': s = l(0, thick) + l(6, thin); break;
                // Double End: Thin then Thick relative to 0 (which is right edge usually)
                case 'double-end': s = l(-6, thin) + l(0, thick); break;
                case 'final': s = l(-6, thin) + l(0, thick); break;

                case 'repeat-start':
                    s = l(0, thick) + l(6, thin);
                    s += `<circle cx="14" cy="${h / 2 - 10}" r="3" fill="black"/>`;
                    s += `<circle cx="14" cy="${h / 2 + 10}" r="3" fill="black"/>`;
                    break;
                case 'repeat-end':
                    s = l(-6, thin) + l(0, thick);
                    s += `<circle cx="-14" cy="${h / 2 - 10}" r="3" fill="black"/>`;
                    s += `<circle cx="-14" cy="${h / 2 + 10}" r="3" fill="black"/>`;
                    break;
            }
            return s;
        }

        renderChord(chordStr, x, y) {
            if (chordStr === '}') return "";

            let main = chordStr;
            let alt = null;
            if (main.includes('(')) {
                const parts = main.split('(');
                main = parts[0];
                alt = parts[1].replace(')', '');
            }

            const parts = this.parseChordParts(main);

            let s = `<text x="${x}" y="${y}">`;
            s += `<tspan class="chord-root">${this.prettify(parts.root)}</tspan>`;

            let currentDy = 0;
            if (parts.quality) {
                const dy = -15;
                s += `<tspan class="chord-suffix" dy="${dy}">${this.prettify(parts.quality)}</tspan>`;
                currentDy += dy;
            }

            if (parts.bass) {
                const targetY = 0;
                const delta = targetY - currentDy;
                s += `<tspan class="chord-bass" dy="${delta}">/${this.prettify(parts.bass)}</tspan>`;
            }
            s += `</text>`;

            if (alt) {
                const altParts = this.parseChordParts(alt);
                const altText = this.prettify(altParts.root) + this.prettify(altParts.quality) + (altParts.bass ? '/' + this.prettify(altParts.bass) : '');
                s += `<text x="${x}" y="${y - 35}" style="font-size: 14px; fill: #666; font-weight: bold;">${altText}</text>`;
            }
            return s;
        }

        parseChordParts(chord) {
            const match = chord.match(/^([A-G][b#]?)(.*)/);
            if (!match) return { root: chord, quality: '', bass: '' };
            let [_, root, rest] = match;
            let bass = '';
            if (rest.includes('/')) {
                const split = rest.split('/');
                bass = split[1];
                rest = split[0];
            }
            return { root, quality: rest, bass };
        }

        prettify(str) {
            if (!str) return "";
            return str.replace(/b/g, '♭').replace(/#/g, '♯').replace(/-/g, '-').replace(/h/g, 'ø').replace(/o/g, '°').replace(/\^/g, 'Δ');
        }
    }

    return { Parser, Renderer };
}));
