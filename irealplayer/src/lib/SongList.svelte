<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import type { Song } from "./parser";

    export let songs: Song[] = [];
    export let selectedSong: Song | null = null;

    const dispatch = createEventDispatcher();
</script>

<div class="flex flex-col space-y-1 p-2">
    {#each songs as song}
        <button
            class="text-left px-4 py-2 hover:bg-gray-700 rounded w-full truncate border-b border-gray-700 last:border-0 transition-colors duration-200 {selectedSong ===
            song
                ? 'bg-gray-800 text-white'
                : 'text-gray-300'}"
            onclick={() => dispatch("select", song)}
        >
            <div class="font-bold truncate text-sm">{song.title}</div>
            <div class="text-xs text-gray-400 truncate">{song.composer}</div>
            <div class="flex items-center text-[10px] text-gray-500 mt-1 gap-2">
                <div class="flex-1 truncate min-w-0">{song.style}</div>
                {#if song.tempo}
                    <div class="flex-none whitespace-nowrap">
                        {song.tempo} bpm
                    </div>
                {/if}
                <div
                    class="flex-none font-mono text-gray-400 border border-gray-600 px-1 rounded bg-gray-800"
                >
                    {song.key}
                </div>
            </div>
        </button>
    {/each}
</div>
