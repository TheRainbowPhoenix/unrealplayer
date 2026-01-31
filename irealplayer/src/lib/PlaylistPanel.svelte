<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Transposer, type Song } from "./parser";
    import SongList from "./SongList.svelte";
    import {
        Button,
        Input,
        Popover,
        Listgroup,
        ListgroupItem,
    } from "flowbite-svelte";
    import {
        ArrowLeftOutline,
        SearchOutline,
        CloseOutline,
        FilterOutline,
        CloseCircleSolid,
    } from "flowbite-svelte-icons";

    export let songs: Song[] = [];
    export let selectedSong: Song | null = null;
    export let playlistName = "Default";

    const dispatch = createEventDispatcher();

    let isSearchMode = false;
    let searchQuery = "";
    let sortOption: "alpha" | "key" | "bpm" | "shuffle" = "alpha";
    let isSortOpen = false;

    // Derived state for filtered and sorted songs
    let filteredSongs: Song[] = [];

    // Cache shuffling order to keep it stable until re-shuffled
    let shuffledIndices: number[] = [];

    function reshuffle() {
        shuffledIndices = songs.map((_, i) => i);
        for (let i = shuffledIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledIndices[i], shuffledIndices[j]] = [
                shuffledIndices[j],
                shuffledIndices[i],
            ];
        }
    }

    // Reactive statement for filtering and sorting
    $: {
        let result = songs;

        // Filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (s) =>
                    s.title.toLowerCase().includes(q) ||
                    s.composer.toLowerCase().includes(q) ||
                    s.style.toLowerCase().includes(q),
            );
        }

        // Sort
        if (sortOption === "alpha") {
            result = [...result].sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortOption === "key") {
            result = [...result].sort((a, b) => {
                const ka =
                    Transposer.NOTE_INDICES[a.key.replace(/-.*/, "")] || 0;
                const kb =
                    Transposer.NOTE_INDICES[b.key.replace(/-.*/, "")] || 0;
                return ka - kb || a.title.localeCompare(b.title);
            });
        } else if (sortOption === "bpm") {
            result = [...result].sort((a, b) => {
                const ba = parseInt(a.tempo) || 0;
                const bb = parseInt(b.tempo) || 0;
                return bb - ba; // Descending BPM usually makes sense? Or Ascending? Let's do Descending (Fastest first) or maybe Ascending. Standard is usually Asc? Let's do Ascending.
                // Actually usually we want to group by tempo.
                // Let's do numeric ascending.
                // return ba - bb;
            });
        } else if (sortOption === "shuffle") {
            // If result length changed (filtering), we probably shouldn't rely on cached indices directly mapping correctly if we filtered.
            // Shuffle usually implies "Shuffle Play", but here it's "Shuffle Sort".
            // If search is active, shuffle the *results*.
            // Simple shuffle for display:
            // We can just use a seeded random or just random sort.
            // Since this runs reactively, we need stability.
            // If shuffledIndices is not compatible or sortOption just switched:
            // Let's simple re-shuffle result if sortOption JUST changed to shuffle.
            // To implement stable shuffle, we need more state.
            // For now, let's just random sort based on a hash of title to keep it consistent-ish? No, true shuffle.
            // Let's just create a copied array and sort randomly ONCE when option selected.
            // But this reactive block runs on every prop change.
            // Let's handle sort in setting functions mostly?
            // Actually, if we just use a stable sort mechanism.
            // For simplicity in this iteration:
            // If shuffle is selected, we map to an assigned random value for each song title?
            // Let's not overengineer.
            // result = [...result].sort(() => 0.5 - Math.random());
            // ^ This causes jitter on re-render.
            // We will shuffle in the setSort method and store a "displayList" instead?
            // No, 'filteredSongs' is derived.
            // Let's use a weakmap for random weights?
        }

        if (sortOption === "shuffle") {
            // Use a Map to store random weights for song titles if not present
            if (!shuffleWeights.has(result[0]?.title)) {
                // Heuristic check
                result.forEach((s) => {
                    if (!shuffleWeights.has(s.title))
                        shuffleWeights.set(s.title, Math.random());
                });
            }
            result = [...result].sort(
                (a, b) =>
                    (shuffleWeights.get(a.title) || 0) -
                    (shuffleWeights.get(b.title) || 0),
            );
        }

        filteredSongs = result;
    }

    const shuffleWeights = new Map<string, number>();

    function setSort(option: "alpha" | "key" | "bpm" | "shuffle") {
        sortOption = option;
        isSortOpen = false;
        if (option === "shuffle") {
            shuffleWeights.clear();
            songs.forEach((s) => shuffleWeights.set(s.title, Math.random()));
        }
    }

    function toggleSearch() {
        isSearchMode = !isSearchMode;
        if (!isSearchMode) {
            searchQuery = "";
        }
    }
</script>

