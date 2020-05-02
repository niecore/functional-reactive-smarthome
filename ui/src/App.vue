<template>
  <div id="app">
    <section class="section">
      <div class="container">
        <router-view />
      </div>
    </section>
  </div>
</template>

<style>
#app {
  text-align: center;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

@import "~vue-swatches/dist/vue-swatches.css";
@import "~bulma/css/bulma.css";
@import "~bulma-extensions/bulma-divider/dist/css/bulma-divider.min.css";
@import "~bulma-switch/dist/css/bulma-switch.min.css";
@import "~bulma-slider/dist/css/bulma-slider.min.css";
</style>
