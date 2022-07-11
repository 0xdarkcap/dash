<script>
    import Volume from "../charts/Volume.svelte";
    import { SPINNER_ICON } from "../../scripts/icons";
    import { onMount } from "svelte";
    import { getData } from "../../scripts/utils";
    import { dayDataETH, dayDataUSDC } from "../../scripts/stores";
    let loading = true;

    onMount(async () => {
        dayDataETH.set(await getData(true));
        dayDataUSDC.set(await getData(false));
        loading = false;
    });
</script>

{#if loading}
    <div class="empty">
        <div class="loading-icon">{@html SPINNER_ICON}</div>
    </div>
    <div>
        <center><h1>Fetching Data</h1></center>
    </div>
{:else}
    <div class="flex-container">
        <div class="chart">
            <Volume />
        </div>
        <!-- <div class="chart">
            <Volume />
        </div>
        <div class="chart">
            <Volume />
        </div>
        <div class="chart">
            <Volume />
        </div> -->
    </div>
{/if}

<style>
    .flex-container {
        margin: 10px;
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
    }
    .chart {
        width: 100vh;
        margin: auto;
        margin-top: 20px;
    }
    .loading-icon :global(svg) {
        height: 50px;
    }
    .empty {
        padding-top: 10%;
        display: flex;
        justify-content: center;
    }
</style>
