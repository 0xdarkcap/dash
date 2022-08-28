<script>
  import Volume from '../charts/Volume.svelte';
  import { SPINNER_ICON } from '../../scripts/icons';
  import { onMount } from 'svelte';
  import { getVolumeData, getPositionsData } from '../../scripts/utils';
  import {
    dayData,
    positionsDataBTC,
    positionsDataETH,
  } from '../../scripts/stores';
  import Scatter from '../charts/Scatter.svelte';
  import Revenue from '../charts/Revenue.svelte';
  import Pnl from '../charts/Pnl.svelte';
  import { ETHUSD, BTCUSD, ETH, USDC } from '../../scripts/constants';
  import LiqArea from '../charts/LiqArea.svelte';
  import Pool from './Pool.svelte';
  let loading = true;

  onMount(async () => {
    dayData.set(await getVolumeData());
    const queryOptions = {
      product: ETHUSD,
      orderBy: 'liquidationPrice',
      orderDirection: 'asc',
      first: 1000,
    };
    positionsDataETH.set(await getPositionsData(queryOptions));
    queryOptions.product = BTCUSD;
    positionsDataBTC.set(await getPositionsData(queryOptions));
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
      <Pool currency={ETH} />
    </div>
    <div class="chart">
      <Pool currency={USDC} />
    </div>
    <div class="chart">
      <Scatter product="ETH-USD" />
    </div>
    <div class="chart">
      <Pnl product="ETH-USD" />
    </div>
    <div class="chart">
      <Scatter product="BTC-USD" />
    </div>
    <div class="chart">
      <Volume />
    </div>
    <div class="chart">
      <Revenue />
    </div>
    <div class="chart">
      <LiqArea product="ETH-USD" />
    </div>
    <div class="chart">
      <LiqArea product="BTC-USD" />
    </div>
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
</style>
