<template>
  <div>


    <div class="columns">
      <div class="column">
        <button v-on:click="decreaseSetpoint" class="button is-fullwidth is-fullheight is-info is-outlined">-</button>
      </div>
      <div class="column">
        <div class="currentTemp">{{ this.state.temperature }} °C</div>
        <div class="setpointTemp">{{ this.state.setpoint }} °C</div>
      </div>
      <div class="column">
        <button v-on:click="increaseSetpoint" class="button is-fullheight is-fullwidth is-danger is-outlined">+</button>
      </div>
    </div>




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
    font-size: 1.75em;
  }

  .setpointTemp {
    font-size: 0.75em;
  }

  .button {
    margin: 0em 0em;
    height: 100%;
  }
</style>
