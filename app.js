 // === CONFIG ===
    const API_KEY = 'YOUR_API_KEY'; // <<--- replace with your OpenWeatherMap API key
    // === /CONFIG ===

    // DOM
    const qInput = document.getElementById('q');
    const searchBtn = document.getElementById('searchBtn');
    const locBtn = document.getElementById('locBtn');
    const unitBtn = document.getElementById('unitBtn');
    const status = document.getElementById('status');
    const currentWrap = document.getElementById('currentWrap');
    const empty = document.getElementById('empty');
    const cityEl = document.getElementById('city');
    const descEl = document.getElementById('desc');
    const tempEl = document.getElementById('temp');
    const feelsEl = document.getElementById('feels');
    const iconWrap = document.getElementById('iconWrap');
    const moreEl = document.getElementById('more');
    const forecastGrid = document.getElementById('forecastGrid');
    const footRight = document.getElementById('footRight');

    let units = 'metric'; // metric or imperial

    function setStatus(msg, busy=false){
      status.innerHTML = msg ? msg + (busy ? ' <span class="loader" aria-hidden="true"></span>' : '') : '';
    }

    function formatTime(ts, tzOffsetSeconds){
      // ts is unix seconds, tzOffsetSeconds from API
      const date = new Date((ts + tzOffsetSeconds) * 1000);
      return date.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    }

    function showCurrent(data){
      empty.hidden = true;
      currentWrap.hidden = false;
      const name = data.name + ', ' + (data.sys && data.sys.country ? data.sys.country : '');
      cityEl.textContent = name;
      descEl.textContent = data.weather?.[0]?.description ?? '';
      const t = Math.round(data.main.temp);
      tempEl.textContent = t + (units === 'metric' ? '°C' : '°F');
      feelsEl.textContent = 'Feels like ' + Math.round(data.main.feels_like) + (units==='metric'?'°C':'°F');

      const icon = data.weather?.[0]?.icon;
      iconWrap.innerHTML = icon ? `<img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${data.weather[0].description}" width="80" height="80">` : '';

      const tzOffset = data.timezone || 0; // seconds
      moreEl.innerHTML = `
        <div class="row"><div class="small">Humidity</div><div class="small">${data.main.humidity}%</div></div>
        <div class="row"><div class="small">Wind</div><div class="small">${data.wind.speed} ${units==='metric'?'m/s':'mph'}</div></div>
        <div class="row"><div class="small">Sunrise</div><div class="small">${formatTime(data.sys.sunrise, tzOffset)}</div></div>
        <div class="row"><div class="small">Sunset</div><div class="small">${formatTime(data.sys.sunset, tzOffset)}</div></div>
      `;

      footRight.textContent = new Date().toLocaleString();
    }

    function showForecast(list, tzOffset){
      forecastGrid.innerHTML = '';
      // pick entries at 12:00:00 local time — API gives dt_txt in UTC; we'll choose those that include '12:00:00'
      const midday = list.filter(i => i.dt_txt && i.dt_txt.includes('12:00:00'));
      const items = midday.slice(0,5);
      if(items.length === 0){
        forecastGrid.innerHTML = '<div class="small">No forecast available</div>';
        return;
      }
      items.forEach(i => {
        const date = new Date(i.dt * 1000);
        const day = date.toLocaleDateString(undefined,{weekday:'short'});
        const icon = i.weather?.[0]?.icon;
        const desc = i.weather?.[0]?.main || '';
        const t = Math.round(i.main.temp);
        const el = document.createElement('div');
        el.className = 'day';
        el.innerHTML = `
          <div class="small">${day}</div>
          <div style="margin:8px 0"><img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" width="52" height="52"></div>
          <div style="font-weight:700">${t}°</div>
          <div class="small">${desc}</div>
        `;
        forecastGrid.appendChild(el);
      });
    }

    async function fetchByCity(q){
      try{
        setStatus('Loading...', true);
        // current
        const curRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&units=${units}&appid=${API_KEY}`);
        if(!curRes.ok) throw new Error('City not found');
        const cur = await curRes.json();
        showCurrent(cur);

        // forecast
        const fRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(q)}&units=${units}&appid=${API_KEY}`);
        if(fRes.ok){
          const fjson = await fRes.json();
          showForecast(fjson.list, fjson.city.timezone || 0);
        } else {
          forecastGrid.innerHTML = '<div class="small">Forecast not available</div>';
        }

        setStatus('');
      }catch(err){
        setStatus('Error: ' + err.message);
        currentWrap.hidden = true;
        empty.hidden = false;
        forecastGrid.innerHTML = '';
      }
    }

    async function fetchByCoords(lat, lon){
      try{
        setStatus('Loading...', true);
        const curRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`);
        if(!curRes.ok) throw new Error('Location weather not available');
        const cur = await curRes.json();
        showCurrent(cur);

        const fRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`);
        if(fRes.ok){
          const fjson = await fRes.json();
          showForecast(fjson.list, fjson.city.timezone || 0);
        } else {
          forecastGrid.innerHTML = '<div class="small">Forecast not available</div>';
        }

        setStatus('');
      }catch(err){
        setStatus('Error: ' + err.message);
        currentWrap.hidden = true;
        empty.hidden = false;
        forecastGrid.innerHTML = '';
      }
    }

    // events
    searchBtn.addEventListener('click', ()=>{
      const q = qInput.value.trim();
      if(!q) return setStatus('Please enter a city name');
      fetchByCity(q);
    });
    qInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') searchBtn.click(); });

    locBtn.addEventListener('click', ()=>{
      if(!navigator.geolocation) return setStatus('Geolocation not supported');
      setStatus('Getting your location...', true);
      navigator.geolocation.getCurrentPosition(pos =>{
        setStatus('Fetching weather for your location...', true);
        fetchByCoords(pos.coords.latitude, pos.coords.longitude);
      }, err => {
        setStatus('Unable to retrieve location: ' + err.message);
      }, {timeout:10000});
    });

    unitBtn.addEventListener('click', ()=>{
      units = units === 'metric' ? 'imperial' : 'metric';
      unitBtn.textContent = units === 'metric' ? '°C' : '°F';
      // if a city displayed, refresh
      const displayed = cityEl.textContent;
      if(displayed && displayed !== ''){
        const q = qInput.value.trim();
        if(q) fetchByCity(q);
      }
    });

    // helpful sample on load
    (function init(){
      // show a gentle greeting in status
      setStatus('Tip: try "Use my location" or search for a city', false);
    })();

 
