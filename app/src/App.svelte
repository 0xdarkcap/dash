<script>
	import { component, ETHprice, BTCprice } from "../scripts/stores";
	import { loadRoute } from "../scripts/utils";
	import Header from "./components/Header.svelte";
	import { onMount } from "svelte";
	import { getPrice } from "../scripts/utils";

	onMount(async () => {
		ETHprice.set(await getPrice("ETH-USD"));
		BTCprice.set(await getPrice("BTC-USD"));
		loadRoute(location.hash, true);
	});
</script>

<Header />
<svelte:component this={$component} />

<style>
	:global(:root) {
		--red: #ff5000;
		--red-dim: #e04700;
		--red-dark: #421500;
		--green: #00d604;
		--green-dim: #00c403;
		--green-dark: #004d01;

		--rich-black: #080808;
		--rich-black-fogra: #0f0f0f;
		--eerie-black: #1a1a1a;
		--jet-dim: #212121;
		--jet: #292929;
		--onyx-dim: #303030;
		--onyx: #3d3d3d;
		--dim-gray: #4a4a4a;
		--sonic-silver: #707070;
		--silver-chalice: #adadad;
		--orange: rgb(253, 167, 20);

		--base-padding: 16px;
		--semi-padding: 8px;
		--base-radius: 4px;

		--chart-resolution-height: 40px;
		--chart-height: 430px;
		--header-height: 60px;
		--ticker-height: 60px;
		--grid-gap: 1px;
	}

	:global(.pos) {
		color: var(--green);
	}
	:global(.neg) {
		color: var(--red);
	}
</style>
