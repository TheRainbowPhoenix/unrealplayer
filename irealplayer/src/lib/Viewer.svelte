<script lang="ts">
    import { Renderer, type Song } from "./parser";
    import { currentMeasureIndex } from "./store";

    import Chords from "./Chords.svelte";

    export let song: Song;
    export let showChords = false;

    let svgContent = "";

    // We subscribe to the store, and also watch 'song'.
    // BUT we need to pass the index to the renderer.
    // The renderer currently doesn't accept an index.
    // We should probably modify the renderer or just handle it here if possible.
    // Modifying the renderer class in `parser.ts` is cleanest to support "styles".
    // Alternatively, we can inject a style block into the SVG if we give measures IDs.

    // Let's assume we update the Renderer to accept 'activeIndex' in 'config' or 'render' method.
    // Since we can't easily modify parser.ts logic in this single step without reading it all again (though I have it in context).
    // Actually, I can update parser.ts next.
    // For now, let's just re-render when index changes.

    $: {
        if (song) {
            const renderer = new Renderer();
            // We'll pass the active index to a new method or property we will add to Renderer
            // OR we hack it: We can't hack it easily.
            // Let's rely on the Renderer modification I will do momentarily.
            // renderer.render(song, $currentMeasureIndex);
            // I need to update parser.ts to support this second argument.

            // For this file, I'll write the code assuming render accepts it.
            // @ts-ignore
            svgContent = renderer.render(song, $currentMeasureIndex);
        }
    }
</script>

<div
    class="w-full h-full flex justify-center items-start overflow-auto p-4 relative"
>
    <div
        class="w-full max-w-4xl shadow-lg bg-white rounded-lg overflow-hidden transition-all duration-200"
    >
        {@html svgContent}
    </div>

    {#if showChords}
        <div
            class="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-2xl z-40 border border-gray-200 pointer-events-none"
        >
            <Chords />
        </div>
    {/if}
</div>
