<script>
  import { onMount } from 'svelte';
  import { tradeData, positionsData } from '../../scripts/stores';
  import { getTradesData, getPositionsData } from '../../scripts/utils';
  import { SPINNER_ICON } from '../../scripts/icons';
  import Positions from './Positions.svelte';
  import History from './History.svelte';

  let loading = true;
  let panel = 'positions';
  onMount(async () => {
    tradeData.set(await getTradesData());
    const queryOptions = {
      orderBy: 'margin',
      orderDirection: 'desc',
      first: 1000,
    };
    positionsData.set(await getPositionsData(queryOptions));
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
