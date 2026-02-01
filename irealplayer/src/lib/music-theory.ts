
export const SCALES: Record<string, string[]> = {
    "maj": ["Major", "Pentatonic Major", "Blues", "Bebop Major", "Dominant (Mixolydian)", "Lydian"],
    "add2": ["Major", "Dominant (Mixolydian)", "Lydian", "Pentatonic Major", "Blues", "Bebop Major"],
    "add4": ["Major", "Dominant (Mixolydian)", "Pentatonic Major", "Blues", "Bebop Major"],
    "-": ["Dorian", "Minor (Aeolian)", "Pentatonic Minor", "Phrygian", "Blues", "Melodic Minor", "Harmonic Minor", "Bebop Minor"],
    "sus2": ["Major", "Pentatonic Major", "Blues", "Dominant (Mixolydian)", "Lydian Dominant", "Lydian", "Minor (Aeolian)", "Pentatonic Minor", "Dorian", "Melodic Minor", "Harmonic Minor", "Bebop Major", "Bebop Minor", "Bebop Dominant"],
    "5": ["Major", "Pentatonic Major", "Blues", "Dominant (Mixolydian)", "Lydian Dominant", "Lydian", "Minor (Aeolian)", "Pentatonic Minor", "Dorian", "Melodic Minor", "Harmonic Minor", "Bebop Major", "Bebop Minor", "Bebop Dominant"],
    "sus4": ["Dominant (Mixolydian)", "Bebop Dominant"],
    "+": ["Whole Tone", "Altered"],
    "o7": ["Diminished Whole-Half"],
    "o^7": ["Diminished Whole-Half"],
    "o": ["Diminished Whole-Half"],
    "^7": ["Major", "Pentatonic Major", "Bebop Major", "Lydian"],
    "^9": ["Major", "Pentatonic Major", "Bebop Major", "Lydian"],
    "^13": ["Major", "Pentatonic Major", "Bebop Major", "Lydian"],
    "6": ["Major", "Pentatonic Major", "Blues", "Bebop Major", "Lydian"],
    "69": ["Major", "Pentatonic Major", "Blues", "Bebop Major", "Lydian"],
    "^7#11": ["Lydian", "Pentatonic Major"],
    "^9#11": ["Lydian", "Pentatonic Major"],
    "^13#11": ["Lydian", "Pentatonic Major"],
    "^7#5": ["Lydian Augmented"],
    "^7b5": ["Lydian Augmented"],
    "^7#9": ["Lydian #2"],
    "-7": ["Dorian", "Pentatonic Minor", "Blues", "Bebop Minor", "Minor (Aeolian)", "Phrygian"],
    "-9": ["Dorian", "Pentatonic Minor", "Blues", "Bebop Minor", "Minor (Aeolian)"],
    "-add2": ["Dorian", "Pentatonic Minor", "Blues", "Bebop Minor", "Minor (Aeolian)", "Melodic Minor", "Harmonic Minor"],
    "-add4": ["Dorian", "Pentatonic Minor", "Blues", "Bebop Minor", "Minor (Aeolian)", "Melodic Minor", "Harmonic Minor"],
    "-11": ["Dorian", "Pentatonic Minor", "Blues", "Bebop Minor", "Minor (Aeolian)"],
    "-13": ["Dorian", "Pentatonic Minor", "Blues", "Bebop Minor"],
    "-6": ["Dorian", "Bebop Minor"],
    "-69": ["Dorian", "Bebop Minor"],
    "-b6": ["Minor (Aeolian)", "Pentatonic Minor", "Harmonic Minor"],
    "-#5": ["Minor (Aeolian)", "Harmonic Minor"],
    "-^7": ["Melodic Minor", "Harmonic Minor"],
    "-^9": ["Melodic Minor", "Harmonic Minor"],
    "-^11": ["Melodic Minor", "Harmonic Minor"],
    "-^13": ["Melodic Minor"],
    "-7b6": ["Minor (Aeolian)", "Phrygian", "Pentatonic Minor"],
    "-9b6": ["Minor (Aeolian)", "Pentatonic Minor"],
    "7": ["Dominant (Mixolydian)", "Bebop Dominant", "Lydian Dominant", "Diminished Half-Whole", "Whole Tone", "Altered", "Mixolydian b9 b13", "Pentatonic Major", "Blues"],
    "9": ["Dominant (Mixolydian)", "Bebop Dominant", "Lydian Dominant", "Whole Tone", "Pentatonic Major", "Blues"],
    "13": ["Dominant (Mixolydian)", "Bebop Dominant", "Lydian Dominant", "Pentatonic Major", "Blues"],
    "7add13": ["Dominant (Mixolydian)", "Bebop Dominant", "Lydian Dominant", "Pentatonic Major", "Blues"],
    "13#11": ["Lydian Dominant", "Pentatonic Major", "Blues"],
    "13#9": ["Diminished Half-Whole"],
    "13b9": ["Diminished Half-Whole"],
    "h7": ["Locrian", "Locrian Natural 9"],
    "h9": ["Locrian Natural 9"],
    "13sus": ["Dominant (Mixolydian)", "Bebop Dominant"],
    "7#11": ["Lydian Dominant", "Pentatonic Major", "Blues"],
    "7b5": ["Lydian Dominant", "Whole Tone", "Altered", "Diminished Half-Whole"],
    "7#5": ["Whole Tone", "Altered"],
    "7b13": ["Mixolydian b9 b13", "Altered"],
    "7#9": ["Altered", "Diminished Half-Whole"],
    "7#9#11": ["Altered", "Diminished Half-Whole"],
    "7#9b5": ["Altered", "Diminished Half-Whole"],
    "7#9#5": ["Altered"],
    "7alt": ["Altered"],
    "7susb9b13": ["Mixolydian b9 b13"],
    "7b9": ["Mixolydian b9 b13", "Altered", "Diminished Half-Whole"],
    "7b9#11": ["Altered", "Diminished Half-Whole"],
    "7b9b5": ["Altered", "Diminished Half-Whole"],
    "7b9#5": ["Altered"],
    "7b9b13": ["Mixolydian b9 b13", "Altered"],
    "7b9#9": ["Altered", "Diminished Half-Whole"],
    "7susb9": ["Mixolydian b9 b13", "Phrygian"],
    "7sus": ["Dominant (Mixolydian)", "Bebop Dominant"],
    "7susadd3": ["Dominant (Mixolydian)", "Bebop Dominant"],
    "9#11": ["Lydian Dominant"],
    "9b5": ["Lydian Dominant", "Whole Tone"],
    "9#5": ["Whole Tone"],
    "9sus": ["Dominant (Mixolydian)", "Bebop Dominant"]
};

