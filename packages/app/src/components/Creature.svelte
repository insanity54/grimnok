<script module>
	// module-level logic goes here
	// (you will rarely use this)
</script>

<script lang="ts">
	let name = 'ogre';
	let serialNumber = 423;
</script>

<div class="creature-card">
	<h2>{name}</h2>
	<p>SN: {serialNumber}</p>
	<button id="belchBtn">Belch</button>
	<button id="dieBtn">Die</button>
	<button id="spawnBtn">Spawn</button>
</div>


<style>
	.creature-card {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 16px; /* Space between grid items */
	}
</style>
