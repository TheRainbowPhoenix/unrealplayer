<script lang="ts">
    import { getChordScale, getChordTones } from "./music-theory";

    export let chord: string = "F#o7";

    const width = 174;

    // Notes slots definition (Y positions)
    // Calibrated to SVG lines: E4=39.3, G4=34.5, B4=29.7, D5=25.0, F5=20.1
    // Step = 4.8 (Line-Line), 2.4 (Line-Space)
    const SLOTS = [
        // Below staff ledger lines
        { name: "F", label: "F3", y: 53.7, isLine: true },
        { name: "G", label: "G3", y: 51.3, isLine: false },
        { name: "A", label: "A3", y: 48.9, isLine: true },
        { name: "B", label: "B3", y: 46.5, isLine: false },
        { name: "C", label: "C4", y: 44.1, isLine: true },
        { name: "D", label: "D4", y: 42.4, isLine: false },
        // Staff lines and spaces
        { name: "E", label: "E4", y: 40.0, isLine: true },
        { name: "F", label: "F4", y: 37.6, isLine: false },
        { name: "G", label: "G4", y: 35.2, isLine: true },
        { name: "A", label: "A4", y: 32.8, isLine: false },
        { name: "B", label: "B4", y: 30.4, isLine: true },
        { name: "C", label: "C5", y: 28.0, isLine: false },
        { name: "D", label: "D5", y: 25.6, isLine: true },
        { name: "E", label: "E5", y: 23.2, isLine: false },
        { name: "F", label: "F5", y: 20.7, isLine: true },
        { name: "G", label: "G5", y: 18.3, isLine: false },
        // Above staff ledger lines
        { name: "A", label: "A5", y: 16.1, isLine: true },
        { name: "B", label: "B5", y: 13.9, isLine: false },
        { name: "C", label: "C6", y: 10.5, isLine: true },
        { name: "D", label: "D6", y: 8.1, isLine: false },
        { name: "E", label: "E6", y: 5.7, isLine: true },
        { name: "F", label: "F6", y: 3.3, isLine: false },
        { name: "G", label: "G6", y: 0.9, isLine: true },
    ];

    $: scaleNotes = getChordScale(chord);
    $: chordTones = getChordTones(chord);

    // Map scale notes to slots
    $: sharps = calculateSharps(scaleNotes);
    $: clusterSharps = calculateSharps(chordTones); // Y positions are calculated the same, X will differ in template

    function calculateSharps(notes: any[]) {
        if (!notes || notes.length === 0) return [];

        const mappedNotes: any[] = [];
        let prevSlotIndex = -1;

        // Find a suitable starting slot for the root note.
        // Prioritize starting around G4 (index 8) or D5 (index 12) for readability.
        // If the root is 'D', try to find D5 (index 12).
        // If the root is 'G', try to find G4 (index 8).
        let initialRootSlotIndex = -1;
        const rootBase = notes[0].base;

        // Try to find the root note in the middle of the staff (G4 to F5)
        for (let i = 8; i <= 15; i++) {
            // G4 to G5
            if (SLOTS[i].name === rootBase) {
                initialRootSlotIndex = i;
                break;
            }
        }
        // If not found in middle, find the first occurrence from the bottom
        if (initialRootSlotIndex === -1) {
            initialRootSlotIndex = SLOTS.findIndex((s) => s.name === rootBase);
        }
        // Fallback to 0 if still not found (shouldn't happen with full SLOTS)
        if (initialRootSlotIndex === -1) initialRootSlotIndex = 0;

        prevSlotIndex = initialRootSlotIndex - 1; // Start search from before the root's slot

        notes.forEach((n, i) => {
            let currentSlotIndex = -1;
            // Search for the note's base name starting from the slot after the previous note
            for (let j = prevSlotIndex + 1; j < SLOTS.length; j++) {
                if (SLOTS[j].name === n.base) {
                    currentSlotIndex = j;
                    break;
                }
            }

            let yPos = 0;
            let isLedger = false;
            if (currentSlotIndex !== -1) {
                yPos = SLOTS[currentSlotIndex].y;
                console.log("currentSlotIndex", currentSlotIndex);
                isLedger =
                    SLOTS[currentSlotIndex].isLine && currentSlotIndex <= 11;
            } else {
                // If we run out of defined slots, extrapolate
                // This assumes a consistent step of 2.4 units per half-step (or 4.8 per whole step)
                const lastDefinedSlot = SLOTS[SLOTS.length - 1];
                const stepsBeyond = prevSlotIndex + 1 - SLOTS.length; // How many "slots" past the end we are trying to place
                yPos = lastDefinedSlot.y - stepsBeyond * 2.4; // Extrapolate upwards
                isLedger = true; // Assume extrapolated notes are on ledger lines
            }

            mappedNotes.push({
                name: n.note, // "D", "F#", etc
                baseName: n.base, // "D", "F"
                y: yPos,
                uId: `note-${n.base}-${i}-${Math.random().toString(36).substring(7)}`, // Unique ID
                accidental: n.accidental,
                slotIndex: currentSlotIndex, // Store for debugging/future use
                isLedger: isLedger,
            });
            prevSlotIndex =
                currentSlotIndex !== -1 ? currentSlotIndex : prevSlotIndex + 1; // Update for next iteration
        });
        return mappedNotes;
    }
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    id="chord"
    width={width * 1.45}
    height="78.8"
    viewBox={`0 0 ${width + 1.45} 58.3`}
