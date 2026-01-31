<script lang="ts">
    import { Renderer, type Song } from "./parser";

    export let song: Song;

    let svgContent = "";

    $: {
        if (song) {
            const renderer = new Renderer();
            svgContent = renderer.render(song);
        }
    }
</script>

<div class="w-full h-full flex justify-center items-start overflow-auto p-4">
    <div class="w-full max-w-4xl shadow-lg bg-white rounded-lg overflow-hidden">
        {@html svgContent}
    </div>
</div>
