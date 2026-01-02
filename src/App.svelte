<script>
	import MainMenu from './scenes/SettingsMenu';
	// import Matchmaking from "./scenes/Matchmaking";
	// import InGame from "./scenes/InGame";
	import TownSquare from './scenes/TownSquare';
	import OriginCave from './scenes/OriginCave';
	import CONFIG from './config';
	import Phaser from 'phaser';

	const phaserConfig = {
		type: Phaser.AUTO,
		width: CONFIG.WIDTH,
		height: CONFIG.HEIGHT,
		backgroundColor: '#32322d',
		scene: [OriginCave, TownSquare],
		pixelArt: true,
		physics: {
			default: 'arcade',
			arcade: {
				debug: true
			}
		}
	};

	new Phaser.Game(phaserConfig);
</script>

<p>PENIS</p>