export const SCALE_PATTERNS: Record<string, string> = {
    "Major": "1-2-3-4-5-6-7",
    "Minor (Aeolian)": "1-2-b3-4-5-b6-b7",
    "Dominant (Mixolydian)": "1-2-3-4-5-6-b7",
    "Whole Tone": "1-2-3-#4-#5-b7",
    "Diminished Whole-Half": "1-2-b3-4-b5-b6-6-7",
    "Diminished Half-Whole": "1-b2-#2-3-#4-5-6-b7",
    "Lydian": "1-2-3-#4-5-6-7",
    "Lydian Augmented": "1-2-3-#4-#5-6-7",
    "Lydian #2": "1-#2-3-#4-5-6-7",
    "Lydian Dominant": "1-2-3-#4-5-6-b7",
    "Dorian": "1-2-b3-4-5-6-b7",
    "Melodic Minor": "1-2-b3-4-5-6-7",
    "Harmonic Minor": "1-2-b3-4-5-b6-7",
    "Locrian": "1-b2-b3-4-b5-b6-b7",
    "Locrian Natural 9": "1-2-b3-4-b5-b6-b7",
    "Altered": "1-b2-#2-3-b5-b6-b7",
    "Mixolydian b9 b13": "1-b2-3-4-5-b6-b7",
    "Phrygian": "1-b2-b3-4-5-b6-b7",
    "Pentatonic Major": "1-2-3-5-6",
    "Pentatonic Minor": "1-b3-4-5-b7",
    "Blues": "1-b3-4-#4-5-b7",
    "Bebop Major": "1-2-3-4-5-#5-6-7",
    "Bebop Dominant": "1-2-3-4-5-6-b7-7",
    "Bebop Minor": "1-2-b3-3-4-5-6-b7"
};

const NOTE_INDICES: Record<string, number> = {
    'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
};

const INDICES_TO_NOTES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const INDICES_TO_NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const INTERVAL_Map: Record<string, number> = {
    '1': 0, 'b2': 1, '2': 2, '#2': 3, 'b3': 3, '3': 4,
    '4': 5, '#4': 6, 'b5': 6, '5': 7, '#5': 8, 'b6': 8,
    '6': 9, '#6': 10, 'b7': 10, '7': 11,
    // Add enharmonics or extensions if necessary
    'bb7': 9, 'b9': 1, '9': 2, '#9': 3, '11': 5, '#11': 6, '13': 9, 'b13': 8
};

