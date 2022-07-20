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
  import { numberWithCommas, amountFormatter } from '../../scripts/utils';
  let minX;
  let maxX;
  let activePoint = 0;
  let loading = true;
  let points = [];
  let longs = [];
  let shorts = [];
  export let product;
  let ethP;
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
      if (position.currency == ETH) {
        points.push({
          x: +(position.liquidationPrice / PRICE_DENOMINATOR).toFixed(2),
          y: +((position.margin / PRICE_DENOMINATOR) * ethP).toFixed(2),
          curr: 'ETH',
          margin: +(position.margin / PRICE_DENOMINATOR).toFixed(3),
          isLong: position.isLong,
          cumMargin: 0,
          leverage: parseInt(position.leverage),
        });
      } else {
        points.push({
          x: +(position.liquidationPrice / PRICE_DENOMINATOR).toFixed(2),
          y: +(position.margin / PRICE_DENOMINATOR).toFixed(2),
          curr: 'USDC',
          margin: +(position.margin / PRICE_DENOMINATOR).toFixed(2),
          isLong: position.isLong,
          cumMargin: 0,
          leverage: parseInt(position.leverage),
        });
      }
    });

    points = points.filter(
      (position) => position.x < productPrice * 5 && position.y > 10
    );

    points.sort(function (a, b) {
      return a.x - b.x;
    });
    $: minX = points[0].x;
    $: maxX = points[points.length - 1].x;
    let inflectionIndex = 0;
    for (let i = 0; i < points.length; i++) {
      if (points[i].x < productPrice) {
        inflectionIndex = i + 1;
      }
    }
    longs = points.slice(0, inflectionIndex).sort(function (a, b) {
      return b.x - a.x;
    });
    shorts = points.slice(inflectionIndex);

    let cum = longs[0].y;

    for (let i = 1; i < longs.length; i++) {
      cum += longs[i].y;
      longs[i].cumMargin = cum;
    }
    cum = 0;
    for (let i = 1; i < shorts.length; i++) {
      cum += shorts[i].y;
      shorts[i].cumMargin = cum;
    }
    console.log(longs);
    const maxY = Math.max(...points.map((i) => i.cumMargin));
    const minY = Math.min(...points.map((i) => i.cumMargin));
    for (let i = 1; i <= 5; i++) {
      yTicks.push(minY + (i * maxY) / 5);
    }

    loading = false;
  });
  $: xScale = scaleLinear()
    .domain([
      Math.min(...points.map((i) => i.x)) - productPrice * 0.05,
      Math.max(...points.map((i) => i.x)) + productPrice * 0.05,
    ])
    .range([padding.left, width - padding.right]);

  $: yScale = scalePow()
    .exponent(0.4)
    .domain([0, Math.max(...yTicks)])
    .range([height - padding.bottom, padding.top]);

  $: pathLongs = `M${longs
    .map((p) => `${xScale(p.x)},${yScale(p.cumMargin)}`)
    .join('L')}`;
  $: areaLongs = `${pathLongs}L${xScale(minX)},${yScale(0)}L${xScale(
    productPrice
  )},${yScale(0)}Z`;

  $: pathShorts = `M${shorts
    .map((p) => `${xScale(p.x)},${yScale(p.cumMargin)}`)
    .join('L')}`;
  $: areaShorts = `${pathShorts}L${xScale(maxX)},${yScale(0)}L${xScale(
    productPrice
  )},${yScale(0)}Z`;

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
        >{product == 'ETH-USD' ? 'Ξ:' : 'BTC: '}
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
            <text x={padding.left - 8} y="+4">{amountFormatter(tick)}</text>
          </g>
        {/each}
        <g class="tick" transform="translate(0,{yScale(0)})">
          <line x2="100%" style="transform: scaleX(1.01)" />
        </g>
      </g>

      <!-- x axis -->
      <g class="axis x-axis">
        <g class="tickETHP" transform="translate({xScale(productPrice)},0)">
          <line y1={yScale(0)} y2={yScale(Math.max(...yTicks))} />
        </g>
        <g class="tick" transform="translate({xScale(productPrice)},0)">
          <text class="ethScale" y={height - padding.bottom + 40}
            >{product == 'ETH-USD' ? 'Ξ' : 'BTC'}: {' '}
            {numberWithCommas(productPrice)}$</text
          >
        </g>
        <g class="tick" transform="translate({padding.left},0)">
          <line y1={yScale(0)} y2={yScale(Math.max(...yTicks))} />
        </g>
        {#if activePoint != 0}
          <g class="tick" transform="translate({xScale(activePoint.x)},0)">
            <line y1={yScale(0)} y2={yScale(activePoint.y)} />
            <text y={height - padding.bottom}
              >{numberWithCommas(activePoint.x)}$</text
            >
          </g>
          <g class="tick" transform="translate(0,{yScale(activePoint.y)})">
            <line x1={xScale(activePoint.x)} x2={xScale(productPrice)} />
          </g>
        {/if}
      </g>
      <!-- data -->
      <path class="path-area-longs" d={areaLongs} />
      <path class="path-line-longs" d={pathLongs} />
      <path class="path-area-shorts" d={areaShorts} />
      <path class="path-line-shorts" d={pathShorts} />
      <!-- data -->
    </svg>
  </div>
{/if}

<style>
  .path-line-shorts {
    fill: none;
    stroke: var(--cherry);
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 1;
  }

  .path-area-shorts {
    fill: var(--cherry);
    opacity: 0.1;
  }
  svg {
    position: relative;
    width: 100%;
    height: 300px;
  }
  .path-line-longs {
    fill: none;
    stroke: var(--green);
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 1;
  }

  .path-area-longs {
    fill: var(--green);
    opacity: 0.1;
  }
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
    stroke: white;
    stroke-dasharray: 2;
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
    fill: white;
    font-size: large;
  }
</style>
