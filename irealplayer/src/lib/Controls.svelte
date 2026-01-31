<script lang="ts">
    import { Transposer, type Song } from "./parser";
    import { Button } from "flowbite-svelte";
    import { AdjustmentsVerticalSolid } from "flowbite-svelte-icons";

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
    }

    // Repeats Logic
    let repeats = 3;

    function resetRepeats() {
        repeats = 3;
    }

    // We detect if the song object changed completely (new song selected from list)
    // to reset the displayed key, OR we rely on the parent passing a fresh song.
    // Ideally, when a new song is loaded, we should respect its original key.

    let previousSongTitle = song.title;
    $: if (song.title !== previousSongTitle) {
        previousSongTitle = song.title;
        currentKey = song.key;
        originalKey = song.key;
        // Optionally reset tempo/repeats if stored in song, for now keep global or reset
    }

    function transpose(targetKey: string) {
        // Transpose returns a new Song object
        // We modify the prop 'song' which is bound in parent
        const newSong = Transposer.transpose(song, targetKey);
        song = newSong;
        currentKey = targetKey;
    }
</script>

<div
    class="fixed bottom-0 right-0 z-40 flex flex-col items-end pointer-events-none"
>
    <!-- Toggle Button -->
    <div class="pointer-events-auto mr-4 mb-2">
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
