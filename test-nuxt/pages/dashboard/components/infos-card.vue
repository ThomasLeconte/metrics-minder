<template>
  <CustomCard title="Main informations">
    <table class="w-full bg-gray-50 rounded-lg overflow-hidden mb-4">
      <thead class="bg-gray-200">
      <tr>
        <th class="py-2 px-4 text-left">Caractéristique</th>
        <th class="py-2 px-4 text-left">Valeur</th>
      </tr>
      </thead>
      <tbody id="main-info">
      <tr>
        <td class="py-2 px-4">OS</td>
        <td class="py-2 px-4" id="os-info">Chargement...</td>
      </tr>
      <tr>
        <td class="py-2 px-4">CPU</td>
        <td class="py-2 px-4" id="cpu-info">Chargement...</td>
      </tr>
      <tr>
        <td class="py-2 px-4">Mémoire totale</td>
        <td class="py-2 px-4" id="memory-info">Chargement...</td>
      </tr>
      <tr>
        <td class="py-2 px-4">Espace disque total</td>
        <td class="py-2 px-4" id="disk-info">Chargement...</td>
      </tr>
      </tbody>
    </table>
  </CustomCard>
</template>

<script lang="ts">
import CustomCard from "~/pages/dashboard/components/custom-card.vue";

export default defineComponent({
  name: 'InfosCard',
  components: {
    CustomCard
  },
  setup() {
    return {}
  }
})
</script>