<script>
  import { get } from 'svelte/store';
  import { scaleLinear } from 'd3-scale';
  import { SPINNER_ICON } from '../../scripts/icons';
  import { onMount } from 'svelte';
  import { dayData, ETHprice } from '../../scripts/stores';
  import { ETH } from '../../scripts/constants';
  import {
    numberWithCommas,
    timeConverter,
    formatDate,
    priceTickFormatter,
    priceFormatter,
  } from '../../scripts/utils';

  let loading = true;
  let points = [];
  let xValues = [];
  //   let BTCPrice;
  let ETHPrice;
  const xTicks = [];
  let yTicks = [];
  let maxY;
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
          points[points.length - 1].yETH = priceFormatter(
            element.cumulativeFees
          );
        } else {
          points[points.length - 1].yUSD = priceFormatter(
            element.cumulativeFees
          );
        }
        if (
          points[points.length - 1].yUSD != undefined &&
          points[points.length - 1].yETH != undefined
        ) {
          points[points.length - 1].y = +(
            ETHPrice * points[points.length - 1].yETH +
            points[points.length - 1].yUSD
          ).toFixed(2);
        }
      };
      data.forEach(pushElementToData);
    };

    await getDayData();

    maxY = Math.max(...points.map((i) => i.y));

    for (let i = 1; i <= 6; i++) {
      xTicks.push(
        new Date(
          86400000 * points[Math.round(((points.length - 1) * (i - 1)) / 5)].x
        )
      );
    }
    yTicks = scaleLinear()
      .domain([0, maxY])
      .range([height - padding.bottom, padding.top])
      .nice()
      .ticks(6);
    maxY = Math.max(maxY, yTicks[yTicks.length - 1]);
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
    <h3>Protocol Revenue</h3>
  {:else}
    <h3>
      {date} | Ξ:
      <span class="volumeETH"
        >{numberWithCommas(activePoint.yETH.toFixed(2))}</span
      >
      | USDC:
      <span class="volumeUSDC"
        >{numberWithCommas(activePoint.yUSD.toFixed(0))}$</span
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
              <text y="-4" class="y-axisText">{priceTickFormatter(tick)}</text>
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
            <text class="y-axisText selected"
              >{priceTickFormatter(
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
          <g
            class="stacked-bar"
            on:mouseenter={() => {
              activePoint = point;
              date = timeConverter(point.x * 86400);
            }}
          >
            <!-- ETH bar: -->
            <rect
              x={xScale(i).toFixed(2) + 2}
              y={yScale(ETHPrice * point.yETH).toFixed(2) || 0}
              width={barWidth || 0}
              height={(yScale(0) - yScale(ETHPrice * point.yETH)).toFixed(2) ||
                0}
            />
            <!-- USD bar: -->
            <rect
              class="usd"
              x={xScale(i).toFixed(2) + 2}
              y={yScale(point.y).toFixed(2) || 0}
              width={barWidth || 0}
              height={(yScale(ETHPrice * point.yETH) - yScale(point.y)).toFixed(
                2
              ) || 0}
            />
          </g>
        {/each}
      </g>
    </svg>
  </div>
{/if}

<style>
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

  .y-axis {
    transform: translate(-5px, 0);
  }
  .y-axisText {
    font-family: 'Times New Roman', Times, serif;
  }
  .y-axisText.selected {
    transform: translate(0px, -4px);
  }

  .volumeETH {
    color: var(--cherry);
  }
  .volumeUSDC {
    color: yellow;
  }
</style>
