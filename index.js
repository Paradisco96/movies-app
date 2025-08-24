const moviesListElement = document.querySelector('#movies-list');
const searchInput = document.querySelector('#search');
const searchCheckbox = document.querySelector('#checkbox');

let isSearchTriggerEnabled = false;
let lastSearchValue;

const debounceTimeout = (() => {
  let timerId = null;
  return (callback, ms) => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
    timerId = setTimeout(callback, ms);
  };
})();

const getData = (url) =>
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (!data || !data.Search) throw new Error('The server returned incorrect data');
      return data.Search;
    })
    .catch(console.error);

const addMoviesToList = ({ Poster: poster, Title: title, Year: year }) => {
  const item = document.createElement('div');
  const img = document.createElement('img');

  item.classList.add('movie');
  img.classList.add('movie__image');

  img.src = /^(https?:\/\/)/i.test(poster) ? poster : 'img/no-image.png';
  img.alt = `${title} ${year}`;
  img.title = `${title} ${year}`;

  item.append(img);

  moviesListElement.prepend(item);
};

const clearMoviesMarkup = () => {
  if (moviesListElement) moviesListElement.innerHtml = '';
};

const inputSearchHandler = (e) => {
  debounceTimeout(() => {
    const searchValue = e.target.value.trim();
    if (!searchValue || searchValue.length < 4 || searchValue === lastSearchValue) return;
    if (!isSearchTriggerEnabled) clearMoviesMarkup();

    getData(`https://www.omdbapi.com/?i=tt3896198&apikey=91c4f162&s=${searchValue}`)
      .then((data) => data.forEach(addMoviesToList))
      .catch((err) => console.error(err));

    searchInput.value = '';

    lastSearchValue = searchValue;
  }, 500);
};

searchInput.addEventListener('input', inputSearchHandler);
searchCheckbox.addEventListener('change', (e) => {
  isSearchTriggerEnabled = e.target.checked;
});
