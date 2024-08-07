<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useTicketStore } from "@/store/ticketStore.js";
import Swal from "sweetalert2";
import SideBar from "@/components/SideBar.vue";

const ticketStore = useTicketStore();
const ticketById = ref(null);

const formData = reactive({
  ticketType: '',
  ticketAmount: 0,
  price: 0,
  bookingReference: '',
});

const ticketList = ref([]);
const selectedEvent = ref(null);

const fetchTickets = async () => {
  ticketList.value = await ticketStore.getTickets();
}

onMounted(fetchTickets);

const deleteTicket = async (ticketId) => {
  try {
    await ticketStore.deleteTicket(ticketId);
    Swal.fire({
      title: "Ticket Deleted successfully!",
      icon: "success"
    }).then(() => {
      fetchTickets();
    });
  } catch (err) {
    await Swal.fire({
      title: "Error!",
      text: err.response ? err.response.data : err.message,
      icon: "error"
    });
  }
}

const showEditForm = ref(false);



const activeTab = ref('eventList');

const changeTab = (tab) => {
  activeTab.value = tab;
};

const currentPageTicket = ref(1);
const pageSizeTicket = 10;

const groupBy = (array, key) => {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
    return result;
  }, {});
}

const groupedTickets = computed(() => {
  return groupBy(ticketList.value, 'eventID');
});

const sortedGroupedTickets = computed(() => {
  const grouped = groupBy(ticketList.value, 'eventID');
  for (const key in grouped) {
    grouped[key] = grouped[key].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
  }
  return grouped;
});

const paginatedTicket = computed(() => {
  if (selectedEvent.value && sortedGroupedTickets.value[selectedEvent.value]) {
    const startIndex = (currentPageTicket.value - 1) * pageSizeTicket;
    return sortedGroupedTickets.value[selectedEvent.value].slice(startIndex, startIndex + pageSizeTicket);
  }
  return [];
});

const totalPagesTickets = computed(() => {
  if (selectedEvent.value && groupedTickets.value[selectedEvent.value]) {
    return Math.ceil(groupedTickets.value[selectedEvent.value].length / pageSizeTicket);
  }
  return 0;
});

const setCurrentPageTicket = (page) => {
  currentPageTicket.value = page;
};

const selectEvent = (eventId) => {
  selectedEvent.value = eventId;
  currentPageTicket.value = 1;
  activeTab.value = 'ticketList';
};

watch(() => ticketList.value, () => {
  currentPageTicket.value = 1; // Reset to first page when tickets change
});

</script>

<template>
  <div class="d-flex">
    <side-bar />
    <div class="container-xl px-4 mt-4">
      <div class="card mb-4" v-if="activeTab === 'eventList'">
        <div class="card-header">Event List</div>
        <div class="card-body">
          <table class="table">
            <thead>
            <tr>
              <th scope="col">Event Name</th>
              <th scope="col">Number of Tickets</th>
              <th scope="col"></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(tickets, eventId) in groupedTickets" :key="eventId">
              <td>{{ tickets[0].eventName }}</td>
              <td>{{ tickets.length }}</td>
              <td>
                <button class="btn btn-outline-primary btn-sm" @click="selectEvent(eventId)">View Tickets</button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card mb-4" v-if="activeTab === 'ticketList'">
        <div class="card-header d-flex justify-content-between">
          Ticket List for {{ groupedTickets[selectedEvent]?.[0].eventName }}
          <button class="btn btn-outline-primary btn-sm" @click="changeTab('eventList')">Back to Event List</button>
        </div>
        <div class="card-body">
          <table class="table">
            <thead>
            <tr>
              <th scope="col">Event Name</th>
              <th scope="col">Ticket Type</th>
              <th scope="col">Ticket Amount</th>
              <th scope="col">Ticket Price</th>
              <th scope="col">Booking Reference</th>
              <th scope="col"></th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="ticket in paginatedTicket" :key="ticket.id">
              <td>{{ ticket.eventName }}</td>
              <td>{{ ticket.ticketType }}</td>
              <td>{{ ticket.ticketAmount }}</td>
              <td>{{ ticket.price }}</td>
              <td>{{ ticket.bookingReference }}</td>
              <td>
                <button class="btn btn-outline-danger btn-sm" @click="deleteTicket(ticket.id)">Delete</button>
              </td>
            </tr>
            </tbody>
          </table>
          <nav v-if="groupedTickets[selectedEvent]?.length > 0">
            <ul class="pagination justify-content-center">
              <li
                  class="page-item"
                  v-for="page in totalPagesTickets"
                  :key="page"
                  :class="{ active: currentPageTicket === page }"
              >
                <a class="page-link" href="#" @click.prevent="setCurrentPageTicket(page)">{{ page }}</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Your scoped styles here */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

body {
  margin-top: 20px;
  background-color: #f2f6fc;
  color: #69707a;
}

.img-account-profile {
  height: 10rem;
}

.rounded-circle {
  border-radius: 50% !important;
}

.card {
  box-shadow: 0 0.15rem 1.75rem 0 rgb(33 40 50 / 15%);
}

.card .card-header {
  font-weight: 500;
}

.card-header:first-child {
  border-radius: 0.35rem 0.35rem 0 0;
}

.card-header {
  padding: 1rem 1.35rem;
  margin-bottom: 0;
  background-color: rgba(33, 40, 50, 0.03);
  border-bottom: 1px solid rgba(33, 40, 50, 0.125);
}

.form-control,
.dataTable-input {
  display: block;
  width: 100%;
  padding: 0.875rem 1.125rem;
  font-size: 0.875rem;
  font-weight: 400;
  line-height: 1;
  color: #69707a;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #c5ccd6;
  appearance: none;
  border-radius: 0.35rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.nav-borders .nav-link.active {
  color: #0061f2;
  border-bottom-color: #0061f2;
}

.nav-borders .nav-link {
  color: #69707a;
  border-bottom-width: 0.125rem;
  border-bottom-style: solid;
  border-bottom-color: transparent;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 0;
  padding-right: 0;
  margin-left: 1rem;
  margin-right: 1rem;
  cursor: pointer;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(10px);
}

.image-container {
  width: 10rem;
  height: 10rem;
  border: 1px solid #c5ccd6;
  border-radius: 0.35rem;
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.placeholder {
  color: #69707a;
  font-size: 0.875rem;
  text-align: center;
}

.btn {
  text-transform: capitalize;
}
</style>
