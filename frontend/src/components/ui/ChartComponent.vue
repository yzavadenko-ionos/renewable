<script setup lang="ts">
import { RadiationData } from '@/types/RadiationData'
import { computed } from 'vue';

const { radiationData } = defineProps<{ radiationData: RadiationData | null }>()

const options = {
  series: [
    {
      name: 'Shortwave Radiation (W/m²)',
      data: radiationData.hourly.shortwave_radiation,
    },
  ],
  chart: {
    type: 'area',
    height: 350,
    zoom: {
      enabled: true,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth', 
  },
  title: {
    text: `Radiation Levels at ${radiationData.latitude.toFixed(
      2
    )}, ${radiationData.longitude.toFixed(2)}`,
    align: 'left',
  },
  subtitle: {
    text: 'Hourly Radiation',
    align: 'left',
  },
  labels: radiationData.hourly.time, 
  xaxis: {
    type: 'datetime',
    title: {
      text: 'Time',
    },
  },
  yaxis: {
    opposite: false,
    title: {
      text: 'Radiation (W/m²)',
    },
  },
  legend: {
    horizontalAlign: 'left',
  },
  tooltip: {
    x: {
      format: 'dd MMM yyyy HH:mm', 
    },
  },
}

const series = computed(() => [
  {
    name: 'Shortwave Radiation (W/m²)',
    data: radiationData.hourly.shortwave_radiation,
  },
])

</script>

<template>
    <apexchart
        type="area"
        height="600"
        :options="options"
        :series="series"
    />
</template>
