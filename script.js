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
      <p><i class="fas fa-globe"></i> Timezone: ${timezone} (${utcDisplay})</p>
    </div>
    <div class="card">
      <h3><i class="fas fa-calendar-day"></i> Today</h3>
      <p><i class="fas fa-sun"></i> <strong>Sunrise:</strong> ${today.sunrise}</p>
      <p><i class="fas fa-moon"></i> <strong>Sunset:</strong> ${today.sunset}</p>
      <p><i class="fas fa-cloud-sun"></i> <strong>Dawn:</strong> ${today.dawn}</p>
      <p><i class="fas fa-cloud-moon"></i> <strong>Dusk:</strong> ${today.dusk}</p>
      <p><i class="fas fa-clock"></i> <strong>Day Length:</strong> ${today.day_length}</p>
      <p><i class="fas fa-sun"></i> <strong>Solar Noon:</strong> ${today.solar_noon}</p>
    </div>
    <div class="card">
      <h3><i class="fas fa-calendar-day"></i> Tomorrow</h3>
      <p><i class="fas fa-sun"></i> <strong>Sunrise:</strong> ${tomorrow.sunrise}</p>
      <p><i class="fas fa-moon"></i> <strong>Sunset:</strong> ${tomorrow.sunset}</p>
      <p><i class="fas fa-cloud-sun"></i> <strong>Dawn:</strong> ${tomorrow.dawn}</p>
      <p><i class="fas fa-cloud-moon"></i> <strong>Dusk:</strong> ${tomorrow.dusk}</p>
      <p><i class="fas fa-clock"></i> <strong>Day Length:</strong> ${tomorrow.day_length}</p>
      <p><i class="fas fa-sun"></i> <strong>Solar Noon:</strong> ${tomorrow.solar_noon}</p>
    </div>
  `;
}

select.addEventListener("change", () => {
  const coords = select.value;
  if (coords) {
    const [lat, lng] = coords.split(",");
    fetchSunData(lat, lng);
  } else {
    dashboard.innerHTML = `
      <div class="placeholder">
        <i class="fas fa-map-marker-alt"></i>
        <p>Select a location or use your current location to view data.</p>
      </div>
    `;
  }
});

currentBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    dashboard.innerHTML = `
      <div class="placeholder">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Geolocation not supported by your browser.</p>
      </div>
    `;
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
