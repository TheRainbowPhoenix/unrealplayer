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
                const currentIndex = currentSystem.cells.length;

                // --- Vertical Space 'Y' ---
                // Y Forces a system break.
                if (char === 'Y') {
                    // Push current system regardless of fullness
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

                // --- HANDLING WRAPPING ---
                // If we are at 16 cells, we are "full".
                // But we don't wrap immediately. We only wrap if the NEXT token requires a cell slot (Chord/Space).
                // Annotations (Bars, TimeSig, Endings) can attach to index 16.

                // We check wrapping inside the specific token handlers below to be safe, 
                // OR we check here if the char implies a new cell.

                const isCellToken = (char === ' ' || !'|[]{ZTY*N<,sl'.includes(char));
                // Note: 's' and 'l' are formats, not cells. 'T','N', etc are annos.
                // Space is a cell.
                // Chords (default) are cells.

                // If we are full (16) AND we are about to add a cell content:
                if (currentSystem.cells.length >= 16 && isCellToken && char !== ',' && char !== 'Y') {
                    // Check specific exclusions for 's','l' which are not cells
                    if (char !== 's' && char !== 'l') {
                        systems.push(currentSystem);
                        currentSystem = { cells: [], annotations: [] };
                    }
                }

                // --- ANNOTATIONS ---

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
                if (char === 'N' && i + 1 < len) { // Assume single digit ending
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

                // --- CELL CONTENT ---

                // Space
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
                        // Safety progress
                        if (i === startI) {
                            // Should not happen if logic is correct, but just in case
                            currentSystem.cells.push({ type: 'chord', content: raw[i] });
                            i++;
                        }
                    }
                }
            }

            // Push final
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
                cellWidth: 55, // 880 total / 16
                systemHeight: 140,
                systemSpacing: 60,
                colors: { bg: "#FDF6E3", ink: "#000000" }
            };
        }

        render(song) {
            const { padding, cellWidth, systemHeight, systemSpacing, colors } = this.config;
            const systemWidth = cellWidth * 16;
            const totalWidth = systemWidth + (padding * 2);

            // Calculate height
            let contentH = 100; // Header
            song.systems.forEach(s => {
                contentH += (s.isSpacer ? 50 : systemHeight + systemSpacing);
            });
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
                
                <!-- HEADER -->
                <g class="header" transform="translate(0, 45)">
                    <text x="${totalWidth / 2}" class="title">${song.title}</text>
                    <text x="${totalWidth - padding}" class="composer">${song.composer}</text>
                    <text x="${padding}" class="style">${song.style}</text>
                </g>
                
                <!-- CONTENT -->
                <g transform="translate(${padding}, 80)">
            `;

            let currentY = 0;

            song.systems.forEach((sys, sysIndex) => {
                if (sys.isSpacer) {
                    currentY += 50;
                    return;
                }

                // Row Group
                svg += `<g class="system" transform="translate(0, ${currentY})">`;

                // 1. Render Cells (0..15)
                for (let i = 0; i < 16; i++) {
                    const cx = i * cellWidth;

                    // Cell Group
                    svg += `<g class="cell" transform="translate(${cx}, 0)">`;

                    // Annotations at index i (Start of cell usually, or attached to left barline)
                    const annos = sys.annotations.filter(a => a.index === i);
                    svg += this.renderAnnotations(annos, cellWidth, systemHeight);

                    // Content
                    if (sys.cells[i]) {
                        svg += this.renderCellContent(sys.cells[i], cellWidth, systemHeight);
                    }

                    svg += `</g>`; // End cell
                }

                // 2. Render Final Barline (index 16)
                // We put this in a "virtual" 17th cell group or just absolute at end?
                // Let's make a group for it at x=16*width
                const finalAnnos = sys.annotations.filter(a => a.index >= 16);
                if (finalAnnos.length > 0) {
                    svg += `<g class="end-bar" transform="translate(${16 * cellWidth}, 0)">`;
                    svg += this.renderAnnotations(finalAnnos, cellWidth, systemHeight);
                    svg += `</g>`;
                }

                svg += `</g>`; // End system
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
                    s += `<rect x="-5" y="-25" width="24" height="24" fill="black"/>`;
                    s += `<text x="7" y="-8" fill="white" font-weight="bold" font-size="18" text-anchor="middle">${a.value}</text>`;
                }
                if (a.type === 'ending') {
                    // Span 4 cells?
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
            // Drawn at x=0 of the group
            const thin = 2;
            const thick = 6;
            let s = "";

            // Helper to draw line relative to 0
            const l = (x, w) => `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="black" stroke-width="${w}"/>`;

            switch (style) {
                case 'single': s = l(0, thin); break;
                case 'double-start': s = l(0, thick) + l(5, thin); break;
                // For Endings, usually they are drawn to the Left of the insertion point.
                // But in our parser, index 16 is at the Right edge of the system.
                // Index 0 is Left edge.
                // ] is double-end. Usually appears at index 16.
                // So at x=0 (relative to end group), we want lines to the LEFT? 
                // Or if it appears at index 4 (end of cell 3)?
                // `annos` are passed to the cell group at `cx`.
                // If index=16, cx is right edge. We want barline at cx.
                // If we draw `l(0)`, it draws at cx.
                // If it is 'double-end' `]`, we usually want `| ||` where the thick bar is rightmost?
                // Double end: Thin line, then Thick line.
                // If x=0 is the boundary.

                // Let's assume standard positioning:
                case 'double-end': s = l(-5, thin) + l(0, thick); break;
                case 'final': s = l(-5, thin) + l(0, thick); break;

                // Repeats
                case 'repeat-start':
                    s = l(0, thick) + l(5, thin);
                    s += `<circle cx="12" cy="${h / 2 - 10}" r="3" fill="black"/>`;
                    s += `<circle cx="12" cy="${h / 2 + 10}" r="3" fill="black"/>`;
                    break;
                case 'repeat-end':
                    s = l(-5, thin) + l(0, thick);
                    s += `<circle cx="-12" cy="${h / 2 - 10}" r="3" fill="black"/>`;
                    s += `<circle cx="-12" cy="${h / 2 + 10}" r="3" fill="black"/>`;
                    break;
            }
            return s;
        }

        renderChord(chordStr, x, y) {
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
