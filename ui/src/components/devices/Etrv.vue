<template>
  <div>
    <button v-on:click="increaseSetpoint" class="button is-fullwidth is-danger is-outlined">+</button>
    <div class="currentTemp">{{ this.temperature }} C°</div>
    <div class="setpointTemp">{{ this.setpoint }} C°</div>
    <button v-on:click="decreaseSetpoint" class="button is-fullwidth is-info is-outlined">-</button>
  </div>
</template>

<script>
    const R = require("ramda");
    export default {
        name: "Etrv",
        data() {
            return {
                setpoint: this.$parent.state.setpoint,
                temperature: this.$parent.state.temperature,
            };
        },
        methods: {
            increaseSetpoint() {

                if(this.setpoint == 30) {return;}

                this.setpoint += 1;
                this.updateData()
            },
            decreaseSetpoint() {
                if(this.setpoint == 5) {return;}

                this.setpoint -= 1;
                this.updateData()
            },
            updateData() {
                this.$socket.emit(
                    "frs",
                    JSON.stringify(R.objOf(this.$parent.name, {setpoint: this.setpoint}))
                );
            }
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
