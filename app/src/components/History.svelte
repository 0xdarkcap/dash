<script>
  import {
    priceFormatter,
    getTradesData,
    numberWithCommas,
  } from '../../scripts/utils';
  import { tradeData } from '../../scripts/stores';
  import { ETH, ETHUSD } from '../../scripts/constants';
  import { SPINNER_ICON } from '../../scripts/icons';

  export let data;
  export let orderBy;
  export let orderDirection;
  export let fetchTrades;
  let loading = false;

  const showModal = console.log;

  $: changeSort = async (_orderBy) => {
    loading = true;
    if (orderBy == _orderBy) {
      orderDirection = orderDirection == 'desc' ? 'asc' : 'desc';
    } else {
      orderBy = _orderBy;
      orderDirection = 'desc';
    }
    await fetchTrades();
    loading = false;
  };
</script>

{#if loading}
  <div class="empty">
    <div class="loading-icon">{@html SPINNER_ICON}</div>
  </div>
  <div style="background: var(--rich-black-fogra);">
    <center><h1 class="loading-title">Fetching Sorted Data</h1></center>
  </div>
{:else}
  <div class="history">
    <div class="columns">
      <div
        class="column column-product"
        on:click={() => changeSort('productId')}
      >
        Product <span class={orderDirection == 'asc' ? 'pos' : 'neg'}
          >{orderBy == 'productId'
            ? orderDirection == 'asc'
              ? '↑'
              : '↓'
            : ''}</span
        >
      </div>
      <div
        class="column column-entry-price"
        on:click={() => changeSort('entryPrice')}
      >
        Entry Price <span class={orderDirection == 'asc' ? 'pos' : 'neg'}
          >{orderBy == 'entryPrice'
            ? orderDirection == 'asc'
              ? '↑'
              : '↓'
            : ''}</span
        >
      </div>
      <div
        class="column column-price"
        on:click={() => changeSort('closePrice')}
      >
        Close Price
        <span class={orderDirection == 'asc' ? 'pos' : 'neg'}
          >{orderBy == 'closePrice'
            ? orderDirection == 'asc'
              ? '↑'
              : '↓'
            : ''}</span
        >
      </div>
      <div class="column column-margin" on:click={() => changeSort('margin')}>
        Margin
        <span class={orderDirection == 'asc' ? 'pos' : 'neg'}
          >{orderBy == 'margin'
            ? orderDirection == 'asc'
              ? '↑'
              : '↓'
            : ''}</span
        >
      </div>
      <div class="column column-size" on:click={() => changeSort('size')}>
        Size
        <span class={orderDirection == 'asc' ? 'pos' : 'neg'}
          >{orderBy == 'size'
            ? orderDirection == 'asc'
              ? '↑'
              : '↓'
            : ''}</span
        >
      </div>
      <div
        class="column column-leverage"
        on:click={() => changeSort('leverage')}
      >
        Leverage
        <span class={orderDirection == 'asc' ? 'pos' : 'neg'}
          >{orderBy == 'leverage'
            ? orderDirection == 'asc'
              ? '↑'
              : '↓'
            : ''}</span
        >
      </div>
      <div class="column column-pnl" on:click={() => changeSort('pnl')}>
        P/L
        <span class={orderDirection == 'asc' ? 'pos' : 'neg'}
          >{orderBy == 'pnl' ? (orderDirection == 'asc' ? '↑' : '↓') : ''}</span
        >
      </div>
      <div
        class="column column-wasliq"
        on:click={() => changeSort('wasLiquidated')}
      >
        Was Liq.
        <span class={orderDirection == 'asc' ? 'pos' : 'neg'}
          >{orderBy == 'wasLiquidated'
            ? orderDirection == 'asc'
              ? '↑'
              : '↓'
            : ''}</span
        >
      </div>
    </div>
  </div>
  <div class="trades-list no-scrollbar" id="history-list">
    {#if data.length == 0}
      <div class="empty">No trades to show.</div>
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
          <div class="column column-entry-price">
            {numberWithCommas(priceFormatter(trade.entryPrice))}
          </div>
          <div class="column column-price">
            {numberWithCommas(priceFormatter(trade.closePrice))}
          </div>
          <div class="column column-margin">
            {numberWithCommas(
              priceFormatter(trade.margin, trade.currency)
            )}{trade.currency == ETH ? 'Ξ' : ' USDC'}
          </div>
          <div class="column column-size">
            {numberWithCommas(
              priceFormatter(trade.size, trade.currency)
            )}{trade.currency == ETH ? 'Ξ' : ' USDC'}
          </div>
          <div class="column column-leverage">
            {priceFormatter(trade.leverage)}×
          </div>
          <div class={`column column-pnl ${+trade.pnl < 0 ? 'neg' : 'pos'}`}>
            {priceFormatter(trade.pnl)}{trade.currency == ETH ? 'Ξ' : '$'}
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
{/if}

<style>
  .empty {
    background: var(--rich-black-fogra);
  }
  .loading-title {
    margin: 0;
    padding: 0.67em 0;
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

  .trade {
    display: flex;
    align-items: center;
    height: 48px;
    cursor: pointer;
    padding: 0 var(--base-padding);
    border-bottom: 1px solid var(--jet-dim);
    background-color: var(--rich-black);
    color: var(--silver-chalice);
  }
  .trade:hover {
    background-color: var(--jet-dim);
  }
  .column {
    cursor: pointer;
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
