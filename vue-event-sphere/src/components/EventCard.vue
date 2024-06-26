<script setup>
import { useRouter } from 'vue-router';
import { defineProps, onMounted, ref } from 'vue';
import { useLocationStore } from '@/store/locationStore';

const locationStore = useLocationStore();

const router = useRouter();

const props = defineProps({
  event: {
    type: Object,
    required: true
  }
});

function goToEvent(eventId) {
  const redirectUrl = `/eventdetails/${eventId}`;
  router.push(redirectUrl);
}

const location = ref({ city: '', country:'' });

const getLocation = async () => {
  try {
    const loc = await locationStore.getLocationById(props.event.locationId);
    location.value = loc;
  } catch (err) {
    console.error(err);
  }
}

onMounted(async () => {
  await getLocation();
})

function formatDateString(dateString) {
  const monthsFull = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const date = new Date(dateString);
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${day} ${monthsFull[monthIndex]} ${year}`;
}
</script>

<template>
  <div class="event-card m-2">
    <div class="d-flex justify-content-center my-5">
      <div class="card shadow-lg mx-3" style="width: 23rem; border-radius: 10px; overflow: hidden;">
        <img :src="`data:image/png;base64,${event.photoData}`" class="card-img-top" alt="Event Image" style="height: 250px; object-fit: cover;">
        <div class="card-body" style="background-color: #fff; padding: 20px;">
          <h5 class="card-title text-center mb-3" style="font-weight: bold; color: #333;">{{ event.eventName }}</h5>
          <div class="d-flex justify-content-center align-items-center mb-3" style="color: #666;">
            <i class="bi bi-calendar-event mr-2"></i>
            <span>{{ formatDateString(event.startDate) }}</span>
            <span class="mx-2">-</span>
            <span>{{ formatDateString(event.endDate) }}</span>
          </div>
          <p class="card-text text-center mb-3" v-if="location.city" style="color: #666;">
            <i class="bi bi-geo-alt-fill mr-2"></i>{{ location.city }}, {{ location.country }}
          </p>
          <p class="card-text text-center mb-4" style="color: #666;">
            <i class="bi bi-ticket-perforated mr-2"></i> Tickets left:<strong class="ticket-nr"> {{ event.availableTickets }}</strong>
          </p>
          <div class="text-center">
            <button @click="() => goToEvent(event.id)" class="btn btn-primary" style=" border: none; padding: 10px 20px; border-radius: 5px;">
              Find out more
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.event-title {
  font-size: 1.5rem;
  color: #333;
  text-transform: capitalize;
}
.mr-3 {
  margin-right: 1rem;
}
.btn {
  text-transform: none;
  background-color: transparent;
  color: #6596E0;
  outline: #6596E0;
}
i {
  color: #6596E0;
  margin-right: 5px;
}
.address{
  text-transform: capitalize;
}
.card-title {
  font-family: 'Roboto', sans-serif;
  font-size: 1.5rem;
}
.card-text {
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
}
.ticket-nr{
  margin-left: 5px;
}
.event-card {
  transition: transform 0.3s ease; /* Smooth transition for the scaling */
}

.event-card:hover {
  transform: scale(1.1); /* Scale the card to 110% of its original size on hover */
}

</style>
