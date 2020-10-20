<template>
  <div>
    <button v-on:click="increaseSetpoint" class="button is-fullwidth is-danger is-outlined">+</button>
    <div class="currentTemp">{{ this.state.temperature }} C°</div>
    <div class="setpointTemp">{{ this.state.setpoint }} C°</div>
    <button v-on:click="decreaseSetpoint" class="button is-fullwidth is-info is-outlined">-</button>
  </div>
</template>

<script>
    const R = require("ramda");
    const Util = require("../../../../src/util.js");
    export default {
        name: "Etrv",
        props: ["device", "state"],
        methods: {
            increaseSetpoint() {

                if(this.state.setpoint == 30) {return;}

                this.state.setpoint += 0.5;
                this.valueChanged()
            },
            decreaseSetpoint() {
                if(this.state.setpoint == 5) {return;}

                this.state.setpoint -= 0.5;
                this.valueChanged()
            },
            updateData() {
                this.$socket.emit(
                    "frs",
                    JSON.stringify(R.objOf(this.device, {setpoint: this.state.setpoint}))
                );
            }
        },
        created() {
            this.valueChanged = Util.debounce(2000, this.updateData)
        }
    }
</script>

<style scoped>
  .currentTemp {
    font-size: 2em;
  }

  .setpointTemp {
    font-size: 1em;
  }

  .button {
    margin: 1em 0em;
  }
</style>
