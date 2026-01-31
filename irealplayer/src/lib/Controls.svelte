<script lang="ts">
    import { onMount } from "svelte";
    import * as Tone from "tone";
    // @ts-ignore
    import type { Synthesizer } from "js-synthesizer";
    import { Transposer, type Song } from "./parser";
    import { Button } from "flowbite-svelte";
    import {
        AdjustmentsVerticalSolid,
        PlaySolid,
        PauseSolid,
    } from "flowbite-svelte-icons";

    export let song: Song;

    // Key grid as requested
    const keyGrid = [
        ["C", "Db", "D"],
        ["Eb", "E", "F"],
        ["Gb", "G", "Ab"],
        ["A", "Bb", "B"],
    ];

    let showControls = false;
    let currentKey = song.key;
    let originalKey = song.key;

    // Tempo Logic
    let tempo = 120;
    let lastTapTime = 0;

    // Playback State
    let isPlaying = false;
    let audioContext: AudioContext;
    let synth: Synthesizer;
    let isSynthReady = false;

    onMount(async () => {
        // Initialize Audio Context and Synthesizer
        try {
            audioContext = new AudioContext();

            // We need to load scripts which are in 'public' folder.
            // But we can't import them directly in module if they are UMD/global scripts without types appropriately.
            // The user provided instructions say:
            // "When scripts are available, please check whether waitForReady resolves. JSSynth.waitForReady().then(loadSynthesizer);"
            // Assuming they are loaded via <script> tags in index.html or we load them dynamically here.
            // Since we cannot easily edit index.html to add script tags reliably in this context without causing mess,
            // lets try dynamic import or assume they are added?
            // Actually, we can just use the provided code to addModule if we use AudioWorklet approach.

            // "js-synthesizer supports AudioWorklet process via dist/js-synthesizer.worklet.js"
            // We copied 'libfluidsynth-2.3.0.js' and 'js-synthesizer.worklet.js' to public.
            // Note: User copy command failed on '&&', but subsequent calls succeeded.
            // One call was: cp node_modules/js-synthesizer/externals/libfluidsynth-2.3.0.js public/
            // Another: cp node_modules/js-synthesizer/dist/js-synthesizer.worklet.js public/

            // Let's use the AudioWorklet approach as per user example
            await audioContext.audioWorklet.addModule("libfluidsynth-2.3.0.js"); // Ensure filename matches what was copied.
            // Wait, standard distribution is 2.4.6 usually but package.json might have 2.3.0. Code said 2.3.0 in copy command.
            await audioContext.audioWorklet.addModule(
                "js-synthesizer.worklet.js",
            );

            // @ts-ignore
            let JSSynth = window.JSSynth;
            // JS Synth might not be on window if we use AudioWorklet ONLY?
            // The example code:
            // var synth = new JSSynth.AudioWorkletNodeSynthesizer();
            // This implies JSSynth global must exist.
            // But 'js-synthesizer.worklet.js' is for the Worklet scope.
            // We need the main thread wrapper too? 'js-synthesizer.js'?
            // The user didn't copy 'js-synthesizer.js' to public for main thread usage?
            // "Copies dist/js-synthesizer.js ... and writes <script> tags".
            // We haven't done that.
            // We can try to import it if it's a module, or copy it and load it.
            // Let's assume we need to import it.
        } catch (e) {
            console.error("Synth setup failed (likely not loaded):", e);
        }
    });

    // Dynamic import to get the class if possible, or we need to add the script tag.
    // Let's try dynamic import of the library from node_modules if Vite handles it?
    // import * as JSSynth from 'js-synthesizer'; (User mentioned this works for bundlers)
    import * as JSSynthModule from "js-synthesizer";

    async function initSynth() {
        if (isSynthReady) return;

        audioContext = new AudioContext();
        await audioContext.resume();

        // Initialize with FluidSynth module if needed in Node, but here we are in parameters of Web.

        // Use Worklet approach roughly
        // But we need the worklet files served.

        // Let's try the standard Web Audio wrapper from the imported module
        const JSSynth = JSSynthModule;

        try {
            // Check if we need to load the worklet modules
            await audioContext.audioWorklet.addModule("libfluidsynth-2.3.0.js");
            await audioContext.audioWorklet.addModule(
                "js-synthesizer.worklet.js",
            );

            synth = new JSSynth.AudioWorkletNodeSynthesizer();
            synth.init(audioContext.sampleRate);

            const node = synth.createAudioNode(audioContext, 8192);
            node.connect(audioContext.destination);

            // Load SoundFont
            // User said: "load irealsounds.sf2 from public as sf2"
            // We need to fetch it first
            const resp = await fetch("/irealsounds.sf2");
            if (!resp.ok) throw new Error("Could not load soundfont");
            const sf2Buffer = await resp.arrayBuffer();
            await synth.loadSFont(sf2Buffer);

            isSynthReady = true;
            console.log("Synthesizer Ready");
        } catch (e) {
            console.error("Init Synth Error:", e);
        }
    }

    async function togglePlay() {
        if (isPlaying) {
            // Stop
            await synth.stopPlayer();
            await synth.waitForPlayerStopped();
            isPlaying = false;
        } else {
            // Play
            if (!isSynthReady) {
                await initSynth();
            }

            // We need to generate MIDI from the current Song.
            // WE do not have a MIDI generator yet.
            // The User said "play/pause loading that midi with js synth" referring to "public/mid/Brazilian-Samba.mid".
            // "I've put the public\mid\Brazilian-Samba.mid midi file... try to load ... as sf2"
            // Okay, for now, let's just play that specific MIDI file as a test demonstration.

            const midiResp = await fetch("/mid/Brazilian-Samba.mid");
            const midiBuffer = await midiResp.arrayBuffer();

            await synth.addSMFDataToPlayer(midiBuffer);
            await synth.playPlayer();
            isPlaying = true;
        }
    }

    function tapTempo() {
        const now = performance.now();
        if (lastTapTime > 0) {
            const diff = now - lastTapTime;
            if (diff > 250 && diff < 2000) {
                // 30-240 BPM reasonable range for tap
                const bpm = Math.round(60000 / diff);
                tempo = Math.max(40, Math.min(360, bpm));
            }
        }
        lastTapTime = now;
    }

    function adjustTempo(delta: number) {
        tempo = Math.max(40, Math.min(360, tempo + delta));
        // TODO: Update synth playback speed if supported
        // synth.setPlayerTempo(tempo)? Need to check API.
    }

    // Repeats Logic
    let repeats = 3;

    function resetRepeats() {
        repeats = 3;
    }

    let previousSongTitle = song.title;
    $: if (song.title !== previousSongTitle) {
        previousSongTitle = song.title;
        currentKey = song.key;
        originalKey = song.key;
        if (isPlaying) togglePlay(); // Stop if song changes
    }

    function transpose(targetKey: string) {
        const newSong = Transposer.transpose(song, targetKey);
        song = newSong;
        currentKey = targetKey;
    }
