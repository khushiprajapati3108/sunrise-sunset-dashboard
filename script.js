const select = document.getElementById("locationSelect");
const currentBtn = document.getElementById("currentLocationBtn");
const dashboard = document.getElementById("dashboard");
const apiBase = "https://api.sunrisesunset.io/json";

// Get data for both today and tomorrow
function fetchSunData(lat, lng) {
  dashboard.innerHTML = "<div class='loading'></div>";

  Promise.all([
    fetch(`${apiBase}?lat=${lat}&lng=${lng}&date=today`).then(res => res.json()),
    fetch(`${apiBase}?lat=${lat}&lng=${lng}&date=tomorrow`).then(res => res.json())
  ])
    .then(([todayData, tomorrowData]) => {
      if (todayData.status === "OK" && tomorrowData.status === "OK") {
        const timezone = todayData.results.timezone || "UTC";
        const utcOffset = todayData.results.utc_offset || 0;
        displayData(todayData.results, tomorrowData.results, timezone, utcOffset);
      } else {
        throw new Error("API error occurred. Check coordinates or try again.");
      }
    })
    .catch(err => {
      dashboard.innerHTML = `<p class="placeholder">Error: ${err.message}</p>`;
    });
}

function displayData(today, tomorrow, timezone, utcOffset) {
  const utcOffsetHours = Math.abs(utcOffset) / 60;
  const utcSign = utcOffset >= 0 ? '+' : '-';
  const utcDisplay = `UTC${utcSign}${utcOffsetHours}`;

  dashboard.innerHTML = `
    <div class="timezone-info">
      <p>Timezone: ${timezone} (${utcDisplay})</p>
    </div>
    <div class="card">
      <h3>Today</h3>
      <p><strong>Sunrise:</strong> ${today.sunrise}</p>
      <p><strong>Sunset:</strong> ${today.sunset}</p>
      <p><strong>Dawn:</strong> ${today.dawn}</p>
      <p><strong>Dusk:</strong> ${today.dusk}</p>
      <p><strong>Day Length:</strong> ${today.day_length}</p>
      <p><strong>Solar Noon:</strong> ${today.solar_noon}</p>
    </div>
    <div class="card">
      <h3>Tomorrow</h3>
      <p><strong>Sunrise:</strong> ${tomorrow.sunrise}</p>
      <p><strong>Sunset:</strong> ${tomorrow.sunset}</p>
      <p><strong>Dawn:</strong> ${tomorrow.dawn}</p>
      <p><strong>Dusk:</strong> ${tomorrow.dusk}</p>
      <p><strong>Day Length:</strong> ${tomorrow.day_length}</p>
      <p><strong>Solar Noon:</strong> ${tomorrow.solar_noon}</p>
    </div>
  `;
}

select.addEventListener("change", () => {
  const coords = select.value;
  if (coords) {
    const [lat, lng] = coords.split(",");
    fetchSunData(lat, lng);
  }
});

currentBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported by your browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    position => {
      const { latitude, longitude } = position.coords;
      fetchSunData(latitude, longitude);
    },
    error => {
      dashboard.innerHTML = `<p class="placeholder">Geolocation Error: ${error.message}</p>`;
    }
  );
});
