<script>
  import { onMount } from 'svelte';
  import { priceFormatter, numberWithCommas } from '../../scripts/utils';
  import { ETH, ETHUSD } from '../../scripts/constants';

  export let data;
  $: sortedData = JSON.parse(JSON.stringify(data));
  let sortBy = 'margin';
  let sortOrder = 'desc';

  const showModal = console.log;

  $: changeSort = (_sortBy) => {
    if (sortBy == _sortBy) {
      sortOrder = sortOrder == 'desc' ? 'asc' : 'desc';
      sortedData = sortedData.reverse();
    } else {
      sortBy = _sortBy;
      sortOrder = 'desc';
      sortedData = sortedData.sort((a, b) => b[_sortBy] - a[_sortBy]);
    }
  };

  onMount(() => {
    changeSort('uplInDollars');
  });
</script>

<div class="history">
  <div class="columns">
    <div class="column column-product" on:click={() => changeSort('productId')}>
      Product <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
        >{sortBy == 'productId' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
      >
    </div>
    <div class="column column-price" on:click={() => changeSort('price')}>
      Price <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
        >{sortBy == 'price' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
      >
    </div>
    <div class="column column-margin" on:click={() => changeSort('margin')}>
      Margin <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
        >{sortBy == 'margin' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
      >
    </div>
    <div class="column column-size" on:click={() => changeSort('size')}>
      Size <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
        >{sortBy == 'size' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
      >
    </div>
    <div class="column column-leverage" on:click={() => changeSort('leverage')}>
      Leverage <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
        >{sortBy == 'leverage' ? (sortOrder == 'asc' ? '↑' : '↓') : ''}</span
      >
    </div>
    <div class="column column-pnl" on:click={() => changeSort('uplInDollars')}>
      UPL <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
        >{sortBy == 'uplInDollars'
          ? sortOrder == 'asc'
            ? '↑'
            : '↓'
          : ''}</span
      >
    </div>
    <div
      class="column column-liqprice"
      on:click={changeSort('liquidationPrice')}
    >
      Liq. Price <span class={sortOrder == 'asc' ? 'pos' : 'neg'}
        >{sortBy == 'liquidationPrice'
          ? sortOrder == 'asc'
            ? '↑'
            : '↓'
          : ''}</span
      >
    </div>
    <div class="column column-close" />
  </div>
</div>
<div class="trades-list no-scrollbar" id="history-list">
  {#if sortedData.length == 0}
    <div class="empty">No positions to show.</div>
  {:else}
    {#each sortedData as position}
      <div
        class="trade"
        on:click={() => {
          showModal('TradeDetails', position);
        }}
        data-intercept="true"
      >
        <div class="column column-product">
          {#if position.isLong}<span class="pos">↑</span>{:else}<span
              class="neg">↓</span
            >{/if}
          {position.productId == ETHUSD ? 'ETHUSD' : 'BTCUSD'}
        </div>
        <div class="column column-price">
          {numberWithCommas(priceFormatter(position.price))}$
        </div>
        <div class="column column-margin">
          {numberWithCommas(
            priceFormatter(position.margin, position.currency)
          )}{position.currency == ETH ? 'Ξ' : ' USDC'}
        </div>
        <div class="column column-size">
          {priceFormatter(
            position.size,
            position.currency
          )}{position.currency == ETH ? 'Ξ' : ' USDC'}
        </div>
        <div class="column column-leverage">
          {priceFormatter(position.leverage)}×
        </div>
        <div class={`column column-pnl ${+position.upl < 0 ? 'neg' : 'pos'}`}>
          {position.upl}{position.currency == ETH ? 'Ξ' : '$'}
          <span class="pnl-percent">({position.uplPercent}%)</span>
        </div>
        <div class="column column-liqprice">
          {numberWithCommas(priceFormatter(position.liquidationPrice)) || '--'}$
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
