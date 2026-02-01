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

	<!-- Mobile Drawer -->
	<!-- Use standard Tailwind fixed positioning for the drawer overlay and content if Component is tricky with bind:hidden or just ensure class handles it. 
         Flowbite Drawer uses 'hidden' prop. If true, it adds 'hidden' class usually. 
         The issue "drawer is empty" might be because the Sidebar needs standard content structure. 
         Wait, we removed the header and close button from the drawer itself, delegating it to PlaylistPanel?
         No, PlaylistPanel has its own header. The Drawer content was:
         
		<div class="flex items-center justify-between mb-4">...</div>
		<Sidebar class="w-full">...</Sidebar>

         We replaced it with just Sidebar > PlaylistPanel. 
         The PlaylistPanel has a header.
         
         If the drawer is empty, maybe the style/height is zero?
         We set w-80 p-0 for the Drawer class.
         Inside is Sidebar w-full h-full. SidebarWrapper h-full. 
         PlaylistPanel has h-full.
         
         Re: "unable to be closed by click" -> The backdrop click built into Drawer should work if 'transitionType="fly"' is used with params.
         Ideally, we should ensure the Drawer component is receiving the right props.
    -->
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
			class="p-4 flex items-center md:hidden bg-gray-900 border-b border-gray-800"
		>
			<Button
				color="dark"
				class="mr-3"
				onclick={() => (drawerHidden = false)}
				><BarsSolid class="w-6 h-6" /></Button
			>
			<span class="font-bold">iReal Player</span>
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
			<Controls bind:song={selectedSong} bind:showChords />
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
