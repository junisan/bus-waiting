const modeEl = document.querySelector('#mode');
const timeEl = document.querySelector('#time');
const articleEl = document.querySelector('main');

const twoDigits = (number) => ('0'+number).slice(-2)

const createArticle = (data, currentDate) => {
  const bus = data.realHour*60 + data.realMinute;
  const real  = currentDate.getHours() * 60 + currentDate.getMinutes()

  let diff = bus - real;
  let diffClass = '';

  if (diff < 0) {
    //Add 24h more
    diff += 24 * 60;
    diffClass = 'future'
  }

  const diffMin = diff%60;
  const diffHour = Math.floor(diff/60)

  return `<article class="card">
      <div class="card__header">
        <div class="card__line">${data.bus}</div>
        <div class="card__stop">${data.stop.name}</div>
      </div>

      <div class="card__time ${diffClass}">${twoDigits(diffHour)}:${twoDigits(diffMin)}</div>
      <div class="card__extra">
        <div class="card__arrive">Llegará ${twoDigits(data.realHour)}:${twoDigits(data.realMinute)}</div>
        <div class="card__leave">Sale ${twoDigits(data.hour)}:${twoDigits(data.minute)}</div>
      </div>

    </article>`;
}

const parseData = (data) => {
  const mode = modeEl.checked
    ? 'to' : 'from';

  const date = new Date();
  // const date = new Date(2021,9,18,0,0);

  const hour = date.getHours();
  const minute = date.getMinutes();

  let nextBuses = [];


  data[mode]['timetable'].forEach(bus => {
    const busOffset = data[mode]['offset'][bus['bus']]
    let busMinute = bus.minute;
    let busHour = bus.hour;

    busMinute += busOffset
    if (busMinute > 59) {
      const hourExceed = Math.floor(busMinute/60)
      busMinute = busMinute%60;
      busHour += hourExceed
    }

    if (timeEl.checked && (busHour < hour || (busHour === hour && busMinute < minute))) {
      return;
    }

    nextBuses.push({
      ...bus,
      realHour: busHour,
      realMinute: busMinute,
      offset: busOffset,
      stop: data['stops'][bus['stop']]
    });

  })

  articleEl.innerHTML = '';

  if (!nextBuses.length) {
    articleEl.insertAdjacentHTML("beforeend", `<article class="noData">No hay datos para hoy</article>`)
  }

  nextBuses.sort((a,b) => {
    if (a.realHour === b.realHour) {
      return a.realMinute - b.realMinute;
    }
    return a.realHour - b.realHour;
  })

  nextBuses.forEach(item => articleEl.insertAdjacentHTML("beforeend", createArticle(item, date)))

}

const fetchData = () => {
  fetch('./schedule.json')
    .then(response => response.json())
    .then(response => parseData(response))
    // .catch(err => alert('Error: ' + err.message))
}


const clock = (element) => {
  const date = new Date()
  // const separator = date.getSeconds()%2 === 0 ? ':' : ' ';
  const separator = ':'
  const hour = twoDigits(date.getHours())
  const minute = twoDigits(date.getMinutes())

  element.innerText = `${hour}${separator}${minute}`
  console.log('Tick')
}

const headerClock = document.querySelector('header')

modeEl.addEventListener('change', () => {
  fetchData()
})

timeEl.addEventListener('change', () => {
  fetchData()
})


clock(headerClock)
fetchData()
