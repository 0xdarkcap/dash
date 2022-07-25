<script>
</script>

<header>
  <div class="inner">
    <div class="left">
      <a class="logo" href="/"> <h1>🧢</h1> </a>
      <a class="link" href="#/trades">Trades</a>
    </div>
  </div>
</header>

<style>
  header {
    background-color: var(--eerie-black);
  }

  .inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 var(--base-padding);
    height: var(--header-height);
  }

  .home {
    max-width: 960px;
    margin: 0 auto;
  }

  .left {
    display: flex;
    align-items: center;
  }

  .link {
    color: var(--silver-chalice);
    margin-right: 14px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: var(--base-radius);
  }

  .logo {
    margin-right: 26px;
  }

  @media (max-width: 600px) {
    .logo {
      margin-right: 12px;
    }
    .link {
      margin-right: 0;
    }
  }

  .link:hover {
    color: #fff;
    background-color: #242424;
  }

  .link.active {
    color: var(--green);
    font-weight: 600;
    background-color: #1b261b;
  }

  img {
    height: 12px;
    filter: grayscale(1);
    opacity: 0.65;
  }

  .logo:hover img {
    filter: grayscale(1);
    opacity: 1;
  }
</style>
