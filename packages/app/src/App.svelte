<script lang="ts">
	// import MainMenu from './scenes/SettingsMenu';
	import World from './scenes/World';
	import Phaser from 'phaser';
	import { PhaserNavMeshPlugin } from 'phaser-navmesh/src';
	import 'window.nostr.js'; // this gets configured in nostr.ts. Load order is important;

	// @see https://github.com/fiatjaf/window.nostr.js
	window.wnjParams = {
		// The only accepted value is 'bottom', default is top
		position: 'top',

		// Supported values: cyan (default), green, purple, red, orange, neutral, stone
		accent: 'purple',

		// If the host page has a button that call `getPublicKey` to start a
		// login procedure, the minimized widget can be hidden until connected
		startHidden: true,

		// Show the minimized widget in a compact form
		compactMode: false,

		// If the host page on mobile has an horizontal scrolling, the floating
		// element/modal are pushed to the extreme right/bottom and exit the
		// viewport. A style is injected in the html/body elements fix this.
		// This option permit to disable this default behavior
		disableOverflowFix: false
	};

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
