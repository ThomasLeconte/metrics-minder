<template>
  <Card class="custom-card" v-bind="$attrs">
    <template #title>
      <slot name="title">
        {{ title }}
      </slot>
    </template>
    <template #content>
      <slot />
    </template>
  </Card>
</template>

<script lang="ts">
export default defineComponent({
  name: 'CustomCard',
  props: {
    title: {
      type: String,
      required: false
    }
  },
  setup() {
    return {}
  }
})
</script>

<style scoped>
.custom-card {
  box-shadow: 0 10px 3px 0 rgba(0,0,0,0.1),0 1px 2px -1px rgba(0,0,0,0.1);
}
</style>