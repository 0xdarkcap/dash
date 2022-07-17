<script>
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';
  import { scaleLinear, scaleSqrt } from 'd3-scale';
  import {
    ETH,
    USDC,
    ETHUSD,
    PRICE_DENOMINATOR,
    BTCUSD,
  } from '../../scripts/constants';
  import { SPINNER_ICON, CARET_DOWN } from '../../scripts/icons';
  import { BTCprice, ETHprice, positionsDataBTC } from '../../scripts/stores';
  import { numberWithCommas } from '../../scripts/utils';

  let activePoint = 0;
  let loading = true;
  let points = [];
  export let product;
  let svg;
  let width = 500;
  let height = 200;
  const padding = { top: 20, right: 15, bottom: 20, left: 25 };
  let ethP;
  let btcP;
  onMount(async () => {
    ethP = await get(ETHprice);
    btcP = await get(BTCprice);
    let data = await get(positionsDataBTC);
    console.log(data);

    data.forEach((position) => {
      if (position.currency == ETH) {
        points.push({
          x:
            Math.ceil((position.liquidationPrice * 100) / PRICE_DENOMINATOR) /
            100,
          y: parseInt((position.margin / PRICE_DENOMINATOR) * ethP),
          curr: 'ETH',
          size: parseInt(position.size / PRICE_DENOMINATOR),
          isLong: position.isLong,
          leverage: parseInt(position.leverage),
        });
      } else {
        points.push({
          x:
            Math.ceil((position.liquidationPrice * 100) / PRICE_DENOMINATOR) /
            100,
          y: parseInt(position.margin / PRICE_DENOMINATOR),
          curr: 'USDC',
          size: parseInt(position.size / PRICE_DENOMINATOR),
          isLong: position.isLong,
          leverage: parseInt(position.leverage),
        });
      }
    });

    const maxX = Math.max(...points.map((i) => i.x));
    const minX = Math.min(...points.map((i) => i.x)) - 50;
    const maxY = Math.max(...points.map((i) => i.y));
    const minY = Math.min(...points.map((i) => i.y));
    for (let i = 1; i <= 6; i++) {
      yTicks.push(minY + ((i - 1) * maxY) / 5);
      xTicks.push(Math.round(minX + ((i - 1) * maxX) / 5));
    }

    console.log(points);
    console.log(xTicks, yTicks);
    loading = false;
  });
  $: xScale = scaleLinear()
    .domain([Math.min(...xTicks), Math.max(...xTicks)])
    .range([padding.left, width - padding.right]);

  $: yScale = scaleSqrt()
    .domain([Math.min(...yTicks), Math.max(...yTicks)])
    .range([height - padding.bottom, padding.top]);

  $: xTicks = [];

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
    <h3>Liquidation Map BTC-USD</h3>
  {:else}
    <h3>
      <span class={activePoint.curr == 'ETH' ? 'eth' : 'usdc'}
        >{activePoint.curr == 'ETH'
          ? (activePoint.y / ethP < 1
              ? (activePoint.y / ethP).toFixed(2)
              : (activePoint.y / ethP).toFixed(0)) + 'Ξ'
          : activePoint.y + ' USDC'}</span
      >
      margin gets liquidated at
      <span style="color: white;">BTC: {numberWithCommas(activePoint.x)}$</span>
      <span class={activePoint.x > btcP ? 'pos' : 'neg'}
        >({(((activePoint.x - btcP) / btcP) * 100).toFixed(1)}%)</span
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
    <svg bind:this={svg} style="overflow: visible">
      <!-- y axis -->
      <g class="axis y-axis">
        {#each yTicks as tick}
          <g class="tick tick-{tick}" transform="translate(0, {yScale(tick)})">
            <text x={padding.left - 8} y="+4"
              >{Math.round(tick / 1000000).toString() + 'M'}</text
            >
          </g>
        {/each}
        <g class="tick" transform="translate(0,{yScale(0)})">
          <line x2="100%" style="transform: scaleX(1.01)" />
        </g>
      </g>

      <!-- x axis -->
      <g class="axis x-axis">
        {#each xTicks as tick}
          <g class="tick" transform="translate({xScale(tick)},0)" />
        {/each}
        <g class="tickETHP" transform="translate({xScale(btcP)},0)">
          <line y1={yScale(0)} y2={yScale(Math.max(...yTicks))} />
        </g>
        <g class="tick" transform="translate({xScale(btcP)},0)">
          <text class="ethScale" y={height - padding.bottom + 40}
            >BTC: {numberWithCommas(btcP)}$</text
          >
        </g>

        <g class="tick" transform="translate({xScale(Math.min(...xTicks))},0)">
          <line y1={yScale(0)} y2={yScale(Math.max(...yTicks))} />
        </g>
        {#if activePoint != 0}
          <g class="tick" transform="translate({xScale(activePoint.x)},0)">
            <line y1={yScale(0)} y2={yScale(activePoint.y)} />
            <text y={height - padding.bottom + 20}
              >{numberWithCommas(activePoint.x)}$</text
            >
          </g>
          <g class="tick" transform="translate(0,{yScale(activePoint.y)})">
            <line x1={xScale(activePoint.x)} x2={xScale(btcP)} />
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
