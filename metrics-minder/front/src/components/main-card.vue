<template>
  <Card>
    <template #title>
      Main card
    </template>
    <template #content>
      <Button>This is a test</Button>
    </template>
  </Card>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import Card from 'primevue/card';

export default defineComponent({
  name: 'MainCard',
  components: {
    Card
  },
  setup() {
    return {}
  }
})
</script>
