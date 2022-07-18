<script>
  import { get } from 'svelte/store';
  import { scaleLinear } from 'd3-scale';
  import { SPINNER_ICON } from '../../scripts/icons';
  import { onMount } from 'svelte';
  import { dayData, ETHprice } from '../../scripts/stores';
  import { ETH, PRICE_DENOMINATOR } from '../../scripts/constants';
  import {
    numberWithCommas,
    timeConverter,
    formatDate,
    amountFormatter,
  } from '../../scripts/utils';

  let loading = true;
  let points = [];
  let xValues = [];
  //   let BTCPrice;
  let ETHPrice;
  const xTicks = [];
  const yTicks = [];
  let ma7 = [];
  onMount(async () => {
    ETHPrice = await get(ETHprice);
    const getDayData = async () => {
      const data = await get(dayData);
      let lastDate;
      const pushElementToData = (element) => {
        const currentDate = element.id.slice(43);
        const currency = element.id.slice(0, 42);
        if (lastDate !== currentDate) {
          lastDate = currentDate;
          points.push({ x: parseInt(element.id.slice(43)) });
          xValues.push(parseInt(element.id.slice(43)));
        }
        if (currency == ETH) {
          points[points.length - 1].yETH = parseInt(
            element.cumulativeVolume / PRICE_DENOMINATOR
          );
        } else {
          points[points.length - 1].yUSD = parseInt(
            element.cumulativeVolume / PRICE_DENOMINATOR
          );
        }
        if (points[points.length - 1].yUSD && points[points.length - 1].yETH) {
          points[points.length - 1].y =
            ETHPrice * points[points.length - 1].yETH +
            points[points.length - 1].yUSD;
        }
      };
      data.forEach(pushElementToData);
    };

    await getDayData();

    const maxY = Math.max(...points.map((i) => i.y));
    for (let i = 1; i <= 6; i++) {
      yTicks.push(Math.ceil((maxY * i) / (6 * 1000000)) * 1000000);
      xTicks.push(
        new Date(
          86400000 * points[Math.round(((points.length - 1) * (i - 1)) / 5)].x
        )
      );
    }

    let ma6 = 0;
    for (let i = 1; i <= 6; i++) {
      ma6 += points[i].y;
    }
    ma7.push((points[0].y + ma6) / 7);
    ma7.push((ma6 + points[7].y) / 7);
    for (let i = 7; i < points.length - 1; i++) {
      ma7.push((ma7[i - 6] * 7 - points[i - 6].y + points[i + 1].y) / 7);
    }
    loading = false;
  });

  const padding = { top: 20, right: 15, bottom: 20, left: 25 };

  let width = 500;
  let height = 200;

  $: xScale = scaleLinear()
    .domain([0, xValues.length])
    .range([padding.left, width - padding.right]);

  $: yScale = scaleLinear()
    .domain([0, Math.max.apply(null, yTicks)])
    .range([height - padding.bottom, padding.top]);

  $: innerWidth = width - (padding.left + padding.right);
  $: barWidth = xValues.length ? innerWidth / xValues.length : 0;

  $: focus = false;

  $: activePoint = 0;
  $: date = '';
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
    <h3>Volume in USD</h3>
  {:else}
    <h3>
      {date} | Ξ:
      <span class="volumeETH"
        >{numberWithCommas(Math.round(activePoint.yETH))}</span
      >
      | USDC:
      <span class="volumeUSDC"
        >{numberWithCommas(Math.round(activePoint.yUSD))}$</span
      >
    </h3>
  {/if}
  <div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
    <svg
      on:mouseenter={() => {
        focus = true;
      }}
      on:mouseleave={() => {
        focus = false;
        activePoint = 0;
      }}
      style="overflow: visible"
    >
      <!-- y axis -->
      {#if activePoint == 0}
        <g class="axis y-axis">
          {#each yTicks as tick}
            <g
              class="tick tick-{tick}"
              transform="translate(0, {yScale(tick) || 0})"
            >
              <line x2="100%" style="transform: scaleX(1.01)" />
              <text y="-4" class="y-axisText">{amountFormatter(tick)}</text>
            </g>
          {/each}
        </g>
      {:else}
        <g class="axis selected">
          <g
            class="tick selected"
            transform="translate(0,{yScale(activePoint.y) || 0})"
          >
            <line x2="100%" />
            <text class="y-axisText"
              >{amountFormatter(
                activePoint.yETH * ETHPrice + activePoint.yUSD
              )}</text
            >
          </g>
        </g>
      {/if}
      <!-- x axis -->
      <g class="axis x-axis">
        {#each xTicks as xTick, i}
          <g
            class="tick"
            transform="translate({xScale(
              (i * points.length) / (xTicks.length - 1)
            )},{height})"
          >
            <text x={barWidth / 2} y="-4">{formatDate(xTick)}</text>
          </g>
        {/each}
      </g>

      <!--bars-->
      <g class={focus == true ? 'inactive' : 'active'}>
        {#each points as point, i}
          <g class="stacked-bar">
            <!-- ETH bar: -->
            <rect
              on:mouseenter={() => {
                activePoint = point;
                date = timeConverter(point.x * 86400);
              }}
              x={xScale(i) + 2}
              y={yScale(ETHPrice * point.yETH) || 0}
              width={barWidth || 0}
              height={yScale(0) - yScale(ETHPrice * point.yETH) || 0}
            />
            <!-- USD bar: -->
            <rect
              on:mouseenter={() => {
                activePoint = point;
                date = timeConverter(point.x * 86400);
              }}
              class="usd"
              x={xScale(i) + 2}
              y={yScale(point.y) || 0}
              width={barWidth || 0}
              height={yScale(ETHPrice * point.yETH) - yScale(point.y) || 0}
            />
          </g>
        {/each}
      </g>
      {#if focus == true}
        <g class="ma-7">
          {#each ma7 as maPoint, i}
            <line
              class="ma7-line"
              x1={xScale(i + 6)}
              x2={xScale(i + 7)}
              y1={yScale(maPoint)}
              y2={yScale(ma7[i + 1] || ma7[i])}
              stroke-width="0.3%"
            />
          {/each}
        </g>
      {/if}
    </svg>
  </div>
{/if}

<style>
  .ma7-line {
    stroke: orange;
    opacity: 1;
  }
  h3 {
    color: var(--sonic-silver);
    text-align: center;
    position: relative;
  }

  .chart {
    width: 100%;
    max-width: 80vh;
    margin: 0 auto;
  }

  svg {
    position: relative;
    width: 100%;
    height: 300px;
  }

  .tick {
    font-family: Helvetica, Arial;
    font-size: 0.725em;
    font-weight: 200;
  }

  .tick line {
    stroke: #e2e2e2;
    stroke-dasharray: 2;
  }

  .tick text {
    fill: #ccc;
    text-anchor: start;
  }

  .tick.tick-0 line {
    stroke-dasharray: 0;
  }

  .x-axis .tick text {
    text-anchor: middle;
  }

  .active rect {
    fill: var(--cherry);
    stroke: none;
    opacity: 1;
  }
  .active rect.usd {
    fill: yellow;
    stroke: none;
    opacity: 1;
  }
  .inactive {
    fill: var(--onyx-dim);
    opacity: 1;
  }
  g.stacked-bar {
    height: 100%;
  }
  g.stacked-bar:hover > rect {
    fill: var(--cherry);
    opacity: 1;
  }
  g.stacked-bar:hover > rect.usd {
    fill: yellow;
    opacity: 1;
  }

  .loading-icon :global(svg) {
    height: 50px;
  }
  .empty {
    padding-top: 10%;
    display: flex;
    justify-content: center;
  }

  .y-axis {
    transform: translate(-5px, 0);
  }
  .y-axisText {
    font-family: 'Times New Roman', Times, serif;
  }

  .volumeETH {
    color: var(--cherry);
  }
  .volumeUSDC {
    color: yellow;
  }
</style>
