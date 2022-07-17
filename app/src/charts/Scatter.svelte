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
  import { SPINNER_ICON } from '../../scripts/icons';
  import { BTCprice, ETHprice, positionsData } from '../../scripts/stores';

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
    let data = await get(positionsData);
    console.log(data);
    data = data.filter(
      (position) => position.liquidationPrice / PRICE_DENOMINATOR < ethP * 5
    );
    data.forEach((position) => {
      if (position.productId == ETHUSD && product == 'ETH-USD') {
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
    <h3>Liquidation Map {product}</h3>
  {:else}
    <h3>
      {activePoint.y} x {activePoint.leverage / PRICE_DENOMINATOR}, liquidation
      @ {activePoint.x}
    </h3>
  {/if}
  <div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
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
        {#if product == 'ETH-USD'}
          <g class="tickETHP" transform="translate({xScale(ethP)},0)">
            <line y1={yScale(0)} y2={yScale(Math.max(...yTicks))} />
          </g>
        {:else}
          <g class="tickETHP" transform="translate({xScale(btcP)},0)">
            <line y1={yScale(0)} y2={yScale(Math.max(...yTicks))} />
          </g>
        {/if}
        <g class="tick" transform="translate({xScale(Math.min(...xTicks))},0)">
          <line y1={yScale(0)} y2={yScale(Math.max(...yTicks))} />
        </g>
        {#if activePoint != 0}
          <g class="tick" transform="translate({xScale(activePoint.x)},0)">
            <line y1={yScale(0)} y2={yScale(activePoint.y)} />
            <text y={height - padding.bottom + 20}>{activePoint.x}</text>
          </g>
          <g class="tick" transform="translate(0,{yScale(activePoint.y)})">
            <line x1={xScale(activePoint.x)} x2={xScale(ethP)} />
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
    fill: cyan;
    fill-opacity: 1;
    stroke: rgba(0, 0, 0, 0.5);
  }
  .marginETH {
    fill: blue;
    fill-opacity: 1;
    stroke: rgba(0, 0, 0, 0.5);
  }
  .tick line {
    stroke: #ddd;
    stroke-dasharray: 2;
  }
  .tickETHP {
    stroke: var(--orange);
    stroke-linecap: 3;
    stroke-width: 3;
  }
  text {
    font-size: 12px;
    fill: #999;
  }

  .x-axis text {
    text-anchor: middle;
  }

  .y-axis text {
    text-anchor: end;
  }
</style>
