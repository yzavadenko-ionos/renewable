<script setup lang="ts">
  import { computed, reactive, ref } from 'vue';
  import { RadiationData } from './types/RadiationData';
  import { GeoLocation } from './types/GeoLocation';
import ChartComponent from './components/ui/ChartComponent.vue';

  const location: GeoLocation = reactive<GeoLocation>({
    lat: null,
    lng: null
  })

  const loading = ref<boolean>(false)
  const isLocationSet = computed(() => location.lat != null && location.lng != null)
  const radiationData = ref<RadiationData | null>(null)
  
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

  // TODO: Handle API errors and edge cases (e.g., no data available for location)
  async function fetchLocationSunRadiation() {
    if (!isLocationSet) {
      throw new Error("Location not set")
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lng}&hourly=shortwave_radiation,direct_normal_irradiance`
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

    <div class="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">

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

      <div class="xl:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 min-h-[400px]">

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

    <!-- CHART SECTION -->
    <div
      v-if="radiationData"
      class="max-w-6xl mx-auto mt-12 bg-white rounded-lg shadow-sm p-6 border border-gray-200"
    >
      <h2 class="text-xl font-semibold text-gray-800 mb-6">
        Solar Radiation Analysis
      </h2>

      <ChartComponent :radiation-data="radiationData" />
    </div>

  </main>
</template>