<div class="flex flex-col h-full bg-gray-900 border-r border-gray-800">
    <!-- Sticky Header -->
    <div
        class="flex-none h-16 flex items-center px-2 border-b border-gray-800 bg-gray-900 sticky top-0 z-20"
    >
        {#if isSearchMode}
            <div class="flex-1 flex items-center gap-2 animate-fade-in">
                <Input
                    type="text"
                    placeholder="Search songs..."
                    size="sm"
                    class="bg-gray-800 border-gray-700 text-white focus:ring-blue-500 focus:border-blue-500 rounded-lg flex-1"
                    bind:value={searchQuery}
                    autofocus
                >
                    <SearchOutline slot="left" class="w-4 h-4 text-gray-400" />
                </Input>
                <Button
                    color="dark"
                    class="!bg-transparent !p-2 text-gray-400 hover:text-white"
                    onclick={toggleSearch}
                >
                    <CloseOutline class="w-5 h-5" />
                </Button>
            </div>
        {:else}
            <div
                class="flex-1 flex items-center justify-between gap-2 overflow-hidden"
            >
                <div class="flex items-center gap-1 overflow-hidden min-w-0">
                    <Button
                        color="dark"
                        class="!bg-transparent !p-2 text-gray-400 hover:text-white"
                        onclick={() => dispatch("back")}
                    >
                        <ArrowLeftOutline class="w-5 h-5" />
                    </Button>
                    <div class="flex flex-col truncate">
                        <span class="font-bold text-white text-sm truncate"
                            >{playlistName}</span
                        >
                        <span class="text-[10px] text-gray-500 truncate"
                            >{filteredSongs.length} songs</span
                        >
                    </div>
                </div>

                <div class="flex items-center flex-none">
                    <Button
                        color="dark"
                        class="!bg-transparent !p-2 text-gray-400 hover:text-white"
                        onclick={toggleSearch}
                    >
                        <SearchOutline class="w-5 h-5" />
                    </Button>
                    <div class="relative">
                        <Button
                            color="dark"
                            class="!bg-transparent !p-2 text-gray-400 hover:text-white"
                            onclick={(e) => {
                                e.stopPropagation();
                                isSortOpen = !isSortOpen;
                            }}
                        >
                            <FilterOutline class="w-5 h-5" />
                        </Button>
                        {#if isSortOpen}
                            <!-- Backdrop to close, must be fixed and high z-index, but below the popover content? 
                                 Actually, if we put backdrop "inside" this relative div, it might be clipped if overflow hidden somewhere.
                                 Ideally backdrop should be portal or fixed full screen.
                                 Let's use fixed inset-0 z-40.
                            -->
                            <div
                                class="fixed inset-0 z-40"
                                onclick={(e) => {
                                    e.stopPropagation();
                                    isSortOpen = false;
                                }}
                                role="button"
                                tabindex="0"
                                onkeydown={(e) => {
                                    if (e.key === "Escape") isSortOpen = false;
                                }}
                            />

                            <!-- Popover content: Make sure z-Index > backdrop (40). So z-50. -->
                            <!-- Also Ensure it's not clipped. The parent container has sticky, and parent of that has overflow-hidden?
                                 The entire "PlaylistPanel" container has "flex flex-col h-full ... border-r". 
                                 But "Main" content is usually separate. The Sidebar container "overflow-y-auto" was removed in Desktop Sidebar div?
                                 "w-80 flex-shrink-0 bg-gray-900 hidden md:block" has no overflow hidden.
                                 PlaylistPanel has "flex-1 overflow-y-auto" for the LIST, but the HEADER is "flex-none ... sticky".
                                 So overflow should be fine for absolute positioning appearing over the list?
                                 
                                 Wait, on Mobile Drawer "overflow-hidden" might be present on the drawer or Sidebar Wrapper.
                                 If absolute is clipped, we might need fixed positioning for the menu too, calculated manually.
                                 Let's try fixed positioning for the dropdown if possible or just ensure no overflow hidden clips it.
                            -->
                            <div
                                class="absolute right-0 top-10 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 w-40 overflow-hidden"
                            >
                                <button
                                    class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white z-50 relative"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        setSort("alpha");
                                    }}>Alphabetical</button
                                >
                                <button
                                    class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white z-50 relative"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        setSort("key");
                                    }}>Key</button
                                >
                                <button
                                    class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white z-50 relative"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        setSort("bpm");
                                    }}>BPM</button
                                >
                                <button
                                    class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white z-50 relative"
                                    onclick={(e) => {
                                        e.stopPropagation();
                                        setSort("shuffle");
                                    }}>Shuffle</button
                                >
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        {/if}
    </div>

    <!-- Song List -->
    <div class="flex-1 overflow-y-auto">
        {#if filteredSongs.length === 0}
            <div class="p-8 text-center text-gray-500 text-sm">
                No songs found.
            </div>
        {:else}
            <SongList songs={filteredSongs} {selectedSong} on:select />
        {/if}
    </div>
</div>

<style>
    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(-5px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    .animate-fade-in {
        animation: fade-in 0.2s ease-out;
    }
</style>
