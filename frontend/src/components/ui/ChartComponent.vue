<script setup lang="ts">
import { computed } from 'vue';

type MonthlyAverageRadiation = {
  month: string
  averageRadiation: number
}

type Props = {
  monthlyAverageRadiation: MonthlyAverageRadiation[]
  yearlyEnergyOutput: number
}

const { monthlyAverageRadiation, yearlyEnergyOutput } = defineProps<Props>()

const series = [
  {
    name: 'Average Shortwave Radiation (W/m²)',
    data: monthlyAverageRadiation.map(m => m.averageRadiation)
  }
]

// X-axis labels: month names
const labels = monthlyAverageRadiation.map(m => m.month)

const options = computed(() => ({
  chart: {
    type: 'area',
    height: 400,
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '50%',
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => val.toFixed(2)
  },
  xaxis: {
    categories: labels,
    title: {
      text: 'Month'
    }
  },
  yaxis: {
    title: {
      text: 'Average Radiation (W/m²)'
    }
  },
  title: {
    text: 'Monthly Average Shortwave Radiation',
    align: 'center',
  },
   subtitle: {
    text: `Yearly Energy Yield: ${yearlyEnergyOutput.toFixed(2)} kWh`,
    align: 'center',
    style: {
      fontSize: '14px',
      fontWeight: 600
    }
  },
  tooltip: {
    y: {
      formatter: (val: number) => `${val.toFixed(2)} W/m²`
    }
  }
}))

</script>

<template>
    <apexchart
        :options="options"
        :series="series"
    />
</template>