</script>

<div
    class="fixed bottom-0 right-0 z-40 flex flex-col items-end pointer-events-none"
>
    <!-- Toggle Button -->
    <div class="pointer-events-auto mr-4 mb-2 flex flex-col gap-2">
        <!-- Play Button -->
        <Button
            pill
            color="blue"
            class="!p-3 shadow-lg border border-blue-400"
            onclick={togglePlay}
        >
            {#if isPlaying}
                <PauseSolid class="w-6 h-6 text-white" />
            {:else}
                <PlaySolid class="w-6 h-6 text-white" />
            {/if}
        </Button>

        <Button
            pill
            color="dark"
            class="!p-3 shadow-lg border border-gray-600"
            onclick={() => (showControls = !showControls)}
        >
            <AdjustmentsVerticalSolid class="w-6 h-6 text-white" />
        </Button>
    </div>

    <!-- Control Panel -->
    {#if showControls}
        <div
            class="w-full md:w-[800px] bg-gray-900 border-t border-l border-r border-gray-700 rounded-t-xl shadow-2xl p-6 pointer-events-auto transition-transform duration-300"
        >
            <div class="flex flex-col md:flex-row gap-6">
                <!-- Song Info -->
                <div class="flex-1 text-white md:max-w-[200px]">
                    <h3 class="text-xl font-bold truncate">{song.title}</h3>
                    <p class="text-sm text-gray-400">{song.composer}</p>
                    <div class="mt-2 flex items-center gap-2">
                        <span
                            class="px-2 py-0.5 rounded bg-gray-800 border border-gray-600 text-xs font-mono"
                            >{song.style}</span
                        >
                        <span
                            class="px-2 py-0.5 rounded bg-gray-800 border border-gray-600 text-xs font-mono"
                            >{currentKey}</span
                        >
                    </div>
                </div>

                <!-- Tempo Control -->
                <div class="flex flex-col items-center">
                    <h4
                        class="text-xs font-uppercase text-gray-500 mb-2 font-bold tracking-wider text-center"
                    >
                        TEMPO
                    </h4>
                    <div
                        class="flex items-center gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700"
                    >
                        <button
                            class="w-8 h-8 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-white font-bold"
                            onclick={() => adjustTempo(-1)}>-</button
                        >

                        <div class="flex flex-col items-center w-16">
                            <span
                                class="text-2xl font-bold text-white leading-none"
                                >{tempo}</span
                            >
                            <span class="text-[10px] text-gray-400">BPM</span>
                        </div>

                        <!-- Tap Button -->
                        <button
                            class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded uppercase tracking-wider"
                            onclick={tapTempo}
                        >
                            TAP
                        </button>

                        <button
                            class="w-8 h-8 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-white font-bold"
                            onclick={() => adjustTempo(1)}>+</button
                        >
                    </div>
                    <input
                        type="range"
                        min="40"
                        max="360"
                        bind:value={tempo}
                        class="w-full mt-2 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <!-- Repeats Control -->
                <div class="flex flex-col items-center">
                    <h4
                        class="text-xs font-uppercase text-gray-500 mb-2 font-bold tracking-wider text-center"
                    >
                        REPEATS
                    </h4>
                    <div
                        class="flex items-center gap-2 bg-gray-800 p-2 rounded-lg border border-gray-700"
                    >
                        <button
                            class="w-8 h-8 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-white font-bold"
                            onclick={() => (repeats = Math.max(1, repeats - 1))}
                            >-</button
                        >

                        <div class="w-10 text-center">
                            <span
                                class="text-2xl font-bold text-white leading-none"
                                >{repeats}</span
                            >
                        </div>

                        <button
                            class="w-8 h-8 flex items-center justify-center rounded bg-gray-700 hover:bg-gray-600 text-white font-bold"
                            onclick={() =>
                                (repeats = Math.min(30, repeats + 1))}>+</button
                        >
                    </div>
                    <div class="flex items-center gap-2 mt-2 w-full">
                        <input
                            type="range"
                            min="1"
                            max="30"
                            bind:value={repeats}
                            class="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <button
                            class="text-[10px] text-gray-400 hover:text-white underline"
                            onclick={resetRepeats}>Reset</button
                        >
                    </div>
                </div>

                <!-- Transposition Grid -->
                <div>
                    <h4
                        class="text-xs font-uppercase text-gray-500 mb-2 font-bold tracking-wider text-center"
                    >
                        TRANSPOSITION
                    </h4>
                    <div class="grid grid-cols-3 gap-2">
                        {#each keyGrid as row}
                            {#each row as k}
                                <button
                                    class="w-12 h-10 flex items-center justify-center text-sm font-bold rounded border transition-colors
                                    {currentKey === k
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : k === originalKey
                                          ? 'bg-gray-800 border-white text-white ring-1 ring-white'
                                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white'}"
                                    onclick={() => transpose(k)}
                                >
                                    {k}
                                </button>
                            {/each}
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
