const { default: axios } = require("axios");

const serviceAPI = "https://xendit-trial-integration.herokuapp.com/api/";
const EventsService = {
  updateStatus: async (id, status) => {
    const { data } = await axios.put(`${serviceAPI}events/${id}`, {
      status,
    });
    return data;
  },
};

module.exports = EventsService;
