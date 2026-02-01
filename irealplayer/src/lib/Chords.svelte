<script lang="ts">
    export let chord: string = "C";
    // TODO: make it dynamic based on the chord

    const notes = [
        "D",
        "E",
        "F",
        "G",
        "A",
        "B",
        "C",
    ];

    const sharps = [
        { name: "D_high", y: 9.1, uId: "9-3" },
        { name: "C_high", y: 11.6, uId: "8-4" },
        { name: "B_high", y: 14, uId: "6-7-8" },
        { name: "A_high", y: 16.5, uId: "6-9-2" },
        { name: "G", y: 18.8, uId: "6-4-9-5" },
        { name: "F", y: 21.3, uId: "6-4-8-0" },
        { name: "E", y: 23.6, uId: "6-4-5-1-3" },
        { name: "D", y: 26.1, uId: "6-4-5-3-7" },
        { name: "C", y: 28.4, uId: "6-4-5-0-5-0" },
        { name: "B", y: 31, uId: "6-4-5-0-7-1" },
        { name: "A", y: 33.2, uId: "6-4-5-0-1-5-5" },
        { name: "G_low", y: 35.7, uId: "6-4-5-0-1-0-4" },
    ];
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
id="chord"
width="206"
height="78.8"
    viewBox="0 0 154.5 58.3"
