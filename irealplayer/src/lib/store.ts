import { writable } from 'svelte/store';
import type { Song } from './parser';

export const isPlaying = writable(false);
export const tempo = writable(120);
export const repeats = writable(3);
export const playbackTime = writable(0);
export const currentMeasureIndex = writable(-1);
export const currentSong = writable<Song | null>(null);

export const midiFiles = [
    { name: "None", path: "" },
    { name: "Blues-Chicago Shuffle", path: "/mid/Blues-Chicago Shuffle.mid" },
    { name: "Blues-Flat Tire", path: "/mid/Blues-Flat Tire.mid" },
    { name: "Blues-Funky", path: "/mid/Blues-Funky.mid" },
    { name: "Blues-Gospel", path: "/mid/Blues-Gospel.mid" },
    { name: "Blues-Lucille", path: "/mid/Blues-Lucille.mid" },
    { name: "Blues-Mo-Slo", path: "/mid/Blues-Mo-Slo.mid" },
    { name: "Blues-Muddy", path: "/mid/Blues-Muddy.mid" },
    { name: "Blues-Nola", path: "/mid/Blues-Nola.mid" },
    { name: "Blues-Shout", path: "/mid/Blues-Shout.mid" },
    { name: "Blues-Slo-Mo", path: "/mid/Blues-Slo-Mo.mid" },
    { name: "Blues-Stax", path: "/mid/Blues-Stax.mid" },
    { name: "Blues-Texas Rock", path: "/mid/Blues-Texas Rock.mid" },
    { name: "Brazilian-Afoxe", path: "/mid/Brazilian-Afoxe.mid" },
    { name: "Brazilian-Baiao", path: "/mid/Brazilian-Baiao.mid" },
    { name: "Brazilian-Bossa Ballad", path: "/mid/Brazilian-Bossa Ballad.mid" },
    { name: "Brazilian-Bossa Cha", path: "/mid/Brazilian-Bossa Cha.mid" },
    { name: "Brazilian-Bossa Nova", path: "/mid/Brazilian-Bossa Nova.mid" },
    { name: "Brazilian-Maracatu", path: "/mid/Brazilian-Maracatu.mid" },
    { name: "Brazilian-Partido Alto", path: "/mid/Brazilian-Partido Alto.mid" },
    { name: "Brazilian-Samba Brush", path: "/mid/Brazilian-Samba Brush.mid" },
    { name: "Brazilian-Samba Fast", path: "/mid/Brazilian-Samba Fast.mid" },
    { name: "Brazilian-Samba Percussion", path: "/mid/Brazilian-Samba Percussion.mid" },
    { name: "Brazilian-Samba", path: "/mid/Brazilian-Samba.mid" },
    { name: "Salsa-Cuba-Afro 6-8", path: "/mid/Salsa-Cuba-Afro 6-8.mid" },
    { name: "Salsa-Cuba-Bolero", path: "/mid/Salsa-Cuba-Bolero.mid" },
    { name: "Salsa-Cuba-Cha Cha Cha", path: "/mid/Salsa-Cuba-Cha Cha Cha.mid" },
    { name: "Salsa-Cuba-Comparsa", path: "/mid/Salsa-Cuba-Comparsa.mid" },
    { name: "Salsa-Cuba-Danzon", path: "/mid/Salsa-Cuba-Danzon.mid" },
    { name: "Salsa-Cuba-Guajira", path: "/mid/Salsa-Cuba-Guajira.mid" },
    { name: "Salsa-Cuba-Guaracha", path: "/mid/Salsa-Cuba-Guaracha.mid" },
    { name: "Salsa-Cuba-Mambo", path: "/mid/Salsa-Cuba-Mambo.mid" },
    { name: "Salsa-Cuba-Mozambique", path: "/mid/Salsa-Cuba-Mozambique.mid" },
    { name: "Salsa-Cuba-Rumba Guaguanco", path: "/mid/Salsa-Cuba-Rumba Guaguanco.mid" },
    { name: "Salsa-Cuba-Son Montuno 2-3", path: "/mid/Salsa-Cuba-Son Montuno 2-3.mid" },
    { name: "Salsa-Cuba-Son Montuno 3-2", path: "/mid/Salsa-Cuba-Son Montuno 3-2.mid" },
    { name: "Salsa-Cuba-Songo", path: "/mid/Salsa-Cuba-Songo.mid" },
    { name: "Salsa-Cuba-Timba", path: "/mid/Salsa-Cuba-Timba.mid" },
    { name: "Salsa-Dominican Republic-Merengue", path: "/mid/Salsa-Dominican Republic-Merengue.mid" },
    { name: "Salsa-Puerto Rico-Bomba", path: "/mid/Salsa-Puerto Rico-Bomba.mid" },
    { name: "Salsa-Puerto Rico-Plena", path: "/mid/Salsa-Puerto Rico-Plena.mid" },
];

export const selectedMidi = writable(midiFiles[0]);
