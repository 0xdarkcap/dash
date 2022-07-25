<script>
  import { onMount } from 'svelte';
  import {
    tradeData,
    positionsData,
    ETHprice,
    BTCprice,
  } from '../../scripts/stores';
  import { getTradesData, getPositionsData, getUPL } from '../../scripts/utils';
  import { BTCUSD, ETH, PRICE_DENOMINATOR } from '../../scripts/constants';
  import { SPINNER_ICON } from '../../scripts/icons';
  import Positions from './Positions.svelte';
  import History from './History.svelte';

  let loading = true;
  let panel = 'positions';

  function calculateUPLs(_positions) {
    for (const position of _positions) {
      const upl = getUPL(
        position,
        position.productId == BTCUSD ? $BTCprice : $ETHprice
      );
      if (upl == undefined) continue;
      position.upl = upl.toFixed(position.currency == ETH ? 2 : 0);
      position.uplInDollars = position.currency == ETH ? upl * $ETHprice : upl;
      position.uplPercent = (
        (100 * upl) /
        (+position.margin / PRICE_DENOMINATOR)
      ).toFixed(2);
    }
  }

  onMount(async () => {
    const queryOptions = {
      orderBy: 'margin',
      orderDirection: 'desc',
      first: 1000,
    };
    tradeData.set(await getTradesData(queryOptions));
    const _positionsData = await getPositionsData(queryOptions);
    calculateUPLs(_positionsData);
    positionsData.set(_positionsData);
    loading = false;
  });

  function selectPanel(_panel) {
    panel = _panel;
  }
</script>

<div class="account-nav">
  <a
    class:active={panel == 'positions'}
    href={'#/trades'}
    on:click={() => {
      selectPanel('positions');
    }}>Active Positions</a
  >
  <a
    class:active={panel == 'history'}
    href={'#/trades'}
    on:click={() => {
      selectPanel('history');
    }}>Previous Trades</a
  >
</div>

{#if loading}
  <div class="empty">
    <div class="loading-icon">{@html SPINNER_ICON}</div>
  </div>
  <div>
    <center><h1>Fetching Data</h1></center>
  </div>
{:else}
  <div class="account-list">
    {#if panel == 'positions'}
      <Positions data={$positionsData} />
    {/if}
    {#if panel == 'history'}
      <History data={$tradeData} />
    {/if}
  </div>
{/if}

<style>
  .account-nav {
    padding: 0 var(--base-padding);
    display: flex;
    height: 42px;
    align-items: center;
    border-bottom: 1px solid var(--jet-dim);
  }

  .account-list {
    min-height: 100px;
    background-color: var(--eerie-black);
  }

  .account-nav a {
    color: var(--sonic-silver);
    margin-right: var(--base-padding);
    font-weight: 500;
  }
  .account-nav a:hover {
    color: #fff;
  }
  .account-nav a.active {
    color: var(--green);
    font-weight: 600;
  }

  @media (max-width: 600px) {
    .account-list {
      min-height: 300px;
    }
  }
</style>