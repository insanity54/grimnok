<script>
	import MainMenu from './scenes/SettingsMenu';
	// import Matchmaking from "./scenes/Matchmaking";
	// import InGame from "./scenes/InGame";
	import World from './scenes/World';
	import CONFIG from './config';
	import Phaser from 'phaser';
	import { PhaserNavMeshPlugin } from "phaser-navmesh";

	const phaserConfig = {
		type: Phaser.AUTO,
		backgroundColor: '#32322d',
		scene: [World],
		pixelArt: true,
		physics: {
			default: 'arcade',
			arcade: {
				debug: true
			}
		},
		plugins: {
			scene: [
				{
					key: 'NavMeshPlugin', // Key to store the plugin class under in cache
					plugin: PhaserNavMeshPlugin, // Class that constructs plugins
					mapping: 'navMeshPlugin', // Property mapping to use for the scene, e.g. this.navMeshPlugin
					start: true
				}
			]
		},
		scale: {
			parent: 'game',
			mode: Phaser.Scale.RESIZE
		}
	};

	new Phaser.Game(phaserConfig);
</script>
