<script>
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';
  import { scaleLinear } from 'd3-scale';
  import { ETH, USDC } from '../../scripts/constants';
  import { SPINNER_ICON } from '../../scripts/icons';
  import {
    BTCprice,
    ETHprice,
    positionsDataBTC,
    positionsDataETH,
  } from '../../scripts/stores';
  import {
    numberWithCommas,
    priceTickFormatter,
    getPositionXY,
    priceFormatter,
  } from '../../scripts/utils';

  let activePrice = null;
  let activeInflectionIndex = null;
  let loading = true;
  let points = [];
  let longs = [];
  let shorts = [];
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
      if (!(x < productPrice * 5)) return;
      const curr = position.currency == ETH ? 'ETH' : 'USDC';
      const margin = priceFormatter(position.margin, position.currency);
      const cumEthMargin = position.currency == ETH ? margin : 0;
      const cumUsdcMargin = position.currency == USDC ? margin : 0;
      points.push({
        x,
        y,
        curr,
        margin,
        cumMargin: y,
        cumEthMargin,
        cumUsdcMargin,
      });
    });
    minX = points[0].x;
    maxX = points[points.length - 1].x;
    let inflectionIndex = points.findIndex((point) => point.x > productPrice);
    let cum = 0;
    let cumEthMargin = 0;
    let cumUsdcMargin = 0;
    const setPositionMargin = (position) => {
      cum += position.y;
      if (position.curr == 'ETH') cumEthMargin += position.margin;
      else cumUsdcMargin += position.margin;
      position.cumMargin = cum;
      position.cumEthMargin = cumEthMargin;
      position.cumUsdcMargin = cumUsdcMargin;
    };

    const initialMargin = {
      x: +productPrice,
      cumMargin: 0,
      cumUsdcMargin: 0,
      cumEthMargin: 0,
    };
    // if there are no longs:
    if (inflectionIndex == 0) {
      longs = [];
    } else {
      longs = points.slice(0, inflectionIndex).reverse();
      longs.forEach(setPositionMargin);
    }
    longs.unshift(initialMargin);

    // if there are no shorts:
    if (inflectionIndex == -1) {
      shorts = [];
    } else {
      shorts = points.slice(inflectionIndex);
      cum = 0;
      cumEthMargin = 0;
      cumUsdcMargin = 0;
      shorts.forEach(setPositionMargin);
    }
    shorts.unshift(initialMargin);

    maxY = Math.max(
      longs[longs.length - 1]?.cumMargin,
      shorts[shorts.length - 1]?.cumMargin
    );

    yTicks = scaleLinear()
      .domain([0, maxY])
      .range([height - padding.bottom, padding.top])
      .nice()
      .ticks(6);
    yTicks.shift();

    maxY = Math.max(maxY, yTicks[yTicks.length - 1]);

    loading = false;
  });

  const getActivePosition = (activeInflectionIndex) => {
    const arr = activePrice > productPrice ? shorts : longs;
    return arr[activeInflectionIndex];
  };
  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (activePrice > maxX) activePrice = null;
    if (activePrice < minX) activePrice = null;
    activePrice = +xScale.invert(x).toFixed(2);

    const activeArr = activePrice > productPrice ? shorts : longs;
    activeInflectionIndex =
      activePrice > productPrice
        ? shorts.findIndex((short) => short.x > +activePrice)
        : longs.findIndex((long) => long.x < +activePrice);
    activeInflectionIndex =
      activeInflectionIndex == -1
        ? activeArr.length - 1
        : activeInflectionIndex - 1;

    const newPath = `M${activeArr
      .slice(0, activeInflectionIndex + 1)
      .map((p) => `${xScale(p.x)},${yScale(p.cumMargin)}`)
      .join('L')}`;
    const newArea = `${newPath}L${xScale(
      activeArr[activeInflectionIndex].x
    )},${yScale(0)}L${xScale(productPrice)},${yScale(0)}Z`;
    if (activePrice < productPrice) {
      areaLongs = newArea;
      areaShorts = `${pathShorts}L${xScale(maxX)},${yScale(0)}L${xScale(
        productPrice
      )},${yScale(0)}Z`;
    } else {
      areaShorts = newArea;
      areaLongs = `${pathLongs}L${xScale(minX)},${yScale(0)}L${xScale(
        productPrice
      )},${yScale(0)}Z`;
    }
  };

  $: xScale = scaleLinear()
    .domain([minX, maxX])
    .range([padding.left, width - padding.right]);

  $: yScale = scaleLinear()
    .domain([0, maxY])
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
  <div class="title-container">
    {#if !activePrice}
      <h3>Liquidation Spread {product}</h3>
    {:else}
      <h3 class="hover-text">
        <span class={'eth'}
          >{getActivePosition(activeInflectionIndex).cumEthMargin.toFixed(
            0
          )}Ξ</span
        >
        &
        <span class={'usdc'}
          >{getActivePosition(activeInflectionIndex).cumUsdcMargin.toFixed(0)} USDC</span
        >
        of {activePrice < productPrice ? 'longs' : 'shorts'} liquidate till
        <span style="color: white;"
          >{product == 'ETH-USD' ? 'Ξ:' : '₿: '}
          {numberWithCommas(activePrice)}$</span
        >
        <span class={activePrice > productPrice ? 'pos' : 'neg'}
          >({(((activePrice - productPrice) / productPrice) * 100).toFixed(
            1
          )}%)</span
        >
      </h3>
    {/if}
  </div>
  <div
    on:mousemove={onMouseMove}
    on:mouseleave={() => {
      activePrice = null;
      areaShorts = `${pathShorts}L${xScale(maxX)},${yScale(0)}L${xScale(
        productPrice
      )},${yScale(0)}Z`;
      areaLongs = `${pathLongs}L${xScale(minX)},${yScale(0)}L${xScale(
        productPrice
      )},${yScale(0)}Z`;
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
            <text x={padding.left - 8} y="+8">{priceTickFormatter(tick)}</text>
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
  .title-container {
    height: 4em;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  h3 {
    color: var(--sonic-silver);
    text-align: center;
    position: relative;
    line-height: 22px;
    margin: 0;
  }
  h3.hover-text {
    font-size: 1em;
  }
  .y-axis text {
    text-anchor: end;
  }
  .ethScale {
    fill: white;
    font-size: large;
    transform: translate(0px, -15px);
  }
</style>
