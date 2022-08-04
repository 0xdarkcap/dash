<script>
  import { onMount } from 'svelte';
  import {
    ETH,
    USDC,
    ETHUSD,
    BTCUSD,
    PRICE_DENOMINATOR,
  } from '../../scripts/constants';
  import { ETHprice, BTCprice } from '../../scripts/stores';
  import { getTradesData, getPositionsData, getUPL } from '../../scripts/utils';
  import App from '../App.svelte';
  import { SPINNER_ICON } from '../../scripts/icons';

  export let currency;
  let symbol;
  let loading;
  let totalUPL = 0;
  onMount(() => {
    console.log(currency);
    symbol = currency == USDC ? 'USDC' : 'Ξ';
    fetchData();
  });
  async function fetchData() {
    loading = true;
    let trades = await getPositionsData(
      getQuery('size', 'desc', 'undefined', currency)
    );
    let hisApy = calculateUPLs(trades);
    loading = false;
  }
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

  function calculateUPLs(_positions) {
    for (const position of _positions) {
      const upl = getUPL(
        position,
        position.productId == BTCUSD ? $BTCprice : $ETHprice
      );
      if (upl == undefined) continue;
      totalUPL += upl;
    }
  }
</script>

<div class="pool">
  <div class="asset">
    <img src={currency == ETH ? '/logos/ETH.svg' : 'logos/USDC.svg'} />
    {symbol}
    {#if loading == true}
      <div class="loading-icon">{@html SPINNER_ICON}</div>
    {/if}
  </div>

  <div class="description">
    {currency == ETH ? 'ETH' : 'USDC'} pool stats
  </div>

  <div class="apy">
    <div class="label">
      On paper pool {totalUPL > 0 ? 'drawdown' : 'profit'}
    </div>
    <div class="value">
      <span class={totalUPL > 0 ? 'neg' : 'pos'}
        >{Math.abs(totalUPL.toFixed(2))}
      </span> <span style="color:white"> {symbol}</span>
    </div>
  </div>
</div>

<style>
  .label {
    color: var(--sonic-silver);
  }
  .pools {
    padding: var(--base-padding);
    display: flex;
    justify-content: center;
  }

  .pool {
    background-color: var(--eerie-black);
    border-radius: var(--base-radius);

    overflow: hidden;
    margin: 0 auto;
  }

  .asset {
    display: flex;
    align-items: center;
    font-size: 160%;
    font-weight: 600;
    padding: var(--base-padding);
  }

  .asset img {
    width: 32px;
    margin-right: 10px;
  }

  .description {
    padding: var(--base-padding);
    background-color: var(--eerie-black);
    padding-top: 0;
    line-height: 1.618;
    color: var(--sonic-silver);
  }

  .apy {
    padding: var(--base-padding);
    border-bottom: 1px solid var(--rich-black);
  }

  .apy .label {
    margin-bottom: 6px;
  }

  .apy .value {
    font-size: 200%;
    font-weight: 600;
    text-align: left !important;
  }
</style>