>
    <defs id="defs121">
        <path id="line-low-A" fill="none" stroke="#000" d="M32.9 48.9h13.8" />
        <path id="line-low-C" fill="none" stroke="#000" d="M32.9 44.1h13.8" />
        <path
            id="path137-9-2-7-05"
            fill="none"
            stroke="#000"
            d="M22.9 24.8h13.8"
        />
        <path id="path137-9-2-0" fill="none" stroke="#000" d="M53.3 49h13.8" />
        <path
            id="path137-9-2-7-4"
            fill="none"
            stroke="#000"
            d="M53.3 44.1h13.8"
        />
        <path
            id="treble-clef-line"
            fill="#000"
            stroke="none"
            d="M45.3 39h1V19.9h-1zm0 0"
        />
        <path
            id="glyph-sharp"
            fill="#039"
            d="m49.5 18.4-.3 2H51l.3-1.9zm.6-3.2-.4 2.1h1.8l.4-2h.8l-.4 2h1.8q.3 0 .3.2l-.1.3-.4.6h-1.8l-.3 2H54q.3 0 .3.2v.3l-.4.6h-2.3l-.4 2.3h-.8l.4-2.2-1.8-.1-.4 2.3h-.9l.4-2.2h-1.7q-.2 0-.2-.2l.2-.5q.1-.5.7-.5h1.2l.4-2h-1.4l-.3.1h-.6q-.2 0-.2-.2l.2-.5q.3-.4.8-.4h1.7l.4-2.2z"
        />
        <g id="g119">
            <symbol id="glyph-ronde" overflow="visible">
                <path
                    id="path83"
                    stroke="none"
                    d="M4.3-2.2C5.8-2.2 7-1.1 7 .5Q7 2 5.6 2.2A2.6 2.6 0 0 1 2.9-.5Q3-2 4.3-2.2M9.9 0q-.1-1.3-1.5-2A7 7 0 0 0 5-2.6a7 7 0 0 0-3.4.8Q.2-1.3 0 0q.1 1.3 1.5 2a7 7 0 0 0 3.4.8 7 7 0 0 0 3.5-.9Q9.8 1.3 10 0m0 0"
                />
            </symbol>
            <symbol id="glyph3-2" overflow="visible">
                <path
                    id="path86"
                    stroke="none"
                    d="M4.4-2.7Q3.2-2.7 2-2c-.9.5-2 1.5-2 3q.2 1.8 2.2 1.8 1.2 0 2.3-.8c1-.5 2-1.5 2-3 0-1.2-1-1.7-2.1-1.7m0 0"
                />
            </symbol>
            <symbol id="glyph3-3" overflow="visible">
                <path
                    id="path89"
                    stroke="none"
                    d="M7.5-5.2 6.4-9.3c1.8-2.2 3.6-4.4 3.6-7.3a13 13 0 0 0-2.7-7.1H7A7 7 0 0 0 4-18q0 1.5.2 3.1.3 2 .9 3.8C2.7-8.3 0-5.7 0-2.2c0 4 3 7.4 6.7 7.4l1.8-.1v2.8c-.1 2-1.3 3.9-3.3 3.9q-1.5 0-2.3-1.3l.6.1a2 2 0 0 0 2-1.9c0-1-.9-2-2-2q-2 .2-2.2 2a4 4 0 0 0 3.9 4c2.3 0 4-2.2 4.1-4.6V5q.8-.3 1.4-.8A5 5 0 0 0 12.8 0c0-2.7-2-5.2-5-5.2zM9.2 4Q8.8.4 8-3c2.1.2 3.4 2 3.4 3.8 0 1.4-.9 2.8-2.2 3.2M1.5-.6c0-3.1 2-5.6 4.2-8l1 3.5a4 4 0 0 0-3.2 4c0 1.3.7 2.8 2.3 3.6H6q.4 0 .4-.4 0 0-.2-.3Q4.8.8 4.7-.6q.1-2 2.5-2.4Q8 .5 8.4 4.3H6.7C4 4.4 1.5 2.2 1.5-.5M8-20.8c.4 1 .4 1.5.4 2.6 0 2.5-1.3 4.5-2.9 6.4Q5-13.5 5-15.7c0-2.1 1.3-4.2 3.2-5.1m0 0"
                />
            </symbol>
            <symbol id="glyph-flat" overflow="visible">
                <path
                    id="path92"
                    stroke="none"
                    d="M.5-.8q.1-1.2 1-1.3 1 .2 1 1.4c0 1.1-1 2-2 2.7V.5Zm-.8 3.6q0 .4.5.5.5-.2.9-.8C2.3 1.5 4 .7 4-1c0-1-.7-2-1.8-2q-1 0-1.8.7l.1-7h-1zm0 0"
                />
            </symbol>
        </g>
    </defs>

    <path
        id="lineE"
        fill="none"
        stroke="#000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-miterlimit="10"
        stroke-opacity="1"
        stroke-width=".5"
        d={`M.3 39.3h${width}`}
    />
    <path
        id="lineG"
        fill="none"
        stroke="#000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-miterlimit="10"
        stroke-opacity="1"
        stroke-width=".5"
        d={`M.3 34.5h${width}`}
    />
    <path
        id="lineB"
        fill="none"
        stroke="#000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-miterlimit="10"
        stroke-opacity="1"
        stroke-width=".5"
        d={`M.3 29.7h${width}`}
    />
    <path
        id="lineD"
        fill="none"
        stroke="#000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-miterlimit="10"
        stroke-opacity="1"
        stroke-width=".5"
        d={`M.3 25h${width}`}
    />
    <path
        id="lineF"
        fill="none"
        stroke="#000"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-miterlimit="10"
        stroke-opacity="1"
        stroke-width=".5"
        d={`M.3 20.1h${width}`}
    />

    <g
        id="treble-clef"
        fill="#000"
        fill-opacity="1"
        transform="matrix(1 0 0 .97 -28.3 -17.8)"
    >
        <use
            xlink:href="#glyph3-3"
            id="use265"
            width="100%"
            height="100%"
            x="32.3"
            y="53.9"
        />
    </g>
    <path
        id="end-clef-line"
        fill="#000"
        fill-opacity="1"
        fill-rule="nonzero"
        stroke="none"
        d={`M${width - 0.2} 39h1V19.9h-1zm0 0`}
    />
    <path
        id="end-clef-line-pre"
        fill="#000"
        fill-opacity="1"
        fill-rule="nonzero"
        stroke="none"
        d={`M${width - 2.9} 39h1V19.9h-1zm0 0`}
    />

    <use xlink:href="#treble-clef-line" fill-rule="nonzero" />
    <use
        xlink:href="#treble-clef-line"
        id="treble-clef-line-7"
        fill-rule="nonzero"
    />

    {#each clusterSharps as s, i}
        <g class="notes-line" transform="translate(2)">
            <g class="notes-sub-line" transform="translate(-2.2, 16.2)">
                {#if s.isLedger}
                    <path
                        d="M22.9 {s.y}h13.8"
                        stroke="#000"
                        stroke-width="0.5"
                    />
                {/if}
            </g>

            <g id="note_sharp" fill="#903" fill-opacity="1" stroke="none">
                {#if s.accidental === "sharp"}
                    <g
                        id="note_sharp_{s.name}"
                        style="line-height:125%"
                        transform="matrix(.81 0 0 .81 -23.3 {s.y})"
                    >
                        <use
                            xlink:href="#glyph-sharp"
                            id="glyph-sharp-{s.uId}"
                        />
                    </g>
                {/if}
            </g>

            <g
                id="note_flat"
                fill="#039"
                fill-opacity="1"
                stroke="none"
                font-family="sans-serif"
                font-size="11.5"
            >
                {#if s.accidental === "flat"}
                    <g
                        id="note_flat_{s.name}"
                        style="line-height:125%"
                        transform="matrix(.61 -.3 .11 1.58 -13 {s.y})"
                    >
                        <use
                            xlink:href="#glyph-flat"
                            id="glyph-flat-{s.uId}"
                            style="-inkscape-font-specification:&quot;Goudy Stout&quot;"
                        />
                    </g>
                {/if}
            </g>

            <g
                id="notes_ronde"
                fill="#7b339b"
                fill-opacity="1"
                stroke="none"
                transform="translate(13.0)"
            >
                <g
                    id="note_ronde_{s.name}"
                    style="line-height:125%"
                    transform="matrix(1 0 0 .97 9.6 {s.y + 16})"
                >
                    <use xlink:href="#glyph-ronde" id="glyph-ronde-{s.uId}" />
                </g>
            </g>
        </g>
    {/each}

    {#each sharps as s, i}
        <g class="notes-line" transform="translate({30.4 + i * 14})">
            <g
                class="notes-sub-line"
                transform="translate(-2.2, 16.2)"
                data-slotIndex={s.slotIndex}
            >
                <!-- Low Ledgers -->
                <!-- C7 -->
                {#if s.slotIndex <= 11}
                    <path
                        d="M22.9 {SLOTS[11].y}h13.8"
                        stroke="#000"
                        stroke-width="0.5"
                    />
                {/if}
                <!-- A7 -->
                {#if s.slotIndex <= 9}
                    <path
                        d="M22.9 {SLOTS[9].y}h13.8"
                        stroke="#000"
                        stroke-width="0.5"
                    />
                {/if}
                {#if s.slotIndex <= 7}
                    <path
                        d="M22.9 {SLOTS[7].y}h13.8"
                        stroke="#000"
                        stroke-width="0.5"
                    />
                {/if}
            </g>

            <g
                id="note_sharp"
                fill="#039"
                fill-opacity="1"
                stroke="none"
                font-family="sans-serif"
                font-size="11.5"
            >
                {#if s.accidental === "sharp"}
                    <g
                        id="note_sharp_{s.name}"
                        style="line-height:125%"
                        transform="matrix(.61 -.3 .11 1.58 -13 {s.y})"
                    >
                        <use
                            xlink:href="#glyph-sharp"
                            id="glyph-sharp-{s.uId}"
                            style="-inkscape-font-specification:&quot;Goudy Stout&quot;"
                        />
                    </g>
                {/if}
            </g>

            <g id="note_flat" fill="#903" fill-opacity="1" stroke="none">
                {#if s.accidental === "flat"}
                    <g
                        id="note_flat_{s.name}"
                        style="line-height:125%"
                        transform="matrix(.81 0 0 .81 20.3 {s.y + 16})"
                    >
                        <use xlink:href="#glyph-flat" id="glyph-flat-{s.uId}" />
                    </g>
                {/if}
            </g>

            <g
                id="notes_ronde"
                fill="#7b339b"
                fill-opacity="1"
                stroke="none"
                transform="translate(13.0)"
            >
                <g
                    id="note_ronde_{s.name}"
                    style="line-height:125%"
                    transform="matrix(1 0 0 .97 9.6 {s.y + 16})"
                >
                    <!-- <use xlink:href="#glyph-ronde" id="use255-2-0-5-8-0" width="100%" height="100%" x="57.2" y="49" fill="#7b339b" fill-opacity="1"></use> -->

                    <use xlink:href="#glyph-ronde" id="glyph-ronde-{s.uId}" />
                </g>
            </g>
        </g>
    {/each}
</svg>
