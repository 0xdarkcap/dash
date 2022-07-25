<script>
  import { onMount } from 'svelte';
  import {
    tradeData,
    positionsData,
    ETHprice,
    BTCprice,
  } from '../../scripts/stores';
  import { getTradesData, getPositionsData, getUPL } from '../../scripts/utils';
  import {
    BTCUSD,
    ETH,
    ETHUSD,
    PRICE_DENOMINATOR,
    USDC,
  } from '../../scripts/constants';
  import { SPINNER_ICON } from '../../scripts/icons';
  import Positions from './Positions.svelte';
  import History from './History.svelte';

  let loading = true;
  let orderBy = 'margin';
  let orderDirection = 'desc';
  let productFilter = undefined;
  let currencyFilter = undefined;
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

  onMount(() => {
    fetchData();
  });

  function getQuery(
    _orderBy,
    _orderDirection,
    _productFilter,
    _currencyFilter
  ) {
    const queryOptions = {
      orderBy: _orderBy,
      orderDirection: _orderDirection,
      first: 1000,
    };
    if (_productFilter && _productFilter !== 'undefined')
      queryOptions.product = _productFilter;
    if (_currencyFilter && _currencyFilter !== 'undefined')
      queryOptions.currency = _currencyFilter;
    return queryOptions;
  }

  async function fetchData() {
    loading = true;
    await Promise.all([fetchTrades(), fetchPositions()]);
    loading = false;
  }

  async function fetchPositions() {
    const query = getQuery(
      orderBy,
      orderDirection,
      productFilter,
      currencyFilter
    );
    const _positionsData = await getPositionsData(query);
    calculateUPLs(_positionsData);
    positionsData.set(_positionsData);
  }
  async function fetchTrades() {
    const query = getQuery(
      orderBy,
      orderDirection,
      productFilter,
      currencyFilter
    );
    tradeData.set(await getTradesData(query));
  }

  function selectPanel(_panel) {
    panel = _panel;
    orderBy = 'margin';
    orderDirection = 'desc';
  }
  function setProductFilter(e) {
    productFilter = e.target.value;
    fetchData();
  }
  function setCurrencyFilter(e) {
    currencyFilter = e.target.value;
    fetchData();
  }
</script>

<div class="account-nav">
  <div style="flex: 1">
    <select
      name="filter-product"
      class="filter-select"
      on:change={setProductFilter}
    >
      <option value={undefined}>Filter Product</option>
      <option value={BTCUSD}>BTC-USD</option>
      <option value={ETHUSD}>ETH-USD</option>
    </select>
    <select
      name="filter-currency"
      class="filter-select"
      on:change={setCurrencyFilter}
    >
      <option value={undefined}>Filter Currency</option>
      <option value={USDC}>USDC</option>
      <option value={ETH}>ETH</option>
    </select>
  </div>
  <div class="position-type">
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
      <History
        data={$tradeData}
        bind:orderBy
        bind:orderDirection
        {fetchTrades}
      />
    {/if}
  </div>
{/if}

<style>
  select.filter-select {
    background: var(--rich-black-fogra);
    color: var(--sonic-silver);
    margin: 0;
    border: 1px solid var(--sonic-silver);
    font-weight: 500;
  }
  select option {
    font-weight: 500;
  }

  .account-list {
    min-height: 100px;
  }

  .position-type {
    padding-bottom: 0.5em;
  }
  .account-nav {
    padding: 0.5em var(--base-padding);
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--jet-dim);
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

  @media (max-width: 610px) {
    .account-list {
      min-height: 300px;
    }
    .account-nav {
      flex-direction: column-reverse;
      align-items: flex-start;
    }
  }
</style>
