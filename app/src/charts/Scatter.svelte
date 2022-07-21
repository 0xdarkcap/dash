<script>
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';
  import { scaleLinear, scalePow } from 'd3-scale';
  import { ETH, PRICE_DENOMINATOR } from '../../scripts/constants';
  import { SPINNER_ICON } from '../../scripts/icons';
  import {
    BTCprice,
    ETHprice,
    positionsDataBTC,
    positionsDataETH,
  } from '../../scripts/stores';
  import {
    numberWithCommas,
    amountFormatter,
    getPositionXY,
  } from '../../scripts/utils';

  let activePoint = 0;
  let loading = true;
  let points = [];
  export let product;
  let ethP;
  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;
  let width = 500;
  let height = 200;
  const padding = { top: 20, right: 15, bottom: 20, left: 25 };
  let productPrice;
  onMount(async () => {
    ethP = await get(ETHprice);
    productPrice = await get(product == 'ETH-USD' ? ETHprice : BTCprice);
    let data = await get(
      product == 'ETH-USD' ? positionsDataETH : positionsDataBTC
    );
    data.forEach((position) => {
      const { x, y } = getPositionXY(position, ethP);
      // filtering out outliers
      if (!(x < productPrice * 5 && y > 10)) return;
      const curr = position.currency == ETH ? 'ETH' : 'USDC';
      const margin = +(position.margin / PRICE_DENOMINATOR).toFixed(
        position.currency == ETH ? 3 : 2
      );
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      points.push({
        x,
        y,
        curr,
        margin,
        isLong: position.isLong,
        leverage: parseInt(position.leverage),
      });
    });
    minX = points[0].x;
    maxX = points[points.length - 1].x;

    yTicks = scalePow()
      .exponent(0.4)
      .domain([0, maxY])
      .range([height - padding.bottom, padding.top])
      .nice()
      .ticks(6);
    yTicks.shift();
    maxY = Math.max(maxY, yTicks[yTicks.length - 1]);

    loading = false;
  });
  $: xScale = scaleLinear()
    .domain([minX - productPrice * 0.05, maxX + productPrice * 0.05])
    .range([padding.left, width - padding.right]);

  $: yScale = scalePow()
    .exponent(0.4)
    .domain([0, maxY])
    .range([height - padding.bottom, padding.top]);

  $: yTicks = [];
</script>

{#if loading}
  <div class="empty">
    <div class="loading-icon">{@html SPINNER_ICON}</div>
  </div>
  <div>
    <center><h1>Building Graph</h1></center>
  </div>
{:else}
  {#if activePoint == 0}
    <h3>Liquidation Map {product}</h3>
  {:else}
    <h3>
      <span class={activePoint.curr == 'ETH' ? 'eth' : 'usdc'}
        >{activePoint.curr == 'ETH'
          ? activePoint.margin + 'Ξ'
          : activePoint.margin + ' USDC'}</span
      >
      margin gets liquidated at
      <span style="color: white;"
        >{product == 'ETH-USD' ? 'Ξ:' : '₿: '}
        {numberWithCommas(activePoint.x)}$</span
      >
      <span class={activePoint.x > productPrice ? 'pos' : 'neg'}
        >({(((activePoint.x - productPrice) / productPrice) * 100).toFixed(
          1
        )}%)</span
      >
    </h3>
  {/if}
  <div
    on:mouseleave={() => {
      activePoint = 0;
    }}
    class="chart"
    bind:clientWidth={width}
    bind:clientHeight={height}
  >
    <svg style="overflow: visible">
      <!-- y axis -->
      <g class="axis y-axis">
        {#each yTicks as tick}
          <g class="tick tick-{tick}" transform="translate(0, {yScale(tick)})">
            <text x={padding.left - 8} y="+8">{amountFormatter(tick)}</text>
          </g>
        {/each}
        <g class="tick" transform="translate(0,{yScale(0)})">
          <line x2="100%" x1={padding.left} />
        </g>
      </g>

      <!-- x axis -->
      <g class="axis x-axis">
        <g class="tickETHP" transform="translate({xScale(productPrice)},0)">
          <line y1={yScale(0)} y2={yScale(maxY)} />
        </g>
        <g class="tick" transform="translate({xScale(productPrice)},0)">
          <text class="ethScale" y={height - padding.bottom + 40}
            >{product == 'ETH-USD' ? 'Ξ' : '₿'}: {' '}
            {numberWithCommas(productPrice)}$</text
          >
        </g>
        <g class="tick" transform="translate({padding.left},0)">
          <line y1={yScale(0)} y2={yScale(maxY)} />
        </g>
        {#if activePoint != 0}
          <g class="tick" transform="translate({xScale(activePoint.x)},0)">
            <line y1={yScale(0)} y2={yScale(activePoint.y)} />
            <text y={height - padding.bottom + 20}
              >{numberWithCommas(activePoint.x)}$</text
            >
          </g>
          <g class="tick" transform="translate(0,{yScale(activePoint.y)})">
            <line x1={xScale(activePoint.x)} x2={xScale(productPrice)} />
          </g>
        {/if}
      </g>

      <!-- data -->
      {#each points as point}
        <circle
          on:mouseenter={() => {
            activePoint = point;
          }}
          class={point.curr == 'ETH' ? 'marginETH' : 'marginUSDC'}
          cx={xScale(point.x)}
          cy={yScale(point.y)}
          r="5"
          data-x={point.x}
          data-y={point.y}
        />
      {/each}
    </svg>
  </div>
{/if}

<style>
  svg {
    position: relative;
    width: 100%;
    height: 300px;
  }

  .chart {
    width: 100%;
    max-width: 80vh;
    margin: 0 auto;
  }

  .marginUSDC {
    fill: yellow;
    fill-opacity: 1;
    stroke: rgba(0, 0, 0, 0.5);
  }
  .marginETH {
    fill: #ff003f;
    fill-opacity: 1;
    stroke: rgba(0, 0, 0, 0.5);
  }
  .tick line {
    stroke: #ddd;
    stroke-dasharray: 2;
  }
  .tickETHP {
    stroke: orange;
    stroke-linecap: 2;
    stroke-width: 2;
  }
  text {
    font-size: 12px;
    fill: #999;
  }
  .eth {
    color: #ff003f;
  }
  .usdc {
    color: yellow;
  }
  .x-axis text {
    text-anchor: middle;
  }
  h3 {
    color: var(--sonic-silver);
    text-align: center;
    position: relative;
  }
  .y-axis text {
    text-anchor: end;
  }
  .ethScale {
    fill: orange;
    font-size: large;
  }
</style>
