<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    // @ts-ignore
    import type { Synthesizer } from "js-synthesizer";
    import * as JSSynthModule from "js-synthesizer";
    import { Transposer, type Song, getMeasureTimes } from "./parser";
    import { Button, Range, Label, Select, Drawer } from "flowbite-svelte";
    import {
        AdjustmentsVerticalSolid,
        PlaySolid,
        PauseSolid,
        StopSolid,
        ForwardStepSolid,
        BackwardStepSolid,
        VolumeDownSolid,
        VolumeUpSolid,
        GridSolid,
    } from "flowbite-svelte-icons";
    import {
        isPlaying,
        tempo,
        repeats,
        playbackTime,
        currentMeasureIndex,
        midiFiles,
        selectedMidi,
    } from "./store";

    export let song: Song;
    export let showChords = false;

    // Local state for UI
    let controlsVisible = false; // Drawer state
    let currentKey = song.key;
    let originalKey = song.key;
    let durationMap: { start: number; end: number; index: number }[] = [];
    let totalDuration = 0;

    // Synth State
    let audioContext: AudioContext;
    let synth: Synthesizer;
    let isSynthReady = false;

    // Animation Frame ID
    let rafId: number;
    let startTime = 0;
    let elapsedAtPause = 0; // Duration elapsed when paused

    // Metronome State
    let metronomeEnabled = false;
    let currentBeatIndex = -1;

    // Volumes
    let metronomeVolume = 0.5;
    let accompanimentVolume = 0.5;

    // Key Grid
    const keyGrid = [
        ["C", "Db", "D"],
        ["Eb", "E", "F"],
        ["Gb", "G", "Ab"],
        ["A", "Bb", "B"],
    ];

    // -- Initialization --

    onMount(async () => {
        // Pre-calc duration map
        updateDurationMap();
    });

    onDestroy(() => {
        if (rafId) cancelAnimationFrame(rafId);
        stopPlayback();
    });

    $: if (song) {
        if (song.key !== currentKey) {
            // Reset if song prop changes externally or logic
            currentKey = song.key;
            originalKey = song.key;
        }
        updateDurationMap();
    }

    $: if ($tempo) {
        updateDurationMap();
    }

    function updateDurationMap() {
        if (!song) return;
        durationMap = getMeasureTimes(song, $tempo);
        if (durationMap.length > 0) {
            totalDuration = durationMap[durationMap.length - 1].end;
        } else {
            totalDuration = 0;
        }
    }

    // -- Synth Setup --

    async function initSynth() {
        if (isSynthReady) return;
        try {
            audioContext = new AudioContext();
            await audioContext.resume();

            // Load worklets
            await audioContext.audioWorklet.addModule("libfluidsynth-2.3.0.js");
            await audioContext.audioWorklet.addModule(
                "js-synthesizer.worklet.js",
            );

            const JSSynth = JSSynthModule;
            synth = new JSSynth.AudioWorkletNodeSynthesizer();
            synth.init(audioContext.sampleRate);

            const node = synth.createAudioNode(audioContext, 8192);
            node.connect(audioContext.destination);

            // Load SF2
            const resp = await fetch("/irealsounds.sf2");
            if (!resp.ok)
                console.warn("SF2 not found, using default beep?"); // Synth won't play without SF2 usually
            else {
                const sf2Buffer = await resp.arrayBuffer();
                await synth.loadSFont(sf2Buffer);
            }

            isSynthReady = true;
        } catch (e) {
            console.error("Synth Init Error:", e);
        }
    }

    async function loadMidi() {
        if (!synth || !isSynthReady) await initSynth();

        // Reset player first
        // @ts-ignore
        if (synth.resetPlayer) await synth.resetPlayer();

        if ($selectedMidi && $selectedMidi.path) {
            try {
                const resp = await fetch($selectedMidi.path);
                if (resp.ok) {
                    const buff = await resp.arrayBuffer();
                    await synth.addSMFDataToPlayer(buff);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }

    // -- Playback Logic --

    async function togglePlay() {
        if ($isPlaying) {
            pause();
        } else {
            play();
        }
    }

    // State
    let isCountingIn = false;
    let countInBeat = 0; // 0 to 4

    async function play() {
        if (!isSynthReady) await initSynth();

        await loadMidi();

        // Count-in Logic
        // Only count in if starting from near zero (e.g. < 0.1s)
        if ($playbackTime < 0.1) {
            isCountingIn = true;
            countInBeat = -1; // Start at -1
            isPlaying.set(true); // Set playing to enable loop

            // Start Count-in loop
            startTime = performance.now();
            countInLoop();
            return;
        }

        startRealPlayback();
    }

    async function startRealPlayback() {
        isCountingIn = false;

        // Sync fix: User says it's off by one tick (late).
        // This usually means we are setting time/rendering slightly after the audio starts.
        // We can try to tune the visual start time or seek the synth.
        // Or if the synth latency is causing it.
        // Let's try to start visuals and synth as tightly as possible.

        // precise tempo setting using ExternalBpm (1)
        // @ts-ignore
        if (synth.setPlayerTempo) {
            synth.setPlayerTempo(1, $tempo);
        }

        if (synth.setGain) synth.setGain(accompanimentVolume);

        if ($selectedMidi && $selectedMidi.path) {
            await synth.playPlayer();
        }

        isPlaying.set(true);
        // Reset start time relative to current playback position
        startTime = performance.now() - $playbackTime * 1000;

        currentBeatIndex = Math.floor($playbackTime / (60 / $tempo)) - 1;

        loop();
    }

    function countInLoop() {
        if (!$isPlaying) return; // User stopped during count-in

        const now = performance.now();
        const elapsed = (now - startTime) / 1000;
        const beatDur = 60 / $tempo;

        const expectedBeat = Math.floor(elapsed / beatDur);

        if (expectedBeat > countInBeat) {
            countInBeat = expectedBeat;
            // Play Click
            if (countInBeat < 4) {
                playMetronomeClick();
            }
        }

        // Check if count-in finished (4 beats)
        if (elapsed >= beatDur * 4) {
            startRealPlayback();
            return;
        }

        rafId = requestAnimationFrame(countInLoop);
    }

    async function pause() {
        isPlaying.set(false);
        if (rafId) cancelAnimationFrame(rafId);
        if (synth) {
            await synth.stopPlayer(); // Pausing real MIDI player often just stops it in basic synths, or we need pause method.
            // basic logic: stop.
        }
        elapsedAtPause = $playbackTime;
    }

    // Reactive Tempo Update
    $: if ($isPlaying && synth && isSynthReady) {
        // @ts-ignore
        if (synth.setPlayerTempo) synth.setPlayerTempo(1, $tempo);
    }

    // Reactive Volume
    $: if (synth && isSynthReady) {
        if (synth.setGain) synth.setGain(accompanimentVolume);
    }

    function playMetronomeClick() {
        if (!audioContext) return;
        const t = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();

        osc.connect(gain);
        gain.connect(audioContext.destination);

        // Woodblock-ish tone
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);

        gain.gain.setValueAtTime(metronomeVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.start(t);
        osc.stop(t + 0.05);
    }

    // Repeat State
    let currentRepeat = 1;

    function loop() {
        if (!$isPlaying) return;

        const now = performance.now();
        let elapsed = (now - startTime) / 1000;

        // Update Playback Time
        if (elapsed >= totalDuration) {
            if (currentRepeat < $repeats) {
                currentRepeat++;
                startTime = now;
                elapsed = 0;
                currentBeatIndex = -1;
                try {
                    synth.seekPlayer(0);
                } catch (e) {}
            } else {
                stopPlayback();
                return;
            }
        }

        playbackTime.set(elapsed);

        // Metronome Click
        if (metronomeEnabled) {
            const beatDur = 60 / $tempo;
            // Add small offset to anticipate audio loop?
            // Or maybe we are just calculating 'beatIndex' slightly late.
            // If we use floor, at exactly 0.0 we are index 0.
            // currentBeatIndex starts at -1. So 0 > -1 -> Click.
            const beatIndex = Math.floor(elapsed / beatDur);

            // User reported "off by one tick (accompaniment late)".
            // Actually if accompaniment is late, we (visuals) are early?
            // Or the visuals are late compared to sound?
            // "metronome first tick ... off by one tick".
            // If we are strictly checking floor, at 0.999 we are beat 0. At 1.000 we are beat 1.
            // If visuals are delayed by frame time (16ms), we might be seeing beat 1 slightly after it happened.

            if (beatIndex > currentBeatIndex) {
                currentBeatIndex = beatIndex;
                playMetronomeClick();
            }
        }

        // Determine Measure
        const found = durationMap.find(
            (m) => elapsed >= m.start && elapsed < m.end,
        );
        if (found) {
            currentMeasureIndex.set(found.index);
        } else {
            if (elapsed < 0) currentMeasureIndex.set(0);
            else currentMeasureIndex.set(-1);
        }

        rafId = requestAnimationFrame(loop);
    }

    async function stopPlayback() {
        pause();
        playbackTime.set(0);
        elapsedAtPause = 0;
        currentRepeat = 1;
        currentMeasureIndex.set(-1);
    }

    // -- Interaction --

    function onScrub(e: any) {
        const t = parseFloat(e.target.value);
        playbackTime.set(t);
        elapsedAtPause = t;
        if ($isPlaying) {
            // Adjust start time so the loop continues from new time
            startTime = performance.now() - t * 1000;

            // Sync Synth?
            // synth.seekPlayer(ticks)?
            // Difficult to sync generic MIDI file to song form time without complex mapping.
            // For now, visuals seek, backing track restarts or ignores.
            // Let's restart backing playback to keep it roughly sane?
            // synth.seekPlayer usually not available in simple interface.
        }

        // Update highlighted measure immediately for feedback
        const found = durationMap.find((m) => t >= m.start && t < m.end);
        if (found) currentMeasureIndex.set(found.index);
    }

    function transpose(targetKey: string) {
        const newSong = Transposer.transpose(song, targetKey);
        song = newSong;
        currentKey = targetKey;
        updateDurationMap(); // Durations don't change with key, but good to ensure consistency
    }

    let lastTapTime = 0; // Moved from global to local for tapTempo
    function tapTempo() {
        const now = performance.now();
        if (lastTapTime > 0) {
            const diff = now - lastTapTime;
            if (diff > 250 && diff < 2000) {
                const bpm = Math.round(60000 / diff);
                tempo.set(Math.max(40, Math.min(360, bpm)));
            }
        }
        lastTapTime = now;
    }
</script>

<!-- Count-in Overlay -->
{#if isCountingIn}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-none"
    >
        <div class="flex gap-4">
            {#each [1, 2, 3, 4] as i}
                <div
                    class="w-8 h-8 rounded-full border-2 border-white transition-colors duration-100
                    {countInBeat + 1 >= i
                        ? 'bg-blue-500 border-blue-500 scale-110'
                        : 'bg-transparent'}"
                ></div>
            {/each}
        </div>
    </div>
{/if}

<!-- Floating Action Buttons -->
<div
    class="fixed bottom-0 right-0 z-30 flex flex-col items-end pointer-events-none p-4"
>
    <div class="pointer-events-auto flex flex-col gap-3">
        <Button
            pill
            color="light"
            class="!p-4 shadow-xl border border-gray-600 transform hover:scale-110 transition-transform mb-4"
            onclick={() => (showChords = !showChords)}
            title="Toggle Chords"
        >
            <GridSolid class="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </Button>

        <Button
            pill
            color="blue"
            class="!p-4 shadow-xl border-2 border-blue-400 transform hover:scale-110 transition-transform"
            onclick={togglePlay}
        >
            {#if $isPlaying}
                <PauseSolid class="w-6 h-6 text-white" />
            {:else}
                <PlaySolid class="w-6 h-6 text-white" />
            {/if}
        </Button>
        <Button
            pill
            color="dark"
            class="!p-4 shadow-xl border border-gray-600 transform hover:scale-110 transition-transform"
            onclick={() => (controlsVisible = true)}
        >
            <AdjustmentsVerticalSolid class="w-6 h-6 text-white" />
        </Button>
    </div>
</div>

<!-- Bottom Drawer Controls -->
<Drawer
    placement="bottom"
    bind:open={controlsVisible}
    class="bg-gray-900 border-t border-gray-700 p-0"
    transitionParams={{ duration: 300 }}
>
    <div
        class="w-full max-w-4xl mx-auto p-6 flex flex-col gap-6 h-[80vh] md:h-auto overflow-y-auto"
    >
        <!-- Header / Close -->
        <div class="flex justify-between items-start">
            <div>
                <h3 class="text-xl font-bold text-white tracking-tight">
                    {song.title}
                </h3>
                <p class="text-sm text-gray-400">
                    {song.composer} • {song.style}
                </p>
            </div>
        </div>

        <!-- Scrubber -->
        <div class="w-full">
            <div class="flex justify-between text-xs text-gray-400 mb-1">
                <span
                    >{Math.floor($playbackTime / 60)}:{Math.floor(
                        $playbackTime % 60,
                    )
                        .toString()
                        .padStart(2, "0")}</span
                >
                <span
                    >{Math.floor(totalDuration / 60)}:{Math.floor(
                        totalDuration % 60,
                    )
                        .toString()
                        .padStart(2, "0")}</span
                >
            </div>
            <input
                type="range"
                min="0"
                max={totalDuration || 1}
                step="0.1"
                value={$playbackTime}
                oninput={onScrub}
                class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
        </div>

        <!-- Transport Controls -->
        <div class="flex items-center justify-center gap-6">
            <Button
                color="alternative"
                class="hover:text-blue-400 text-gray-300 border-none shadow-none"
                onclick={stopPlayback}
            >
                <StopSolid class="w-8 h-8" />
            </Button>

            <Button
                pill
                color="blue"
                class="!p-5 shadow-lg border-2 border-blue-400 scale-110"
                onclick={togglePlay}
            >
                {#if $isPlaying}
                    <PauseSolid class="w-8 h-8 text-white" />
                {:else}
                    <PlaySolid class="w-8 h-8 text-white pl-1" />
                {/if}
            </Button>
        </div>

        <!-- Settings Grid -->
        <div
            class="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50"
        >
            <!-- Tempo & Repeats -->
            <div class="flex flex-col gap-4">
                <!-- Tempo -->
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <Label
                            class="text-gray-400 text-xs font-bold uppercase tracking-wider"
                            >Tempo</Label
                        >
                        <div class="flex gap-2 items-center">
                            <span class="text-xl font-bold text-white"
                                >{$tempo}</span
                            >
                            <span class="text-xs text-gray-500">BPM</span>

                            <Button
                                size="xs"
                                color={metronomeEnabled
                                    ? "blue"
                                    : "alternative"}
                                class="!px-2 !py-0.5"
                                onclick={() =>
                                    (metronomeEnabled = !metronomeEnabled)}
                                title="Metronome"
                            >
                                {#if metronomeEnabled}
                                    <VolumeUpSolid class="w-3 h-3 text-white" />
                                {:else}
                                    <VolumeDownSolid
                                        class="w-3 h-3 text-gray-400"
                                    />
                                {/if}
                            </Button>

                            <Button
                                size="xs"
                                color="light"
                                class="!px-2 !py-0.5 text-[10px] uppercase font-bold"
                                onclick={tapTempo}>TAP</Button
                            >
                        </div>
                    </div>
                    <Range
                        min="40"
                        max="360"
                        bind:value={$tempo}
                        size="sm"
                        class="accent-blue-500"
                    />
                    <div class="flex justify-between mt-1">
                        <Button
                            color="alternative"
                            size="xs"
                            class="text-gray-400 hover:text-white border-none shadow-none"
                            onclick={() => $tempo--}>-</Button
                        >
                        <Button
                            color="alternative"
                            size="xs"
                            class="text-gray-400 hover:text-white border-none shadow-none"
                            onclick={() => $tempo++}>+</Button
                        >
                    </div>
                </div>

                <!-- Repeats -->
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <Label
                            class="text-gray-400 text-xs font-bold uppercase tracking-wider"
                            >Repeats</Label
                        >
                        <span class="text-xl font-bold text-white"
                            >{$repeats}x</span
                        >
                    </div>
                    <Range min="1" max="10" bind:value={$repeats} size="sm" />
                </div>
            </div>

            <!-- Style & Mix -->
            <div class="flex flex-col gap-4">
                <!-- Accompaniment Select -->
                <div>
                    <Label
                        class="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2"
                        >Accompaniment</Label
                    >
                    <Select
                        items={midiFiles.map((m: any) => ({
                            value: m,
                            name: m.name,
                        }))}
                        bind:value={$selectedMidi}
                        size="sm"
                        class="bg-gray-800 border-gray-600 text-white"
                    />
                </div>

                <!-- Volume Mix -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <Label
                            class="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1"
                            >Backing Vol</Label
                        >
                        <Range
                            min="0"
                            max="1"
                            step="0.01"
                            bind:value={accompanimentVolume}
                            size="sm"
                        />
                    </div>
                    <div>
                        <Label
                            class="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1"
                            >Click Vol</Label
                        >
                        <Range
                            min="0"
                            max="1"
                            step="0.01"
                            bind:value={metronomeVolume}
                            size="sm"
                        />
                    </div>
                </div>

                <!-- Key -->
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <Label
                            class="text-gray-400 text-xs font-bold uppercase tracking-wider"
                            >Key</Label
                        >
                        <span class="text-white font-bold">{currentKey}</span>
                    </div>
                    <div class="grid grid-cols-6 gap-1">
                        {#each ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as k}
                            <button
                                class="text-[10px] sm:text-xs font-bold py-1.5 rounded transition-colors border
                                {currentKey === k
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'}"
                                onclick={() => transpose(k)}
                            >
                                {k}
                            </button>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
</Drawer>
