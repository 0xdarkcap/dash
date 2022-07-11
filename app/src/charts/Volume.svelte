<script>
  import { get } from "svelte/store";
  import { scaleLinear } from "d3-scale";
  import { SPINNER_ICON } from "../../scripts/icons";
  import { onMount } from "svelte";
  import { dayDataETH, ETHprice } from "../../scripts/stores";
  import { element } from "svelte/internal";

  let loading = true;
  let points = [];
  let xValues = [];
  //   let BTCPrice;
  let ETHPrice;
  const xTicks = [];
  const yTicks = [];
  onMount(async () => {
    ETHPrice = await get(ETHprice);
    await get(dayDataETH).forEach((element) => {
      xValues.push(parseInt(element.id.slice(43)));
      points.push({
        x: parseInt(element.id.slice(43)),
        y: (ETHPrice * parseInt(element.cumulativeVolume)) / 100000000,
      });
    });
    // BTCPrice = await get(BTCprice);
    const maxY = points
      .map((i) => i.y)
      .reduce((acc, curr) => (curr > acc ? curr : acc), 0);
    for (let i = 1; i <= 6; i++) {
      yTicks.push(Math.round((maxY * i) / (6 * 100)) * 100);
      xTicks.push(
        new Date(86400000 * points[Math.round(((points.length - 1) * i) / 6)].x)
      );
    }
    loading = false;
  });
  /*const points = [
        { year: 1990, birthrate: 16.7 },
        { year: 1995, birthrate: 14.6 },
        { year: 2000, birthrate: 14.4 },
        { year: 2005, birthrate: 14 },
        { year: 2010, birthrate: 13 },
        { year: 2015, birthrate: 12.4 },
    ];*/

  const padding = { top: 20, right: 15, bottom: 20, left: 25 };

  let width = 500;
  let height = 200;

  function formatMobile(tick) {
    return "'" + tick.toString().slice(-2);
  }

  function formatDate(date) {
    const month = "" + (date.getMonth() + 1);
    const day = "" + date.getDate();
    return `${day}/${month}`;
  }

  $: xScale = scaleLinear()
    .domain([0, xValues.length])
    .range([padding.left, width - padding.right]);

  $: yScale = scaleLinear()
    .domain([0, Math.max.apply(null, yTicks)])
    .range([height - padding.bottom, padding.top]);

  $: innerWidth = width - (padding.left + padding.right);
  $: barWidth = innerWidth / xValues.length;
</script>

{#if loading}
  <div class="empty">
    <div class="loading-icon">{@html SPINNER_ICON}</div>
  </div>
  <div>
    <center><h1>Building Graph</h1></center>
  </div>
{:else}
  <h2>US birthrate by year</h2>

  <div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
    <svg>
      <!-- y axis -->
      <g class="axis y-axis">
        {#each yTicks as tick}
          <g class="tick tick-{tick}" transform="translate(0, {yScale(tick)})">
            <line x2="100%" />
            <text y="-4"
              >{tick}
              {tick === 20 ? " per 1,000 population" : ""}</text
            >
          </g>
        {/each}
      </g>

      <!-- x axis -->
      <g class="axis x-axis">
        {#each xTicks as xTick, i}
          <g class="tick" transform="translate({xScale(i * 20)},{height})">
            <text x={barWidth / 2} y="-4"
              >{width > 380
                ? formatDate(xTick)
                : formatMobile(formatDate(xTick))}</text
            >
          </g>
        {/each}
      </g>

      <g class="bars">
        {#each points as point, i}
          <rect
            x={xScale(i) + 2}
            y={yScale(point.y)}
            width={barWidth - 4}
            height={yScale(0) - yScale(point.y)}
          />
        {/each}
      </g>
    </svg>
  </div>
{/if}

<style>
  h2 {
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

  .bars rect {
    fill: rgb(249, 71, 71);
    stroke: none;
    opacity: 0.65;
  }
  .loading-icon :global(svg) {
    height: 50px;
  }
  .empty {
    padding-top: 10%;
    display: flex;
    justify-content: center;
  }
</style>
