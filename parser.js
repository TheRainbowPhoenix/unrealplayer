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
                        if (i === startI) {
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
            // Configuration for "Pixel Perfect" look
            const config = {
                canvasPadding: 40,
                systemWidth: 880, // Total width for 16 cells (55 * 16)
                systemHeight: 140, // Height of one system
                systemSpacing: 60, // Space between systems
                cellWidth: 55,
                fontSize: {
                    title: 28,
                    composer: 18,
                    style: 18,
                    chordRoot: 32,
                    chordSuffix: 18,
                    chordBass: 22,
                    timeSig: 24,
                    barLine: 2,
                    barLineThick: 6,
                    rehearsal: 18
                },
                colors: {
                    bg: "#FDF6E3",
                    ink: "#000000"
                }
            };

            const startX = config.canvasPadding;
            const startY = 80;

            // Calculate Total Height
            let totalHeight = startY + 100;
            songData.systems.forEach(s => {
                totalHeight += (s.isSpacer ? 50 : config.systemHeight + config.systemSpacing);
            });

            const totalWidth = config.systemWidth + (config.canvasPadding * 2);

            let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}" style="background-color: ${config.colors.bg}; font-family: 'Arial', sans-serif;">
                <defs>
                    <style>
                        .title { font-size: ${config.fontSize.title}px; font-weight: bold; text-anchor: middle; fill: ${config.colors.ink}; }
                        .composer { font-size: ${config.fontSize.composer}px; text-anchor: end; fill: ${config.colors.ink}; }
                        .style { font-size: ${config.fontSize.style}px; text-anchor: start; fill: ${config.colors.ink}; }
                        .chord-root { font-size: ${config.fontSize.chordRoot}px; font-weight: bold; fill: ${config.colors.ink}; letter-spacing: -1px; }
                        .chord-suffix { font-size: ${config.fontSize.chordSuffix}px; font-weight: bold; fill: ${config.colors.ink}; baseline-shift: super; }
                        .chord-bass { font-size: ${config.fontSize.chordBass}px; font-weight: bold; fill: ${config.colors.ink}; }
                        .nc { font-size: 24px; font-weight: bold; fill: ${config.colors.ink}; }
                        .rehearsal-box { fill: #000; }
                        .rehearsal-text { fill: #fff; font-weight: bold; font-size: ${config.fontSize.rehearsal}px; text-anchor: middle; dominant-baseline: middle; }
                        .time-sig { font-size: ${config.fontSize.timeSig}px; font-weight: bold; text-anchor: middle; letter-spacing: -2px; }
                    </style>
                </defs>
                
                <!-- Header -->
                <text x="${totalWidth / 2}" y="45" class="title">${songData.title}</text>
                <text x="${totalWidth - config.canvasPadding}" y="45" class="composer">${songData.composer}</text>
                <text x="${config.canvasPadding}" y="45" class="style">${songData.style}</text>
            `;

            let currentY = startY;

            songData.systems.forEach((sys) => {
                if (sys.isSpacer) {
                    currentY += 50;
                    return;
                }

                const chordY = currentY + (config.systemHeight / 2) + 15;

                // Draw cells
                for (let i = 0; i < 16; i++) {
                    const cx = startX + (i * config.cellWidth);

                    // Annotations
                    const annos = sys.annotations.filter(a => a.index === i);
                    annos.forEach(a => {
                        // Barline
                        if (a.type === 'barline') {
                            svg += this.drawBarLine(a.style, cx, currentY, config.systemHeight, config);
                        }
                        // Time Signature
                        if (a.type === 'timeSig') {
                            const top = a.value[0];
                            const bot = a.value[1];
                            svg += `<text x="${cx + 15}" y="${chordY - 15}" class="time-sig">${top}</text>`;
                            svg += `<text x="${cx + 15}" y="${chordY + 15}" class="time-sig">${bot}</text>`;
                        }
                        // Rehearsal Mark
                        if (a.type === 'rehearsal') {
                            svg += `<rect x="${cx - 5}" y="${currentY - 25}" width="24" height="24" class="rehearsal-box"/>`;
                            svg += `<text x="${cx + 7}" y="${currentY - 12}" class="rehearsal-text">${a.value}</text>`;
                        }
                        // Ending
                        if (a.type === 'ending') {
                            const endW = config.cellWidth * 4;
                            svg += `<polyline points="${cx},${currentY + 15} ${cx},${currentY} ${cx + endW},${currentY}" fill="none" stroke="black" stroke-width="2"/>`;
                            svg += `<text x="${cx + 5}" y="${currentY + 12}" style="font-size: 12px; font-weight: bold;">${a.value}.</text>`;
                        }
                        // Staff Text
                        if (a.type === 'text') {
                            svg += `<text x="${cx}" y="${currentY - 5}" style="font-size: 14px; fill: #555;">${a.value}</text>`;
                        }
                    });

                    // Cell content
                    if (sys.cells[i]) {
                        const cell = sys.cells[i];
                        const cellCenter = cx + (config.cellWidth / 2);
                        const textX = cx + 5;

                        if (cell.type === 'chord') {
                            svg += this.renderChordToSVG(cell.content, textX, chordY);
                        } else if (cell.type === 'nc') {
                            svg += `<text x="${textX}" y="${chordY}" class="nc">N.C.</text>`;
                        } else if (cell.type === 'repeat-1') {
                            svg += `<text x="${cellCenter}" y="${chordY}" style="font-size: 28px; font-weight: bold; text-anchor: middle;">𝄎</text>`;
                        } else if (cell.type === 'repeat-2') {
                            svg += `<text x="${cellCenter}" y="${chordY}" style="font-size: 28px; font-weight: bold; text-anchor: middle;">𝄎</text>`;
                        }
                    }
                }

                // end barline
                sys.annotations.filter(a => a.index >= 16).forEach(a => {
                    const cx = startX + (16 * config.cellWidth);
                    if (a.type === 'barline') {
                        svg += this.drawBarLine(a.style, cx, currentY, config.systemHeight, config);
                    }
                });

                currentY += config.systemHeight + config.systemSpacing;
            });

            svg += `</svg>`;
            return svg;
        }

        drawBarLine(style, x, y, h, config) {
            const bottom = y + h;
            const wNormal = config.fontSize.barLine;
            const wThick = config.fontSize.barLineThick;

            let s = "";
            switch (style) {
                case 'single':
                    s = `<line x1="${x}" y1="${y}" x2="${x}" y2="${bottom}" stroke="black" stroke-width="${wNormal}"/>`;
                    break;
                case 'double-start':
                    s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${bottom}" stroke="black" stroke-width="${wThick}"/>`;
                    s += `<line x1="${x + 5}" y1="${y}" x2="${x + 5}" y2="${bottom}" stroke="black" stroke-width="${wNormal}"/>`;
                    break;
                case 'double-end':
                    s += `<line x1="${x - 5}" y1="${y}" x2="${x - 5}" y2="${bottom}" stroke="black" stroke-width="${wNormal}"/>`;
                    s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${bottom}" stroke="black" stroke-width="${wThick}"/>`;
                    break;
                case 'final':
                    s += `<line x1="${x - 5}" y1="${y}" x2="${x - 5}" y2="${bottom}" stroke="black" stroke-width="${wNormal}"/>`;
                    s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${bottom}" stroke="black" stroke-width="${wThick}"/>`;
                    break;
                case 'repeat-start':
                    s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${bottom}" stroke="black" stroke-width="${wThick}"/>`;
                    s += `<line x1="${x + 5}" y1="${y}" x2="${x + 5}" y2="${bottom}" stroke="black" stroke-width="${wNormal}"/>`;
                    s += `<circle cx="${x + 12}" cy="${y + h / 2 - 10}" r="3" fill="black"/>`;
                    s += `<circle cx="${x + 12}" cy="${y + h / 2 + 10}" r="3" fill="black"/>`;
                    break;
                case 'repeat-end':
                    s += `<circle cx="${x - 12}" cy="${y + h / 2 - 10}" r="3" fill="black"/>`;
                    s += `<circle cx="${x - 12}" cy="${y + h / 2 + 10}" r="3" fill="black"/>`;
                    s += `<line x1="${x - 5}" y1="${y}" x2="${x - 5}" y2="${bottom}" stroke="black" stroke-width="${wNormal}"/>`;
                    s += `<line x1="${x}" y1="${y}" x2="${x}" y2="${bottom}" stroke="black" stroke-width="${wThick}"/>`;
                    break;
            }
            return s;
        }

        renderChordToSVG(chordStr, x, y) {
            let main = chordStr;
            let alt = null;
            if (main.includes('(')) {
                const parts = main.split('(');
                main = parts[0];
                alt = parts[1].replace(')', '');
            }

            const parts = this.parseChordParts(main);

            // Generate SVG for parts
            let svg = `<text x="${x}" y="${y}">`;
            svg += `<tspan class="chord-root">${this.prettify(parts.root)}</tspan>`;

            // Track vertical displacement
            let currentDy = 0;

            if (parts.quality) {
                // Move up for superscript
                const dy = -15;
                svg += `<tspan class="chord-suffix" dy="${dy}">${this.prettify(parts.quality)}</tspan>`;
                currentDy += dy;
            }

            if (parts.bass) {
                // Return to baseline or slightly below
                const targetY = 0;
                const delta = targetY - currentDy;
                svg += `<tspan class="chord-bass" dy="${delta}">/${this.prettify(parts.bass)}</tspan>`;
                currentDy += delta;
            }
            svg += `</text>`;

            if (alt) {
                const altParts = this.parseChordParts(alt);
                const altText = this.prettify(altParts.root) + this.prettify(altParts.quality) + (altParts.bass ? '/' + this.prettify(altParts.bass) : '');
                svg += `<text x="${x}" y="${y - 35}" style="font-size: 14px; fill: #666; font-weight: bold; font-family: Arial;">${altText}</text>`;
            }

            return svg;
        }

        parseChordParts(chord) {
            const match = chord.match(/^([A-G][b#]?)(.*)/);
            if (!match) return { root: chord, quality: '', bass: '' };

            let root = match[1];
            let rest = match[2];
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
            return str
                .replace(/b/g, '♭')
                .replace(/#/g, '♯')
                .replace(/-/g, '-')
                .replace(/h/g, 'ø')
                .replace(/o/g, '°')
                .replace(/\^/g, 'Δ');
        }
    }

    return IRealRenderer;
}));
