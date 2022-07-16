<script>
  import { get } from 'svelte/store';
  import { onMount } from 'svelte';
  import { scaleLinear, scaleSqrt } from 'd3-scale';
  import { ETH, PRICE_DENOMINATOR } from '../../scripts/constants';
  import { SPINNER_ICON } from '../../scripts/icons';
  import { positionsData, ETHprice } from '../../scripts/stores';

  let loading = true;
  let points = [];

  let svg;
  let width = 500;
  let height = 1000;
  const padding = { top: 20, right: 15, bottom: 20, left: 25 };

  onMount(async () => {
    let ETHPrice = await get(ETHprice);
    let data = await get(positionsData);
    console.log(data);
    data = data.filter(
      (position) => position.liquidationPrice / PRICE_DENOMINATOR < ETHPrice * 5
    );
    data.forEach((position) => {
      points.push({
        x:
          Math.ceil((position.liquidationPrice * 100) / PRICE_DENOMINATOR) /
          100,
        y: parseInt(
          (position.currency == ETH
            ? position.margin * ETHPrice
            : position.margin) / 100000
        ),
      });
    });
    const maxX = Math.max(...points.map((i) => i.x));
    const minX = Math.min(...points.map((i) => i.x));
    const maxY = Math.max(...points.map((i) => i.y));
    const minY = Math.min(...points.map((i) => i.y));
    for (let i = 1; i <= 6; i++) {
      yTicks.push(minY + ((i - 1) * maxY) / 5);
      xTicks.push(minX + ((i - 1) * maxX) / 5);
    }

    console.log(points);
    console.log(yTicks);
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
  <div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
    <svg bind:this={svg} style="overflow: visible">
      <!-- y axis -->
      <g class="axis y-axis">
        {#each yTicks as tick}
          <g class="tick tick-{tick}" transform="translate(0, {yScale(tick)})">
            <line x1={padding.left} x2="100%" />
            <text x={padding.left - 8} y="+4"
              >{Math.round(tick / 1000000).toString() + 'M'}</text
            >
          </g>
        {/each}
      </g>

      <!-- x axis -->
      <g class="axis x-axis">
        {#each xTicks as tick}
          <g class="tick" transform="translate({xScale(tick)},0)">
            <line y1={yScale(0)} y2={yScale(Math.max(...yTicks))} />
            <text y={height - padding.bottom + 20}>{tick}</text>
          </g>
        {/each}
      </g>

      <!-- data -->
      {#each points as point}
        <circle
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

  circle {
    fill: orange;
    fill-opacity: 0.6;
    stroke: rgba(0, 0, 0, 0.5);
  }

  .tick line {
    stroke: #ddd;
    stroke-dasharray: 2;
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
