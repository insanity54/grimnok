<script>
	import MainMenu from './scenes/SettingsMenu';
	// import Matchmaking from "./scenes/Matchmaking";
	// import InGame from "./scenes/InGame";
	import World from './scenes/World';
	import CONFIG from './config';
	import Phaser from 'phaser';

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
		scale: {
			parent: 'game',
			mode: Phaser.Scale.RESIZE,
		}
	};

	new Phaser.Game(phaserConfig);
</script>

