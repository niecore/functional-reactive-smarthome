<template>
  <div>
    <div
      :id="name + '_color'"
      class="color-box"
      v-bind:style="{ backgroundColor: getCssColor }"
    ></div>

    <div class="container">
      <div class="columns">
        <div class="column has-text-left">
          <span>hue</span>
        </div>
        <div class="column has-text-right">
          <input
            class="slider is-fullwidth"
            step="1"
            min="0"
            max="360"
            v-model="state.color.hue"
            v-on:change="updateData()"
            type="range"
          />
        </div>
      </div>
    </div>

    <div class="container">
      <div class="columns">
        <div class="column has-text-left">
          <span>saturation</span>
        </div>
        <div class="column has-text-right">
          <input
            class="slider is-fullwidth"
            step="1"
            min="0"
            max="100"
            v-model="state.color.saturation"
            v-on:change="updateData()"
            type="range"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const space = require("color-space");
const R = require("ramda");

export default {
  props: ["state", "name"],
  name: "Color",
  computed: {
    getCssColor() {
      if (!this.state || !this.state.color) {
        return `hsl(0, 0%, 90%)`;
      } else  if (this.state.color.hue && this.state.color.saturation) {
        return `hsl(${this.state.color.hue}, ${this.state.color.saturation}%, 90%)`;
      } else if (this.state.color.x && this.state.color.y) {
        const hsl = space.xyz.hsluv(
          space.xyy.xyz([this.state.color.x, this.state.color.y, 1])
        );
        return `hsl(${hsl[0]}, ${hsl[0]}%, 90%)`;
      } else {

      }
    }
  },
  methods: {
    updateData() {
      this.$socket.emit(
        "frs",
        JSON.stringify(
          R.objOf(this.name, {
            color: {
              hue: this.state.color.hue,
              saturation: this.state.color.saturation
            }
          })
        )
      );
    }
  }
};
</script>

<style scoped>
.color-box {
  height: 3em;
  margin: -1.5rem -1.5rem 1.5rem -1.5rem;
}
</style>
