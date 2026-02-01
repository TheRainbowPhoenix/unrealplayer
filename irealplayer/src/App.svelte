<script lang="ts">
	import { onMount } from "svelte";
	import { Parser, Song } from "./lib/parser";
	import { DEFAULT_PLAYLIST } from "./lib/defaults";
	import SongList from "./lib/SongList.svelte";
	import PlaylistPanel from "./lib/PlaylistPanel.svelte";
	import Viewer from "./lib/Viewer.svelte";
	import Controls from "./lib/Controls.svelte";
	import {
		Drawer,
		Button,
		CloseButton,
		Sidebar,
		SidebarGroup,
		SidebarWrapper,
	} from "flowbite-svelte";
	import { FileChartBarSolid as BarsSolid } from "flowbite-svelte-icons";
	import { sineIn } from "svelte/easing";

	let songs: Song[] = [];
	let selectedSong: Song | null = null;
	let drawerHidden = true; // "true" means hidden. Wait, flowbite drawer "hidden" prop: if true, it's hidden.

	// Fetch playlist on mount
	onMount(() => {
		try {
			let rawData = localStorage.getItem("ireal-playlist");

			if (!rawData) {
				console.log("No local playlist found, using defaults.");
				rawData = DEFAULT_PLAYLIST;
				localStorage.setItem("ireal-playlist", rawData);
			}

			const parser = new Parser();
			// @ts-ignore
			songs = parser.parse(rawData);

			if (songs.length > 0) {
				selectedSong = songs[0];
			}
		} catch (e) {
			console.error("Error loading playlist:", e);
		}
	});

	function selectSong(song: Song) {
		if (selectedSong?.title !== song.title) {
			// Clone strictly to avoid reference issues if we mutated it?
			// But our parser creates fresh objects.
			// However, if we modified selectedSong in Controls (transposed),
			// we want to load the *original* again if we click it in the list?
			// For now, let's just use the reference from the `songs` array.
			// IF `songs` array was mutated, we'd have trouble.
			// Transposer.transpose returns a NEW song object, it doesn't mutate the input.
			// So the song in `songs` array remains original. Correct.

			selectedSong = song;
		}
		// On mobile, close drawer
		if (window.innerWidth < 768) {
			drawerHidden = true;
		}
	}

	// Drawer transition params
	let transitionParams = {
		x: -320,
		duration: 200,
		easing: sineIn,
	};

	let showChords = false;

	// Current Key state (bound from Controls)
	let currentKey = "";

	import { tempo } from "./lib/store";

	// Update Hash when state changes
	$: if (selectedSong) {
		const keyToUse = currentKey || selectedSong.key;
		// Construct IReal String
		const s = new Song(
			selectedSong.title,
			selectedSong.composer,
			selectedSong.style,
			keyToUse,
			selectedSong.musicString,
			$tempo.toString(),
		);
		const newHash = s.toIRealString();
		// Prevent update loop if hash matches
		if (window.location.hash !== "#" + newHash) {
			// Basic debounce check or identity check?
			// Since newHash is derived from state, setting hash here is side-effect.
			// If hash changes, onMount doesn't re-run.
			// Hash change event? Not using hashchange listener.
			window.location.hash = newHash;
		}
	}

	// Handle Hash on mount
	onMount(() => {
		try {
			let rawData = localStorage.getItem("ireal-playlist");
			if (!rawData) {
				console.log("No local playlist found, using defaults.");
				rawData = DEFAULT_PLAYLIST;
				localStorage.setItem("ireal-playlist", rawData);
			}

			const parser = new Parser();
			// @ts-ignore
			songs = parser.parse(rawData);

			// Check Hash
			const hash = window.location.hash.substring(1);
			let loadedFromHash = false;
			// Basic detection of iReal URL or parsed format
			if (
				hash &&
				(hash.startsWith("irealb://") ||
					hash.startsWith("irealbook://") ||
					hash.includes("="))
			) {
				try {
					const parsedHash = parser.parse(hash);
					if (parsedHash.length > 0) {
						selectedSong = parsedHash[0];
						if (selectedSong.tempo) {
							tempo.set(parseInt(selectedSong.tempo));
						}
						currentKey = selectedSong.key;
						loadedFromHash = true;
					}
				} catch (e) {
					console.error("Error parsing hash:", e);
				}
			}

			if (!loadedFromHash && songs.length > 0) {
				selectedSong = songs[0];
			}
		} catch (e) {
			console.error("Error loading playlist:", e);
		}
	});
</script>

<div class="flex h-screen overflow-hidden bg-gray-900 text-white font-sans">
	<!-- Desktop Sidebar -->
	<div class="w-80 flex-shrink-0 bg-gray-900 hidden md:block">
		<PlaylistPanel
			{songs}
			{selectedSong}
			playlistName="iReal Player"
			on:select={(e) => selectSong(e.detail)}
			on:back={() => console.log("Back clicked")}
		/>
	</div>

	<Drawer
		{transitionParams}
		bind:hidden={drawerHidden}
		id="sidebar-mobile"
		class="bg-gray-900 border-r border-gray-800 w-80 p-0"
	>
		<!-- Use a key block or if check to force re-render if needed? No. -->
		<div class="h-full w-full flex flex-col">
			<Sidebar class="w-full h-full">
				<SidebarWrapper class="bg-gray-900 p-0 h-full">
					<PlaylistPanel
						{songs}
						{selectedSong}
						playlistName="Library"
						on:select={(e) => {
							selectSong(e.detail);
						}}
						on:back={() => (drawerHidden = true)}
					/>
				</SidebarWrapper>
			</Sidebar>
		</div>
	</Drawer>

	<!-- Main Content -->
	<main class="flex-1 flex flex-col relative w-full h-full bg-[#1F2937]">
		<!-- Mobile Header -->
		<div
			class="md:hidden flex items-center p-4 bg-gray-800 border-b border-gray-700 z-20 shadow-md flex-shrink-0"
		>
			<Button
				class="!p-2 text-white hover:bg-gray-700 rounded-lg mr-3"
				onclick={() => (drawerHidden = false)}
			>
				<BarsSolid class="w-6 h-6" />
			</Button>
			<h1 class="text-xl font-bold truncate">
				{selectedSong ? selectedSong.title : "iReal Player"}
			</h1>
		</div>

		<div class="flex-1 overflow-auto bg-[#FDF6E3] relative flex flex-col">
			{#if selectedSong}
				<Viewer song={selectedSong} {showChords} />
			{:else}
				<div
					class="flex items-center justify-center h-full text-gray-500"
				>
					<p>Select a song to start</p>
				</div>
			{/if}
		</div>

		<!-- ControlsOverlay -->
		{#if selectedSong}
			<div class="flex-shrink-0 w-full z-30">
				<Controls song={selectedSong} bind:showChords bind:currentKey />
			</div>
		{/if}
	</main>
</div>

<style>
	/* Custom scrollbar for sidebar */
	::-webkit-scrollbar {
		width: 8px;
	}
	::-webkit-scrollbar-track {
		background: #111827;
	}
	::-webkit-scrollbar-thumb {
		background: #374151;
		border-radius: 4px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: #4b5563;
	}
</style>
