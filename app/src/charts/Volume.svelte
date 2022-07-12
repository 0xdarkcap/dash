<script>
  import { get } from 'svelte/store';
  import { scaleLinear } from 'd3-scale';
  import { SPINNER_ICON } from '../../scripts/icons';
  import { onMount } from 'svelte';
  import { dayDataETH, ETHprice } from '../../scripts/stores';

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
      yTicks.push(Math.ceil((maxY * i) / (6 * 1000000)) * 1000000);
      console.log(Math.round(((points.length - 1) * (i - 1)) / 5));
      xTicks.push(
        new Date(
          86400000 * points[Math.round(((points.length - 1) * (i - 1)) / 5)].x
        )
      );
    }
    loading = false;
  });

  const padding = { top: 20, right: 15, bottom: 20, left: 25 };

  let width = 500;
  let height = 200;

  function formatMobile(tick) {
    return "'" + tick.toString().slice(-2);
  }

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var dat = a.getDate();
    var time = dat + ' ' + month + ' ' + year;
    return time;
  }
  function formatDate(date) {
    const month = '' + (date.getMonth() + 1);
    const day = '' + date.getDate();
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
    <h2>Volume in USD</h2>
  {:else}
    <h2>
      {date} |
      <span class="volume">{numberWithCommas(Math.round(activePoint.y))} $</span
      >
    </h2>
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
              transform="translate(0, {yScale(tick)})"
            >
              <line x2="100%" style="transform: scaleX(1.05)" />
              <text y="-4" class="y-axisText"
                >{(tick / 1000000).toString() + 'M'}</text
              >
            </g>
          {/each}
        </g>
      {:else}
        <g class="axis selected">
          <g
            class="tick selected"
            transform="translate(0,{yScale(activePoint.y)})"
          >
            <line x2="100%" />
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
            <text x={barWidth / 2} y="-4"
              >{width > 380
                ? formatDate(xTick)
                : formatMobile(formatDate(xTick))}</text
            >
          </g>
        {/each}
      </g>

      <!--bars-->
      <g class={focus == true ? 'inactive' : 'active'}>
        {#each points as point, i}
          <!-- svelte-ignore a11y-mouse-events-have-key-events -->
          <rect
            on:mouseenter={() => {
              activePoint = point;
              date = timeConverter(point.x * 86400);
            }}
            x={xScale(i) + 2}
            y={yScale(point.y)}
            width={barWidth - 1}
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

  .active rect {
    fill: var(--orange);
    stroke: none;
    opacity: 1;
  }
  .inactive {
    fill: var(--onyx-dim);
    opacity: 1;
  }
  rect:hover {
    fill: var(--green);
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
    transform: translate(-30px, 0);
  }
  .y-axisText {
    font-family: 'Times New Roman', Times, serif;
  }

  .volume {
    color: var(--green);
  }
</style>
