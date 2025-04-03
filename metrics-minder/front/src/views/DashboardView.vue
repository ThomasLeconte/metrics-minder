<template>
  <div class="container">
    <MainCard />
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Button from 'primevue/button';
import MainCard from "../components/main-card.vue";

export default defineComponent({
  name: 'DashboardView',
  components: {
    Button,
    MainCard
  }
})
</script>
