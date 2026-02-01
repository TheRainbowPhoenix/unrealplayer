
export interface Measure {
    start: string;
    end: string;
    events: any[]; // Using any for flexibility with event types
}

export class Song {
    title: string;
    composer: string;
    style: string;
    key: string;
    tempo: string;
    musicString: string;
    measures: Measure[];

    constructor(title = "Unknown", composer = "Unknown", style = "Unknown", key = "C", musicString = "", tempo = "") {
        this.title = title;
        this.composer = composer;
        this.style = style;
        this.key = key;
        this.tempo = tempo;
        this.musicString = musicString;
        this.measures = [];
    }
    toIRealString(): string {
        const enc = (s: string) => encodeURIComponent(s);
        // Format: Title=Composer=Style=Key=n=Music=Tempo
        // Note: We put music string unscrambled. We must ensure Parser reads it.
        // We use 'n' as placeholder for 5th component if we stick to standard layout.
        const t = this.tempo ? `=${this.tempo}` : '';
        return `irealb://${enc(this.title)}=${enc(this.composer)}=${enc(this.style)}=${enc(this.key)}=n=${this.musicString}${t}`;
    }
}

export class Transposer {
    static get KEYS(): Record<string, string[]> {
        return {
            "C": ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"],
            "Ci": ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"],
            "Db": ["Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "Cb", "C"],
            "Dbi": ["Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "Cb", "C"],
            "D": ["D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B", "C", "C#"],
            "Di": ["D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#"],
            "Eb": ["Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D"],
            "Ebi": ["Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D"],
            "E": ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#"],
            "Ei": ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#"],
            "F": ["F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E"],
            "Fi": ["F", "F#", "G", "Ab", "A", "Bb", "B", "C", "C#", "D", "Eb", "E"],
            "Gb": ["Gb", "G", "Ab", "A", "Bb", "Cb", "C", "Db", "D", "Eb", "E", "F"],
            "Gbi": ["Gb", "G", "Ab", "A", "Bb", "Cb", "C", "Db", "D", "Eb", "E", "F"],
            "G": ["G", "Ab", "A", "Bb", "B", "C", "C#", "D", "Eb", "E", "F", "F#"],
            "Gi": ["G", "G#", "A", "Bb", "B", "C", "C#", "D", "D#", "E", "F", "F#"],
            "Ab": ["Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G"],
            "Abi": ["Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G"],
            "A": ["A", "Bb", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"],
            "Ai": ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"],
            "Bb": ["Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A"],
            "Bbi": ["Bb", "B", "C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A"],
            "B": ["B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#"],
            "Bi": ["B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#"],
            "A-": ["A", "Bb", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"],
            "A-i": ["A", "Bb", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"],
            "Bb-": ["Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A"],
            "Bb-i": ["Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A"],
            "B-": ["B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#"],
            "B-i": ["B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#"],
            "C-": ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"],
            "C-i": ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"],
            "C#-": ["C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C"],
            "C#-i": ["C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C"],
            "D-": ["D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B", "C", "C#"],
            "D-i": ["D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B", "C", "C#"],
            "Eb-": ["Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D"],
            "Eb-i": ["Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D"],
            "E-": ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#"],
            "E-i": ["E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#"],
            "F-": ["F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E"],
            "F-i": ["F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E"],
            "F#-": ["F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F"],
            "F#-i": ["F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F"],
            "G-": ["G", "Ab", "A", "Bb", "B", "C", "C#", "D", "Eb", "E", "F", "F#"],
            "G-i": ["G", "Ab", "A", "Bb", "B", "C", "C#", "D", "Eb", "E", "F", "F#"],
            "G#-": ["G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G"],
            "G#-i": ["G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G"]
        };
    }

    static get NOTE_INDICES(): Record<string, number> {
        return {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
            'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11, 'Cb': 11, 'B#': 0, 'E#': 5, 'Fb': 4
        };
    }

    static transpose(song: Song, targetKey: string): Song {
        const sourceKey = song.key;
        if (!Transposer.KEYS[targetKey]) {
            console.warn(`Target key ${targetKey} not found in map.`);
            return song;
        }
        if (!Transposer.KEYS[sourceKey]) {
            console.warn(`Source key ${sourceKey} not found in map.`);
        }

        const sourceRootIndex = Transposer.NOTE_INDICES[sourceKey.replace(/-.*/, '')] || 0;
        const targetRootIndex = Transposer.NOTE_INDICES[targetKey.replace(/-.*/, '')] || 0;

        // Calculate semitone delta
        const delta = (targetRootIndex - sourceRootIndex + 12) % 12;

        // Deep copy measures to avoid mutation
        const newMeasures = JSON.parse(JSON.stringify(song.measures));

        // Iterate and transpose
        newMeasures.forEach((m: Measure) => {
            m.events.forEach((e: any) => {
                if (e.type === 'chord') {
                    e.content = this.transposeChord(e.content, delta, targetKey);
                }
            });
        });

        const newSong = new Song(song.title, song.composer, song.style, targetKey, song.musicString);
        newSong.measures = newMeasures;
        return newSong;
    }

    static transposeChord(chordStr: string, delta: number, targetKeyMapName: string): string {
        if (chordStr === '}') return '}';

        let main = chordStr;
        let alt = null;
        if (main.includes('(')) {
            const parts = main.split('(');
            main = parts[0];
            alt = parts[1].replace(')', '');
        }

        const parser = new Renderer(); // Use renderer helper to split
        const p = parser.parseChordParts(main);

        const newRoot = this.transposeNote(p.root, delta, targetKeyMapName);
        const newBass = p.bass ? this.transposeNote(p.bass, delta, targetKeyMapName) : '';

        let newChord = newRoot + p.quality + (newBass ? '/' + newBass : '');

        if (alt) {
            const pAlt = parser.parseChordParts(alt);
            const newAltRoot = this.transposeNote(pAlt.root, delta, targetKeyMapName);
            const newAltBass = pAlt.bass ? this.transposeNote(pAlt.bass, delta, targetKeyMapName) : '';
            newChord += `(${newAltRoot}${pAlt.quality}${newAltBass ? '/' + newAltBass : ''})`;
        }

        return newChord;
    }

    static transposeNote(note: string, delta: number, targetKeyMapName: string): string {
        if (!note) return "";
        const idx = Transposer.NOTE_INDICES[note];
        if (idx === undefined) return note;

        const newIndex = (idx + delta) % 12;
        const map = Transposer.KEYS[targetKeyMapName] || Transposer.KEYS['C'];

        // Map is relative to key root.
        const targetRootIdx = Transposer.NOTE_INDICES[targetKeyMapName.replace(/-.*/, '')] || 0;
        const lookupIndex = (newIndex - targetRootIdx + 12) % 12;

        return map[lookupIndex];
    }
}

export class Parser {
    parse(dataString: string): Song[] {
        // Handle "irealbook://" or "irealb://" stripping if needed
        // Assuming raw text from file dump here primarily, which is "--- Song --- ..."
        // But the previous parser handled URL format.
        // Let's adapt to handle the user's playlist format or a raw dump.
        // The user's playlist format in playlist_examples.txt is:
        // --- Song N ---
        // Title: ...
        // Composer: ...
        // Raw Unscrambled Music: ...

        if (dataString.includes('--- Song')) {
            return this.parseTextDump(dataString);
        }

        // URL encoded format fallback
        let decoded = decodeURIComponent(dataString);
        if (decoded.startsWith("irealbook://")) {
            dataString = decoded.replace("irealbook://", "");
        } else if (decoded.startsWith("irealb://")) {
            dataString = decoded.replace("irealb://", "");
        } else {
            dataString = decoded;
        }

        const songsData = dataString.split("===");
        const songs: Song[] = [];

        for (const songData of songsData) {
            if (!songData.trim()) continue;

            const components = songData.split("=");
            let title = components[0];
            let composer = components[1];
            let style = "Unknown";
            let key = "C";
            let tempo = "";
            let rawMusic = "";

            let musicIndex = -1;
            for (let i = 0; i < components.length; i++) {
                if (components[i] && components[i].startsWith("1r34LbKcu7")) {
                    musicIndex = i;
                    break;
                }
            }

            if (musicIndex !== -1) {
                rawMusic = components[musicIndex];
                if (musicIndex >= 1 && Transposer.KEYS[components[musicIndex - 1]]) {
                    key = components[musicIndex - 1];
                } else if (musicIndex >= 2 && Transposer.KEYS[components[musicIndex - 2]]) {
                    key = components[musicIndex - 2];
                }

                // Try to get style from earlier component
                if (musicIndex >= 3) {
                    style = components[musicIndex - 3];
                }

                // Check for trailing metadata (Style, Tempo, Repeats)
                // usually: Music=Style=Tempo=Repeats
                if (components.length > musicIndex + 1) {
                    // prefer the trailing style as it is often more descriptive (e.g. "Jazz-Medium Up Swing")
                    const trailStyle = components[musicIndex + 1];
                    if (trailStyle && trailStyle.trim()) {
                        style = trailStyle;
                    }
                }
                if (components.length > musicIndex + 2) {
                    tempo = components[musicIndex + 2];
                }
            } else {
                if (components.length >= 6) {
                    style = components[2];

                    let musicEndIndex = components.length;
                    // Check for trailing tempo (2 or 3 digits)
                    const last = components[components.length - 1];
                    if (/^\d{2,3}$/.test(last)) {
                        tempo = last;
                        musicEndIndex--;
                    }

                    if (Transposer.KEYS[components[4]]) {
                        key = components[4];
                        rawMusic = components.slice(5, musicEndIndex).join("=");
                    } else {
                        key = components[3];
                        // If Key is at 3, assume 'n' or filler at 4, or just start music at 5 anyway per legacy?
                        // Legacy code did slice(5).
                        rawMusic = components.slice(5, musicEndIndex).join("=");
                    }
                }
            }

            if (rawMusic) {
                const music = this.unscramble(rawMusic);
                const song = new Song(title, composer, style, key, music, tempo);
                song.measures = this.parseProgression(song.musicString);
                songs.push(song);
            }
        }
        return songs;
    }

    parseTextDump(text: string): Song[] {
        const songs: Song[] = [];
        const lines = text.split('\n');
        let currentSong: Partial<Song> | null = null;
        let currentMusic = "";

        for (let line of lines) {
            line = line.trim();
            if (line.startsWith('--- Song')) {
                if (currentSong && currentMusic) {
                    // Previous song
                    const s = new Song(currentSong.title, currentSong.composer, "Unknown", "C", currentMusic); // Defaults
                    // Try to infer key/style if embedded in raw music or just defaults
                    // Actually raw music in the dump is already unscrambled usually ? 
                    // "Raw Unscrambled Music: " implies it is unscrambled.
                    s.measures = this.parseProgression(s.musicString);
                    songs.push(s);
                }
                currentSong = {};
                currentMusic = "";
            } else if (line.startsWith('Title: ')) {
                if (currentSong) currentSong.title = line.substring(7);
            } else if (line.startsWith('Composer: ')) {
                if (currentSong) currentSong.composer = line.substring(10);
            } else if (line.startsWith('Raw Unscrambled Music: ')) {
                currentMusic = line.substring(23);
                // Also parse key from music string if possible (e.g. T44C7... no key sig usually in raw music string)
                // The dump doesn't seem to have explicit Key or Style fields unfortunately. 
                // We might need to guess or extend the dumper. 
                // But let's proceed.
            }
        }
        // Last song
        if (currentSong && currentMusic) {
            const s = new Song(currentSong.title, currentSong.composer, "Unknown", "C", currentMusic);
            s.measures = this.parseProgression(s.musicString);
            songs.push(s);
        }
        return songs;
    }

    unscramble(data: string): string {
        if (!data.startsWith("1r34LbKcu7") || data.length < 11) return data;
        let s = data.substring(10).split('');

        const reverse = (arr: string[], start: number, maxRelIndex: number) => {
            let count = Math.floor(maxRelIndex / 2);
            for (let k = 0; k < count; k++) {
                let idx1 = start + k;
                let idx2 = start + maxRelIndex - k;
                if (idx2 < arr.length) {
                    let tmp = arr[idx1];
                    arr[idx1] = arr[idx2];
                    arr[idx2] = tmp;
                }
            }
        };

        for (let i = 0; i + 50 <= s.length; i += 50) {
            reverse(s, i + 10, 29);
            reverse(s, i + 5, 39);
            reverse(s, i, 49);
        }

        let i = 0;
        while (i < s.length - 2) {
            let c1 = s[i];
            let c2 = s[i + 1];
            let c3 = s[i + 2];

            if (c1 === 'X' && c2 === 'y' && c3 === 'Q') { s[i] = ' '; s[i + 1] = ' '; s[i + 2] = ' '; i += 3; continue; }
            if (c1 === 'K' && c2 === 'c' && c3 === 'l') { s[i] = '|'; s[i + 1] = ' '; s[i + 2] = 'x'; i += 3; continue; }
            if (c1 === 'L' && c2 === 'Z') { s[i] = ' '; s[i + 1] = '|'; i += 2; continue; }
            i++;
        }
        return s.join('');
    }

    parseProgression(raw: string): Measure[] {
        raw = raw.trimEnd();
        const measures: Measure[] = [];
        let currentMeasure: Measure = { start: '|', end: '|', events: [] };
        let startBarPending = '|';
        let hasContent = false;
        let pendingEvents: any[] = [];

        let i = 0;
        const len = raw.length;

        while (i < len) {
            const char = raw[i];

            if (char === 'Y') {
                if (hasContent) {
                    currentMeasure.end = '|';
                    measures.push(currentMeasure);
                    startBarPending = '|';
                    currentMeasure = { start: startBarPending, end: '|', events: [...pendingEvents] };
                    pendingEvents = [];
                    hasContent = false;
                }
                measures.push({ start: '', end: '', events: [{ type: 'break' }] });
                i++;
                continue;
            }

            if ("|[]{Z".includes(char)) {
                let type = 'single';
                if (char === '[') type = 'double-start';
                if (char === ']') type = 'double-end';
                if (char === '{') type = 'repeat-start';
                if (char === '}') type = 'repeat-end';
                if (char === 'Z') type = 'final';

                if (hasContent) {
                    currentMeasure.end = type;
                    measures.push(currentMeasure);
                    startBarPending = type;
                    currentMeasure = { start: startBarPending, end: '|', events: [...pendingEvents] };
                    pendingEvents = [];
                    hasContent = false;
                } else {
                    startBarPending = type;
                    currentMeasure.start = type;
                    currentMeasure.events.push(...pendingEvents);
                    pendingEvents = [];
                }
                i++;
                continue;
            }

            if (char === 'T' && i + 2 < len && /\d/.test(raw[i + 1])) {
                const evt = { type: 'time', value: raw.substring(i + 1, i + 3) };
                if (hasContent) pendingEvents.push(evt);
                else currentMeasure.events.push(evt);
                i += 3; continue;
            }
            if (char === '*' && i + 1 < len) {
                const evt = { type: 'rehearsal', value: raw[i + 1] };
                if (hasContent) pendingEvents.push(evt);
                else currentMeasure.events.push(evt);
                i += 2; continue;
            }

            if (char === 'N' && i + 1 < len) {
                currentMeasure.events.push({ type: 'ending', value: raw[i + 1] });
                i += 2; continue;
            }
            if (char === '<') {
                let endInfo = raw.indexOf('>', i);
                if (endInfo !== -1) {
                    currentMeasure.events.push({ type: 'text', value: raw.substring(i + 1, endInfo) });
                    i = endInfo + 1; continue;
                }
            }
            if (char === 's') { currentMeasure.events.push({ type: 'small' }); i++; continue; }
            if (char === 'l') { currentMeasure.events.push({ type: 'normal' }); i++; continue; }
            if (char === ',') { i++; continue; }

            if (char === ' ') {
                currentMeasure.events.push({ type: 'space' });
                hasContent = true;
                i++;
            } else {
                let token = "";
                let startI = i;
                while (i < len) {
                    const c = raw[i];
                    if (" []{}ZYT*N<,sl".includes(c)) break;
                    token += c;
                    i++;
                }
                if (token.length > 0) {
                    if (token === 'n') currentMeasure.events.push({ type: 'nc' });
                    else if (token === 'x') currentMeasure.events.push({ type: 'repeat-1' });
                    else if (token === 'r') currentMeasure.events.push({ type: 'repeat-2' });
                    else currentMeasure.events.push({ type: 'chord', content: token });
                    hasContent = true;
                } else {
                    if (i === startI) i++;
                }
            }
        }

        if (hasContent) {
            measures.push(currentMeasure);
        }

        return measures;
    }
}

export class Renderer {
    config: any;

    constructor() {
        this.config = {
            padding: 40,
            systemWidth: 880,
            systemHeight: 140,
            systemSpacing: 60,
            measureWidth: 220,
            colors: { bg: "#FDF6E3", ink: "#000000" }
        };
    }

    render(song: Song, activeIndex: number = -1): string {
        const { padding, systemWidth, systemHeight, systemSpacing, measureWidth, colors } = this.config;

        const systems: Measure[][] = [];
        let currentSystem: Measure[] = [];
        // We need to track the global index of measures to match activeIndex
        let globalMeasureIndex = 0;
        let systemMeasureIndices: number[][] = [];
        let currentSystemIndices: number[] = [];

        for (const item of song.measures) {
            if (item.events.some(e => e.type === 'break')) {
                if (currentSystem.length > 0) {
                    systems.push(currentSystem);
                    systemMeasureIndices.push(currentSystemIndices);
                }
                currentSystem = [];
                currentSystemIndices = [];
            } else {
                currentSystem.push(item);
                currentSystemIndices.push(globalMeasureIndex);
                globalMeasureIndex++;

                if (currentSystem.length === 4) {
                    systems.push(currentSystem);
                    systemMeasureIndices.push(currentSystemIndices);
                    currentSystem = [];
                    currentSystemIndices = [];
                }
            }
        }
        if (currentSystem.length > 0) {
            systems.push(currentSystem);
            systemMeasureIndices.push(currentSystemIndices);
        }

        const contentH = systems.length * (systemHeight + systemSpacing);
        const totalHeight = contentH + padding + 100;
        const totalWidth = systemWidth + (padding * 2);

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${totalWidth} ${totalHeight}" style="background-color: ${colors.bg}; font-family: 'Arial', sans-serif;">
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
                    .anno-text { font-size: 14px; fill: #555; }
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

        systems.forEach((sys, sysIdx) => {
            svg += `<g class="system" transform="translate(0, ${currentY})">`;

            const indices = systemMeasureIndices[sysIdx];

            sys.forEach((measure, idx) => {
                const mx = idx * measureWidth;
                const mIndex = indices[idx];
                const isActive = mIndex === activeIndex;

                svg += `<g class="measure" transform="translate(${mx}, 0)">`;
                svg += this.renderMeasure(measure, measureWidth, systemHeight, isActive);
                svg += `</g>`;
            });

            svg += `</g>`;
            currentY += systemHeight + systemSpacing;
        });

        svg += `</g></svg>`;
        return svg;
    }

    renderMeasure(measure: Measure, w: number, h: number, isActive: boolean = false): string {
        let s = "";

        if (isActive) {
            s += `<rect x="0" y="0" width="${w}" height="${h}" fill="rgba(255, 255, 0, 0.3)" rx="8" />`;
        }

        s += this.svgBarline(measure.start, 0, h);
        s += this.svgBarline(measure.end, w, h);

        const annos = measure.events.filter(e => ['time', 'rehearsal', 'ending', 'text'].includes(e.type));
        const contentEvents = measure.events.filter(e => !['time', 'rehearsal', 'ending', 'text', 'small', 'normal', 'break'].includes(e.type));

        annos.forEach(a => {
            if (a.type === 'time' && a.value) {
                s += `<text x="-20" y="${(h / 2) - 4}" class="time-sig">${a.value[0]}</text>`;
                s += `<line x1="-30" y1="${(h / 2) + 5}" x2="-10" y2="${(h / 2) + 5}" stroke="black" stroke-width="2"/>`;
                s += `<text x="-20" y="${(h / 2) + 21}" class="time-sig">${a.value[1]}</text>`;
            }
            if (a.type === 'rehearsal') {
                s += `<rect x="-5" y="-35" width="24" height="24" fill="black"/>`;
                s += `<text x="7" y="-18" fill="white" font-weight="bold" font-size="18" text-anchor="middle">${a.value}</text>`;
            }
            if (a.type === 'ending') {
                s += `<polyline points="0,15 0,0 ${w},0" fill="none" stroke="black" stroke-width="2"/>`;
                s += `<text x="5" y="12" font-size="12" font-weight="bold">${a.value}.</text>`;
            }
            if (a.type === 'text') {
                s += `<text x="5" y="-5" class="anno-text">${a.value}</text>`;
            }
        });

        const slotCount = Math.max(4, contentEvents.length);
        const slotW = w / slotCount;
        const chordY = (h / 2) + 15;

        contentEvents.forEach((e, i) => {
            const cx = (i * slotW) + 5;
            if (e.type === 'chord' && e.content) {
                s += this.renderChord(e.content, cx, chordY);
            } else if (e.type === 'nc') {
                s += `<text x="${cx}" y="${chordY}" class="nc">N.C.</text>`;
            } else if (e.type === 'repeat-1') {
                s += `<text x="${w / 2}" y="${chordY}" style="font-size: 28px; font-weight: bold; text-anchor: middle;">𝄎</text>`;
            } else if (e.type === 'repeat-2') {
                s += `<text x="${w / 2}" y="${chordY}" style="font-size: 28px; font-weight: bold; text-anchor: middle;">𝄎</text>`;
            }
        });

        return s;
    }

    svgBarline(style: string, x: number, h: number): string {
        const thin = 2;
        const thick = 6;
        let s = "";
        const l = (dx: number, w: number) => `<line x1="${x + dx}" y1="0" x2="${x + dx}" y2="${h}" stroke="black" stroke-width="${w}"/>`;

        switch (style) {
            case 'single': s = l(0, thin); break;
            case 'double-start': s = l(0, thick) + l(6, thin); break;
            case 'double-end': s = l(-6, thin) + l(0, thick); break;
            case 'final': s = l(-6, thin) + l(0, thick); break;
            case 'repeat-start':
                s = l(0, thick) + l(6, thin);
                s += `<circle cx="${x + 14}" cy="${h / 2 - 10}" r="3" fill="black"/>`;
                s += `<circle cx="${x + 14}" cy="${h / 2 + 10}" r="3" fill="black"/>`;
                break;
            case 'repeat-end':
                s = l(-6, thin) + l(0, thick);
                s += `<circle cx="${x - 14}" cy="${h / 2 - 10}" r="3" fill="black"/>`;
                s += `<circle cx="${x - 14}" cy="${h / 2 + 10}" r="3" fill="black"/>`;
                break;
            default:
                if (x === 0 && style === '|') s = l(0, thin);
                break;
        }
        return s;
    }

    renderChord(chordStr: string, x: number, y: number): string {
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
            const dy = 4;
            s += `<tspan class="chord-suffix" dy="${dy}">${this.prettify(parts.quality)}</tspan>`;
            currentDy += dy;
        }
        if (parts.bass) {
            const delta = 0 - currentDy;
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

    parseChordParts(chord: string): { root: string, quality: string, bass: string } {
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

    prettify(str: string): string {
        if (!str) return "";
        return str.replace(/b/g, '♭').replace(/#/g, '♯').replace(/-/g, '-').replace(/h/g, 'ø').replace(/o/g, '°').replace(/\^/g, 'Δ');
    }
}

export function getMeasureTimes(song: Song, bpm: number): { start: number; end: number; index: number }[] {
    const times: { start: number; end: number; index: number }[] = [];
    const secPerBeat = 60 / bpm;

    let currentTime = 0;
    let currentBeatsPerMeasure = 4; // Default 4/4

    let measureIndex = 0;

    for (const measure of song.measures) {
        // Check for time signature change
        const timeEvt = measure.events.find(e => e.type === 'time');
        if (timeEvt && timeEvt.value && timeEvt.value.length === 2) {
            const top = parseInt(timeEvt.value[0]);
            if (!isNaN(top)) {
                currentBeatsPerMeasure = top;
            }
        }

        // Skip purely structural measures that have 'break' ?? No, 'break' event is handled by Renderer not pushing it as a measure usually?
        // Parser creates measures with 'break' event for layout. They are NOT musical time measures usually.
        // Wait, "measures.push({ start: '', end: '', events: [{ type: 'break' }] });"
        // These are distinct "measures" in the array. 
        // We must exclude them from time map.

        const isBreak = measure.events.some(e => e.type === 'break');
        if (isBreak) continue;

        const duration = currentBeatsPerMeasure * secPerBeat;
        times.push({
            index: measureIndex,
            start: currentTime,
            end: currentTime + duration
        });
        currentTime += duration;
        measureIndex++;
    }
    return times;
}
