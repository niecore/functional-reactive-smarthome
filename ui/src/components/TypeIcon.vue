<template>
  <div v-if="type === 'light'">
    <span class="icon">
      <i class="fas fa-lightbulb"></i>
    </span>
  </div>
  <div v-else-if="type === 'air_sensor'">
    <span class="icon">
      <i class="fas fa-temperature-low"></i>
    </span>
  </div>
  <div v-else-if="type === 'contact'">
    <span class="icon">
      <i class="fas fa-door-open"></i>
    </span>
  </div>
  <div v-else-if="type === 'remote'">
    <span class="icon">
      <i class="fas fa-gamepad"></i>
    </span>
  </div>
  <div v-else-if="type === 'motion_sensor'">
    <span class="icon">
      <i class="fas fa-running"></i>
    </span>
  </div>
  <div v-else-if="type === 'plug'">
    <span class="icon">
      <i class="fas fa-plug"></i>
    </span>
  </div>
  <div v-else-if="type === 'relay'">
    <span class="icon">
      <i class="fas fa-plug"></i>
    </span>
  </div>
  <div v-else></div>
</template>

<script>
export default {
  props: ["type"],
  name: "TypeIcon"
};
</script>

<style scoped></style>
