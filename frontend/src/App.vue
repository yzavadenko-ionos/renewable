<script setup lang="ts">
  import { computed, reactive, ref, watchEffect } from 'vue';
  import { RadiationData } from './types/RadiationData';
  import { GeoLocation } from './types/GeoLocation';
  import ChartComponent from './components/ui/ChartComponent.vue';
  import { computeMonthlyAverageRadiation } from './utils/computeMonthlyAverageRadiation';
  import { computeMonthlyEnergyOutput } from './utils/computeMonthlyEnergyOutput';

  // Model Data for user location
  const location: GeoLocation = reactive<GeoLocation>({
    lat: null,
    lng: null
  })

  // Model Data for solar panel details and fetched radiation data
  const radiationData = ref<RadiationData | null>(null)
  const systemSize = ref<number | null>(null)
  const tiltAngle = ref<number>(0) // Default tilt angle, can be made user input later
  const panelEfficiency = ref<number | null>(null)
  const orientation = ref<string>("")

  // Some state predicates for UI logic
  const loading = ref<boolean>(false)
  const isLocationSet = computed(() => location.lat != null && location.lng != null)
  const isPanelFormValid = computed(() => 
    Boolean(
      isLocationSet.value &&
      radiationData.value &&
      // Check if the panel details are valid number and not NaN using typeof check
      typeof systemSize.value === 'number' &&
      typeof panelEfficiency.value === 'number' &&
      typeof tiltAngle.value === 'number' &&

      orientation.value !== ""
    )
  )


  // Computed properties to process radiation data and calculate energy output
  const monthlyAverageRadiation = computed(() => {
    if (!radiationData.value) return null
    return computeMonthlyAverageRadiation(radiationData.value.hourly)
  })

  const monthlyEnergyOutput = computed(() => {
    if (!monthlyAverageRadiation.value || !isPanelFormValid.value) return [];

    const tiltDiff = Math.abs((tiltAngle.value || 0) - Math.abs(location.lat || 0));
    
    return computeMonthlyEnergyOutput(
      monthlyAverageRadiation.value,
      systemSize.value!,
      panelEfficiency.value!,
      orientation.value,
      tiltDiff
    )
  });

  const yearlyEnergyOutput = computed(() => {
    if (monthlyEnergyOutput.value.length === 0) return 0;
    return monthlyEnergyOutput.value.reduce((sum, item) => sum + item.energy, 0);
  });


  // Function to get user location using Geolocation API
  function getUserLocation() {
    if(navigator.geolocation) {
      loading.value = true
      navigator.geolocation.getCurrentPosition(
        (positition: GeolocationPosition) => {
          location.lat = positition.coords.latitude
          location.lng = positition.coords.longitude
          loading.value = false
        },
        (positionError: GeolocationPositionError) => {
          console.error(positionError)
          loading.value = false
        }  
      )
    }
  }

  async function fetchLocationSunRadiation() {
    if (!isLocationSet.value) {
      throw new Error("Location not set")
    }

    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${location.lat}&longitude=${location.lng}&start_date=2025-01-01&end_date=2026-01-31&hourly=shortwave_radiation&timezone=auto`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch radiation data: ${response.statusText}`)
    }

    const data: RadiationData = await response.json()
    radiationData.value = data
  }