export interface DisplayNote {
    note: string; // "C", "D", "F#" etc.
    accidental?: "flat" | "sharp" | "natural";
    base: string; // The letter C, D, E...
    offset: number; // Semitones from root
    degree: string;
}

export function parseChord(chordStr: string) {
    const match = chordStr.match(/^([A-G][b#]?)(.*)/);
    if (!match) return { root: "C", quality: "" };
    let [_, root, quality] = match;

    // Clean up quality (remove bass note if present, though parser usually separates it)
    if (quality.includes('/')) {
        quality = quality.split('/')[0];
    }

    // Normalize suffix
    // Special handling for empty quality? Usually 'maj' or Major.
    if (quality === "") quality = "maj"; // Default to major logic? Or look up key "" in SCALES? SCALES has "maj" not "".
    // Actually, "C" usually implies Major scale.

    // If quality not found, try to fallback or match longest prefix?
    if (!SCALES[quality] && quality !== "") {
        // Try exact match or fallback to major
        // console.warn("Unknown quality:", quality);
        if (SCALES["maj"]) return { root, quality: "maj" };
    }

    return { root, quality };
}

export function getNoteForDegree(root: string, interval: string): DisplayNote {
    const rootIdx = NOTE_INDICES[root];
    const semitones = INTERVAL_Map[interval];

    if (semitones === undefined) {
        // Fallback for unknown intervals, treat as root?
        return { note: root, base: root.replace(/[b#]/, ''), offset: 0, degree: interval };
    }

    const noteIdx = (rootIdx + semitones) % 12;

    // Determine spelling. This is complex (Circle of fifths etc).
    // For visualization, we primarily need the "Base" letter to place it on the staff.
    // e.g. Root C, interval b3 (Eb). Base E.
    // Root F#, interval b7 (E). Base E.

    // Simple heuristic:
    // 1 -> Base Root
    // 2/b2/#2 -> Base Root+1
    // 3/b3/#3 -> Base Root+2
    // 4/#4 -> Base Root+3
    // 5/b5/#5 -> Base Root+4
    // 6/b6/#6 -> Base Root+5
    // 7/b7 -> Base Root+6

    const rootLetter = root.charAt(0);
    const letters = ["C", "D", "E", "F", "G", "A", "B"];
    const rootLetterIdx = letters.indexOf(rootLetter);

    let degreeStep = 0;
    if (interval.includes('1')) degreeStep = 0; // 1, 11, 13?? No. 1, b2, ...
    else if (interval.includes('2') || interval.includes('9')) degreeStep = 1;
    else if (interval.includes('3')) degreeStep = 2;
    else if (interval.includes('4') || interval.includes('11')) degreeStep = 3;
    else if (interval.includes('5')) degreeStep = 4;
    else if (interval.includes('6') || interval.includes('13')) degreeStep = 5;
    else if (interval.includes('7')) degreeStep = 6;

    const targetLetterIdx = (rootLetterIdx + degreeStep) % 7;
    const targetLetter = letters[targetLetterIdx];

    // Now determine accidental.
    // We have the exact pitch index (noteIdx).
    // We have the target letter.
    // Standard pitch of target letter (natural):
    const targetNaturalIdx = NOTE_INDICES[targetLetter];

    let diff = noteIdx - targetNaturalIdx;
    // Normalize diff to -6 to +6 range
    if (diff > 6) diff -= 12;
    if (diff < -6) diff += 12;

    let accidental: "flat" | "sharp" | "natural" | undefined = undefined;
    let noteName = targetLetter;

    if (diff === 0) accidental = undefined; // Natural
    else if (diff === 1) { accidental = "sharp"; noteName += "#"; }
    else if (diff === -1) { accidental = "flat"; noteName += "b"; }
    else if (diff === 2) { accidental = "sharp"; noteName += "##"; } // Rare but possible
    else if (diff === -2) { accidental = "flat"; noteName += "bb"; }

    return {
        note: noteName,
        base: targetLetter,
        accidental: accidental as any,
        offset: semitones,
        degree: interval
    };
}

export function getChordScale(chordStr: string): DisplayNote[] {
    const { root, quality } = parseChord(chordStr);

    let scaleName = "Major";
    let q = quality;
    if (q === "") q = "maj";

    if (SCALES[q]) {
        scaleName = SCALES[q][0]; // Pick first
    } else {
        // console.log("Quality not found, default to Major");
        scaleName = "Major";
    }

    const patternStr = SCALE_PATTERNS[scaleName];
    if (!patternStr) return [];

    const degrees = patternStr.split('-');
    const notes: DisplayNote[] = degrees.map(d => getNoteForDegree(root, d));

    return notes;
}
