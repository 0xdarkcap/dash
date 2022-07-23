<script>
  import { priceFormatter } from '../../scripts/utils';
  import { ETH, ETHUSD } from '../../scripts/constants';

  export let data;
  const showModal = console.log;
</script>

<div class="history">
  <div class="columns">
    <div class="column column-product">Product</div>
    <div class="column column-price">Price</div>
    <div class="column column-margin">Margin</div>
    <div class="column column-size">Size</div>
    <div class="column column-leverage">Leverage</div>
    <div class="column column-pnl">P/L</div>
    <div class="column column-liqprice">Liq. Price</div>
    <div class="column column-close" />
  </div>
</div>
<div class="trades-list no-scrollbar" id="history-list">
  {#if data.length == 0}
    <div class="empty">No positions to show.</div>
  {:else}
    {#each data as trade}
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
        <div class="column column-price">
          {priceFormatter(trade.price)}
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
          <!-- TODO: Calculate and display pnl here -->
          -
        </div>
        <div class="column column-liqprice">
          {priceFormatter(trade.liquidationPrice) || '--'}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .columns {
    display: flex;
    align-items: center;
    height: 40px;
    padding: 0 var(--base-padding);
    color: var(--sonic-silver);
    font-size: 90%;
    border-bottom: 1px solid var(--jet-dim);
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

  .account {
    order: 2;
    position: relative;
    background-color: var(--eerie-black);
  }
</style>