</script>
<template>
  <main class="min-h-screen bg-gray-50 p-8">

    <header class="max-w-6xl mx-auto mb-10">
      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h1 class="text-3xl font-semibold text-gray-800">
          Solar Radiation Dashboard
        </h1>
        <p class="text-gray-500 mt-2">
          View your location and analyze real-time solar radiation data.
        </p>
      </div>
    </header>

    <div class="max-w-6xl mx-auto grid grid-cols-2 xl:grid-cols-2 gap-8">

      <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-6">

        <h2 class="text-xl font-semibold text-gray-800">
          Your Location
        </h2>

        <div class="bg-gray-50 rounded-md p-4 space-y-3">
          <div class="flex justify-between text-gray-700">
            <span>Latitude</span>
            <span class="font-mono">
              {{ location.lat ?? "Unknown" }}
            </span>
          </div>

          <div class="flex justify-between text-gray-700">
            <span>Longitude</span>
            <span class="font-mono">
              {{ location.lng ?? "Unknown" }}
            </span>
          </div>
        </div>

        <div class="space-y-3">

          <button
            @click="getUserLocation"
            :disabled="loading"
            class="w-full bg-slate-800 hover:bg-slate-900 disabled:bg-gray-300 text-white font-medium py-2.5 rounded-md transition"
          >
            {{ loading ? "Detecting location..." : "Detect Location" }}
          </button>

          <button
            @click="fetchLocationSunRadiation"
            :disabled="!isLocationSet"
            class="w-full bg-slate-600 hover:bg-slate-700 disabled:bg-gray-300 text-white font-medium py-2.5 rounded-md transition"
          >
            {{ isLocationSet ? "Fetch Solar Radiation" : "Waiting for location..." }}
          </button>

        </div>

        <div>
          <span
            v-if="isLocationSet"
            class="text-sm text-gray-600"
          >
            Location ready
          </span>

          <span
            v-else
            class="text-sm text-gray-400"
          >
            Location not set
          </span>
        </div>

      </div>

      
    <div class="bg-white rounded-lg shadow-sm p-6 border border-gray-200 space-y-6">

      <h2 class="text-xl font-semibold text-gray-800">
        Solar Panel Details
      </h2>

      <div class="space-y-4">

          <!-- System Size -->
          <div class="flex flex-col space-y-1">
            <label class="text-sm text-gray-600">System Size (kWp)</label>
            <input
              v-model.number="systemSize"
              type="number"
              step="0.1"
              placeholder="e.g. 5"
              class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          <div class="flex flex-col space-y-1">
            <label class="text-sm text-gray-600">Tilt Angle (degrees)</label>
            <input
              v-model.number="tiltAngle"
              type="number"
              step="1"
              placeholder="e.g. 5"
              class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          <!-- Panel Efficiency -->
          <div class="flex flex-col space-y-1">
            <label class="text-sm text-gray-600">Panel Efficiency (%)</label>
            <input
              v-model.number="panelEfficiency"
              type="number"
              step="0.1"
              placeholder="e.g. 20"
              class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          <!-- Orientation -->
          <div class="flex flex-col space-y-1">
            <label class="text-sm text-gray-600">Orientation</label>
            <select
              v-model="orientation"
              class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option disabled value="">Select orientation</option>
              <option>South</option>
              <option>South-East</option>
              <option>South-West</option>
              <option>East</option>
              <option>West</option>
            </select>
          </div>
        </div>
  </div>


      <div class="col-span-3 bg-white rounded-lg shadow-sm border border-gray-200 min-h-[400px]">

        <GMapMap  
          v-if="isLocationSet"
          :key="location.lat + '-' + location.lng"
          :center="{ lat: location.lat!, lng: location.lng! }"
          :zoom="15"
          class="w-full h-full"
        >
          <GMapMarker :position="{ lat: location.lat!, lng: location.lng! }" />
        </GMapMap>

        <div
          v-else
          class="flex items-center justify-center h-full text-gray-400"
        >
          Map will appear once location is retrieved
        </div>

      </div>

    </div>

    <div
      v-if="radiationData"
      class="max-w-6xl mx-auto mt-12 bg-white rounded-lg shadow-sm p-6 border border-gray-200"
    >
      <h2 class="text-xl font-semibold text-gray-800 mb-6">
        Solar Radiation Analysis for ({{ location.lat }}, {{ location.lng }})
      </h2>

      <ChartComponent :monthly-average-radiation="monthlyAverageRadiation" :yearly-energy-output="yearlyEnergyOutput" />
    </div>

  </main>
</template>