>
  <defs id="defs121">
    <path id="line-low-A" fill="none" stroke="#000" d="M32.9 49h13.8"/>
    <path id="line-low-C" fill="none" stroke="#000" d="M32.9 44.1h13.8"/>
    <path id="path137-9-2-7-05" fill="none" stroke="#000" d="M22.9 24.8h13.8"/>
    <path id="path137-9-2-0" fill="none" stroke="#000" d="M53.3 49h13.8"/>
    <path id="path137-9-2-7-4" fill="none" stroke="#000" d="M53.3 44.1h13.8"/>
    <path id="treble-clef-line" fill="#000" stroke="none" d="M45.3 39h1V19.9h-1zm0 0"/>
    <path id="glyph-flat" fill="#039" d="m49.5 18.4-.3 2H51l.3-1.9zm.6-3.2-.4 2.1h1.8l.4-2h.8l-.4 2h1.8q.3 0 .3.2l-.1.3-.4.6h-1.8l-.3 2H54q.3 0 .3.2v.3l-.4.6h-2.3l-.4 2.3h-.8l.4-2.2-1.8-.1-.4 2.3h-.9l.4-2.2h-1.7q-.2 0-.2-.2l.2-.5q.1-.5.7-.5h1.2l.4-2h-1.4l-.3.1h-.6q-.2 0-.2-.2l.2-.5q.3-.4.8-.4h1.7l.4-2.2z"/>
    <g id="g119">
      <symbol id="glyph-ronde" overflow="visible">
        <path id="path83" stroke="none" d="M4.3-2.2C5.8-2.2 7-1.1 7 .5Q7 2 5.6 2.2A2.6 2.6 0 0 1 2.9-.5Q3-2 4.3-2.2M9.9 0q-.1-1.3-1.5-2A7 7 0 0 0 5-2.6a7 7 0 0 0-3.4.8Q.2-1.3 0 0q.1 1.3 1.5 2a7 7 0 0 0 3.4.8 7 7 0 0 0 3.5-.9Q9.8 1.3 10 0m0 0"/>
      </symbol>
      <symbol id="glyph3-2" overflow="visible">
        <path id="path86" stroke="none" d="M4.4-2.7Q3.2-2.7 2-2c-.9.5-2 1.5-2 3q.2 1.8 2.2 1.8 1.2 0 2.3-.8c1-.5 2-1.5 2-3 0-1.2-1-1.7-2.1-1.7m0 0"/>
      </symbol>
      <symbol id="glyph3-3" overflow="visible">
        <path id="path89" stroke="none" d="M7.5-5.2 6.4-9.3c1.8-2.2 3.6-4.4 3.6-7.3a13 13 0 0 0-2.7-7.1H7A7 7 0 0 0 4-18q0 1.5.2 3.1.3 2 .9 3.8C2.7-8.3 0-5.7 0-2.2c0 4 3 7.4 6.7 7.4l1.8-.1v2.8c-.1 2-1.3 3.9-3.3 3.9q-1.5 0-2.3-1.3l.6.1a2 2 0 0 0 2-1.9c0-1-.9-2-2-2q-2 .2-2.2 2a4 4 0 0 0 3.9 4c2.3 0 4-2.2 4.1-4.6V5q.8-.3 1.4-.8A5 5 0 0 0 12.8 0c0-2.7-2-5.2-5-5.2zM9.2 4Q8.8.4 8-3c2.1.2 3.4 2 3.4 3.8 0 1.4-.9 2.8-2.2 3.2M1.5-.6c0-3.1 2-5.6 4.2-8l1 3.5a4 4 0 0 0-3.2 4c0 1.3.7 2.8 2.3 3.6H6q.4 0 .4-.4 0 0-.2-.3Q4.8.8 4.7-.6q.1-2 2.5-2.4Q8 .5 8.4 4.3H6.7C4 4.4 1.5 2.2 1.5-.5M8-20.8c.4 1 .4 1.5.4 2.6 0 2.5-1.3 4.5-2.9 6.4Q5-13.5 5-15.7c0-2.1 1.3-4.2 3.2-5.1m0 0"/>
      </symbol>
      <symbol id="glyph-sharp" overflow="visible">
        <path id="path92" stroke="none" d="M.5-.8q.1-1.2 1-1.3 1 .2 1 1.4c0 1.1-1 2-2 2.7V.5Zm-.8 3.6q0 .4.5.5.5-.2.9-.8C2.3 1.5 4 .7 4-1c0-1-.7-2-1.8-2q-1 0-1.8.7l.1-7h-1zm0 0"/>
      </symbol>
    </g>
  </defs>
  
  <path id="lineE" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-opacity="1" stroke-width=".5" d="M.3 39.3h154"/>
  <path id="lineG" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-opacity="1" stroke-width=".5" d="M.3 34.5h154"/>
  <path id="lineB" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-opacity="1" stroke-width=".5" d="M.3 29.7h154"/>
  <path id="lineD" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-opacity="1" stroke-width=".5" d="M.3 25h154"/>
  <path id="lineF" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-opacity="1" stroke-width=".5" d="M.3 20.1h154"/>
  
  <g id="treble-clef" fill="#000" fill-opacity="1" transform="matrix(1 0 0 .97 -28.3 -17.8)">
    <use xlink:href="#glyph3-3" id="use265" width="100%" height="100%" x="32.3" y="53.9"/>
  </g>
  <path id="end-clef-line" fill="#000" fill-opacity="1" fill-rule="nonzero" stroke="none" d="M153.6 39h1V19.9h-1zm0 0"/>
  <path id="end-clef-line-pre" fill="#000" fill-opacity="1" fill-rule="nonzero" stroke="none" d="M151.1 39h1V19.9h-1zm0 0"/>



  <use xlink:href="#treble-clef-line" fill-rule="nonzero"/>
  <use xlink:href="#treble-clef-line" id="treble-clef-line-7" fill-rule="nonzero"/>

  



  {#each notes as note, i}

    <g
        class="notes-line"
        transform="translate({30.4 + i * 14})"
    >

        <g 
            class="notes-sub-line"
            transform="translate(-9.5)"
        >
            <use xlink:href="#line-low-A" id="line-under-A_NOTE" fill-opacity="1" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-opacity="1" stroke-width="1"/>
            <use xlink:href="#line-low-C" id="line-under-C_NOTE" fill-opacity="1" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" stroke-opacity="1" stroke-width="1"/>
        </g>   
        

        <g
            id="note_flat"
            fill="#039"
            fill-opacity="1"
            stroke="none"
            stroke-linecap="butt"
            stroke-linejoin="miter"
            stroke-opacity="1"
            stroke-width="1"
            font-family="sans-serif"
            font-size="11.5"
            font-style="normal"
            font-weight="normal"
            letter-spacing="0"
            word-spacing="0"
        >
            {#each sharps as s}
                {#if s.name === note}
                <g
                    id="note_flat_{s.name}"
                    style="line-height:125%"
                    transform="matrix(.61 -.3 .11 1.58 -13 {s.y})"
                >
                    <use
                        xlink:href="#glyph-flat"
                        id="glyph-flat-{s.uId}"
                        font-family="Goudy Stout"
                        font-stretch="normal"
                        font-style="normal"
                        font-variant="normal"
                        font-weight="normal"
                        style="-inkscape-font-specification:&quot;Goudy Stout&quot;"
                    />
                </g>
                {/if}
            {/each}
        </g>



        <g
            id="note_sharp"
            fill="#903"
            fill-opacity="1"
            stroke="none"
        >
            {#each sharps as s}
                {#if s.name === note}
                    <g
                        id="note_sharp_{s.name}"
                        style="line-height:125%"
                        transform="matrix(.81 0 0 .81 20.3 {s.y + 16})"
                    >
                        <use
                            xlink:href="#glyph-sharp"
                            id="glyph-sharp-{s.uId}"
                        />
                </g>
                {/if}
            {/each}
        </g>



        <g
            id="notes_ronde"
            fill="#7b339b"
            fill-opacity="1"
            stroke="none"
            transform="translate(15.0)"
        >
            {#each sharps as s}
                {#if s.name === note}
                    <g
                        id="note_ronde_{s.name}"
                        style="line-height:125%"
                        transform="matrix(1 0 0 .97 9.6 {s.y + 16})"
                    >
                        <!-- <use xlink:href="#glyph-ronde" id="use255-2-0-5-8-0" width="100%" height="100%" x="57.2" y="49" fill="#7b339b" fill-opacity="1"></use> -->
                    

                        <use
                            xlink:href="#glyph-ronde"
                            id="glyph-ronde-{s.uId}"
                        />
                </g>
                {/if}
            {/each}
        </g>
    </g>

    
  {/each}



    
</svg>