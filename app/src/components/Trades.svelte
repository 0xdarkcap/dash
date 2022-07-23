<script>
  import { onMount } from 'svelte';
  import { tradeData } from '../../scripts/stores';
  import { getTradesData, priceFormatter } from '../../scripts/utils';
  import { ETH, ETHUSD } from '../../scripts/constants';
  import { SPINNER_ICON } from '../../scripts/icons';

  let loading = true;
  onMount(async () => {
    tradeData.set(await getTradesData());
    loading = false;
  });
  console.log($tradeData);

  const showModal = console.log;
</script>

<div class="history">
  <div class="columns">
    <div class="column column-product">Product</div>
    <div class="column column-entry-price">Entry Price</div>
    <div class="column column-price">Close Price</div>
    <div class="column column-margin">Margin</div>
    <div class="column column-size">Size</div>
    <div class="column column-leverage">Leverage</div>
    <div class="column column-pnl">P/L</div>
    <div class="column column-wasliq">Was Liq.</div>
  </div>

  <div class="trades-list no-scrollbar" id="history-list">
    {#if loading}
      <div class="empty">
        <div class="loading-icon">{@html SPINNER_ICON}</div>
      </div>
    {:else if $tradeData.length == 0}
      <div class="empty">No trades to show.</div>
    {:else}
      {#each $tradeData as trade}
        <div
          class="trade"
          on:click={() => {
            showModal('TradeDetails', trade);
          }}
          data-intercept="true"
        >
          <div class="column column-product">
            {#if trade.isLong}<span class="pos">↑</span>{:else}<span class="neg"
                >↓</span
              >{/if}
            {trade.productId == ETHUSD ? 'ETHUSD' : 'BTCUSD'}
          </div>
          <div class="column column-entry-price">
            {priceFormatter(trade.entryPrice)}
          </div>
          <div class="column column-price">
            {priceFormatter(trade.closePrice)}
          </div>
          <div class="column column-margin">
            {priceFormatter(trade.margin, trade.currency)}{trade.currency == ETH
              ? 'Ξ'
              : 'USDC'}
          </div>
          <div class="column column-size">
            {priceFormatter(trade.size, trade.currency)}{trade.currency == ETH
              ? 'Ξ'
              : 'USDC'}
          </div>
          <div class="column column-leverage">
            {priceFormatter(trade.leverage)}×
          </div>
          <div class={`column column-pnl ${+trade.pnl < 0 ? 'neg' : 'pos'}`}>
            {priceFormatter(trade.pnl)}
            <span class="pnl-percent"
              >({((100 * trade.pnl) / trade.margin).toFixed(2)}%)</span
            >
          </div>
          <div class="column column-wasliq">
            {trade.wasLiquidated ? 'Yes' : ''}
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .history {
    /* position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0; */
  }

  .columns {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 var(--base-padding);
    color: var(--sonic-silver);
    font-size: 90%;
    border-bottom: 1px solid var(--jet-dim);
  }

  .trades-list {
    /* overflow-y: scroll; */
  }

  .trade {
    display: flex;
    align-items: center;
    height: 48px;
    cursor: pointer;
    padding: 0 var(--base-padding);
    border-bottom: 1px solid var(--jet-dim);
  }
  .trade:hover {
    background-color: var(--jet-dim);
  }

  .column-product {
    width: 12.5%;
  }
  .column-entry-price {
    width: 12.5%;
  }
  .column-price {
    width: 12.5%;
  }
  .column-margin {
    width: 12.5%;
  }
  .column-size {
    width: 12.5%;
  }
  .column-leverage {
    width: 12.5%;
  }
  .column-pnl {
    width: 20%;
  }
  .column-wasliq {
    width: 5%;
  }

  @media (max-width: 1200px) {
    .pnl-percent {
      display: none;
    }
  }

  @media (max-width: 1000px) {
    .column-wasliq,
    .column-margin {
      display: none;
    }
    .column-product {
      width: 16%;
    }
    .column-entry-price {
      width: 16%;
    }
    .column-price {
      width: 16%;
    }
    .column-size {
      width: 16%;
    }
    .column-leverage {
      width: 16%;
    }
    .column-pnl {
      width: 20%;
    }
  }

  @media (max-width: 780px) {
    .column-leverage,
    .column-entry-price {
      display: none;
    }

    .column-product {
      width: 25%;
    }
    .column-price {
      width: 25%;
    }
    .column-size {
      width: 25%;
    }
    .column-pnl {
      width: 25%;
    }
  }
</style>
