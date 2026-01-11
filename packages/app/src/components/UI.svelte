<script module>
	// module-level logic goes here
	// (you will rarely use this)
</script>

<script lang="ts">
	import { BROWSER, DEV } from 'esm-env';
	import { on } from 'svelte/events';
	import { Identicon } from 'svelte-identicons';
	import nakama from '$lib/nakama';
	import { createNip98Token } from '$lib/nostr';



	async function getAuthChallenge () {
		
	}

	/**
	 * We use NIP-98 to authenticate.
	 * @see https://github.com/nostr-protocol/nips/blob/master/98.md
	 */
	async function solveAuthChallenge() {

	}
	
	

	async function login() {
		
		nostrPublicKey = await window.nostr.getPublicKey();
		const nip98Token = await createNip98Token();
		// const signed = window.nostr.signEvent();
		// const customId = 
		await nakama.authenticate(nip98Token.tokenData.tokenValue);
	}

	function logout() {
		
		window.nostr._pubkey = '';
		nostrPublicKey = '';
	}

	function decrement() {
		count--;
	}

	function increment() {
		count++;
	}

	let nostrPublicKey = $state('');
	let count = $state(0);

	let name = 'ogre'; // Consider using this in your logic

	const handleNostrLogin = async (e: Event) => {
		nostrPublicKey = await window.nostr.getPublicKey();
	};

	const handleNostrLogout = async (e: Event) => {
		nostrPublicKey = '';
	}

	// Use a variable to store the public key
	// let nostrPublicKey = $state('~'); // Default value

	// const nostr = new ReactiveValue(
	// 	BROWSER ? () => window.scrollX : () => undefined,
	// 	(update) => on(document, 'nlAuth', update)
	// );

	// let sub = createSubscriber((update) => {});

	// let nlAuthEvent = new NlAuthEvent();
	// $derived(nlAuth);

	// let authData;

	// Handle the event and specify how you want to react
	// function handleNlAuth(event: any) {
	//     authData = event.detail; // Access any data passed with the event
	// }

	// onMount(() => {
	//     nlAuth.trigger(); // Start listening for the event
	//     document.addEventListener('nlAuth', handleNlAuth);

	//     // Cleanup on component destroy
	//     return () => {
	//         document.removeEventListener('nlAuth', handleNlAuth);
	//     };
	// });

	// let idk = new ReactiveValue(
	// 	BROWSER ? () => window.nostr._publickey : () => '', (update: any) =>
	// 	on(window, 'nlAuth', update)
	// );

	// createSubscriber();

	// $effect(() => {
	// 	// on(window, 'nostr', cunt);

	// 	// on(
	// 	// 	document,
	// 	// 	'nlAuth',
	// 	// 	async () => {
	// 	// 		console.log('nlAuth detected!');
	// 	// 		nostrPublicKey = await window.nostr?.getPublicKey();
	// 	// 	},
	// 	// 	{}
	// 	// );

	// 	on(
	// 		document,
	// 		'nlLogout',
	// 		async () => {
	// 			console.log('nlLogout detected!');
	// 			// nostrPublicKey = await window.nostr?.getPublicKey();
	// 		},
	// 		{}
	// 	);
	// });

	// if (typeof window !== 'undefined' && window.nostr && window.nostr._publickey) {
	// 	window.nostr.getPublicKey().then((key: string) => {
	// 		nostrPublicKey = key;
	// 	});
	// }
</script>

<!--
	This is for nostr-login which I'm not using due to unmaintained status https://github.com/nostrband/nostr-login/issues/171#issuecomment-3167493129
	<svelte:document 
	onnlAuth={handleNostrLogin} 
	onnlEnd={handleNostrLogout}
/> -->

<div>
	<div class="game-ui">
		<div class="left-button-group">
			<button id="cast" class="button button-brown">Cast Spell</button>
			<button id="heal" class="button button-brown">Heal</button>
			<button id="ult" class="button button-brown">Ultimate</button>
		</div>
		<div class="right-button-group">

			{#if nostrPublicKey == ''}
				<button id="login" class="button button-purple" onclick={login}>Nostr Login</button>
			{:else}
				
				<button id="logout" class="button button-brown" onclick={logout}>Logout</button>
			{/if}
			<span>{nostrPublicKey.substring(0, 6)}</span>

			<!-- <Identicon
				seed={nostrPublicKey}
				height={32}
				width={32}
				pixelSize={1}
				numberOfColors={2}
				symetry="central"
				text={nostrPublicKey}
				textColor="#ffffff"
			/> -->
		</div>
	</div>
</div>

<style>
	.game-ui {
		position: absolute; /* Keep the UI positioned absolutely */
		bottom: 0; /* Position it at the bottom */
		left: 0;
		width: 100%;
		height: auto; /* Change height to auto to fit the buttons */
		z-index: 1000;
		display: flex; /* Use flexbox for layout */
		justify-content: space-between; /* Space out the left and right buttons */
		padding: 10px; /* Add some padding to the container */
		box-sizing: border-box; /* Include padding in width calculations */
	}

	.left-button-group {
		display: flex; /* Align buttons horizontally */
	}

	.right-button-group {
		display: flex; /* Align buttons horizontally */
		align-items: center;
		/* Removed justify-content since flex-end keeps it aligned to the right */
	}

	/* Added this to ensure proper handling of overflow */
	.right-button-group {
		margin-left: auto; /* Push the right button group to the far right */
	}
</style>
