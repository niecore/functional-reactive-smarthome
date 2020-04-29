<template>
  <div>
    <div :id="device + '_color'" class="color-box" v-bind:style='{ backgroundColor: getCssColor }'></div>

    <div class="container">
      <div class="columns">
        <div class="column has-text-left">
          <span>hue</span>
        </div>
        <div class="column has-text-right">
          <input class="slider is-fullwidth" step="1" min="0" max="360" v-model="hue" v-on:change="updateData()"
                 type="range">
        </div>
      </div>
    </div>

    <div class="container">
      <div class="columns">
        <div class="column has-text-left">
          <span>saturation</span>
        </div>
        <div class="column has-text-right">
          <input class="slider is-fullwidth" step="1" min="0" max="100" v-model="saturation" v-on:change="updateData()"
                 type="range">
        </div>
      </div>
    </div>

  </div>
</template>

<script>
    const space = require('color-space');
    const R = require("ramda");

    export default {
        props: ["color", "device"],
        name: "Color",
        data() {
            return {
                hue: this.color.hue,
                saturation: this.color.saturation,
                swatches: ['#f8ff00', '#f6008c', '#f24cf4',
                    '#42f8ee', '#ff0500', '#0001f6']
            }
        },
        computed: {
            getCssColor() {
                if (this.color.hue && this.color.saturation) {
                    return `hsl(${this.color.hue}, ${this.color.saturation}%, 90%)`;
                } else if (this.color.x && this.color.y) {
                    const hsl = space.xyz.hsluv(space.xyy.xyz([this.color.x, this.color.y, 1]))
                    return `hsl(${hsl[0]}, ${hsl[0]}%, 90%)`;
                } else {
                    return `hsl(0, 0%, 90%)\``;
                }
            }
        },
        methods: {
            updateData() {
                this.$socket.emit('frs', JSON.stringify(R.objOf(this.device, {
                    color: {
                        hue: this.hue,
                        saturation: this.saturation,
                    }
                })));
            }
        }
    }
</script>


<style scoped>
  .color-box {
    height: 3em;
    margin: -1.5rem -1.5rem 1.5rem -1.5rem;
  }
</style>
