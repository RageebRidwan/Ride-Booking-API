import axios from "axios";

export const getCoordinatesFromAddress = async (address: string) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}`
    );

    if (response.data.length > 0) {
      const { lat, lon } = response.data[0];
      return {
        type: "Point",
        coordinates: [parseFloat(lon), parseFloat(lat)],
      };
    } else {
      return { type: "Point", coordinates: [0, 0] };
    }
  } catch (error) {
    console.error("Geocoding failed:", error);
    return { type: "Point", coordinates: [0, 0] };
  }
};
