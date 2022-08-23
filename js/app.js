const API_KEY = "8fb3f1d4-57ae-40d8-a0e9-7e563721a82c";
//const API_KEY = "750447c2-3f08-4a4a-b7ea-2dc529472642";
const API_URL_POPULAR =
  "https://kinopoiskapiunofficial.tech/api/v2.2/films/top?type=TOP_100_POPULAR_FILMS&page=";

const API_FILM_SEARCH =
  "https://kinopoiskapiunofficial.tech/api/v2.1/films/search-by-keyword?keyword=";

const API_FILM_MODAL = "https://kinopoiskapiunofficial.tech/api/v2.2/films/";

const API_FILM_VIDEO = "https://kinopoiskapiunofficial.tech/api/v2.2/films/";

const API_FILM_ACTORS =
  "https://kinopoiskapiunofficial.tech/api/v1/staff?filmId=";

getMovies(API_URL_POPULAR);

async function getMovies(url) {
  const resp = await fetch(url, {
    headers: {
      "X-API-KEY": API_KEY,
      "Content-Type": "application/json",
    },
  });
  const respData = await resp.json();
  showMovies(respData);
}

function rating(voice) {
  if (voice === "null") {
    return "red";
  } else if (voice <= 5) {
    return "red";
  } else if (voice > 5 && voice < 7) {
    return "orange";
  } else {
    return "green";
  }
}

function isEmptiRating(data) {
  if (data === "null") {
    return "Б/р";
  } else if (data.includes("%")) {
    return "expt";
  } else {
    return data;
  }
}

function showMovies(data) {
  const moviesEl = document.querySelector(".movies");

  document.querySelector(".movies").innerHTML = "";

  data.films.forEach((movie) => {
    const movieEl = document.createElement("div");

    movieEl.classList.add("movie");

    movieEl.innerHTML = `
    <div class="movie">
          <div class="movie__cover-inner">
            <img
              src=${movie.posterUrlPreview}
              alt=""
              class="movie__cover"
            />
            <div class="movie_cover--darkened"></div>
          </div>
          <div class="movie__info">
            <div class="movie__title">${movie.nameRu}</div>
            <div class="movie__category">${movie.genres.map(
              (genre) => `  ${genre.genre}`
            )}</div>
            <div class="movie__average movie__average--${rating(
              movie.rating
            )}">${isEmptiRating(movie.rating)}</div>
            <div class="country__info">Страна: ${movie.countries.map(
              (country) => ` ${country.country}`
            )}</div>
            <div class="years__info">Год выпуска: ${movie.year}</div>
          </div>
        </div>
    `;
    
    moviesEl.appendChild(movieEl);
  });
}

const form = document.querySelector("form");
const search = document.querySelector(".header__search");

form.addEventListener("submit", (el) => {
  el.preventDefault();

  const apiFilmSearch = `${API_FILM_SEARCH}${search.value}`;
  if (search.value) {
    getMovies(apiFilmSearch);

    search.value = "";
  }
});

const panels = document.querySelectorAll(".panel");

panels.forEach((panel) => {
  panel.addEventListener("click", () => {
    activeClasses();
    panel.classList.add("active");
    if (+document.querySelector(".active").innerHTML) {
      let NEW_API_URL_POPULAR =
        API_URL_POPULAR + +document.querySelector(".active").innerHTML;
      getMovies(NEW_API_URL_POPULAR);
    }
  });
});

function activeClasses() {
  panels.forEach((panel) => {
    panel.classList.remove("active");
  });
}

//Modal
const modalEl = document.querySelector(".modal");

async function openModal(id) {
  const resp = await fetch(API_FILM_MODAL + id, {
    headers: {
      "X-API-KEY": API_KEY,
      "Content-Type": "application/json",
    },
  });
  const respData = await resp.json();

  const respon = await fetch(API_FILM_VIDEO + id + "/videos", {
    headers: {
      "X-API-KEY": API_KEY,
      "Content-Type": "application/json",
    },
  });
  const responData = await respon.json();

  const actors = await fetch(API_FILM_ACTORS + id, {
    headers: {
      "X-API-KEY": API_KEY,
      "Content-Type": "application/json",
    },
  });
  const actorsData = await actors.json();

  modalEl.classList.add("modal--show");
  document.body.classList.add("stop-scrolling");
  const myUrl = megaFunc(responData);
  const myUrl__2 = megaFunc_2(responData);
  let x = getActorsPhotos(actorsData)
  console.log(x[0])

  modalEl.innerHTML = `
      <div class="modal__card">
        <img class="modal__movie-backdrop" src="${
          respData.posterUrlPreview
        }" alt="">
        <h2>
          <span class="modal__movie-title">${respData.nameRu}</span>
        </h2>
        <ul class="modal__movie-info">
          <li class="modal__rating-imdb">Imdb: ${
            respData.ratingImdb
          } | Кинопоиск: ${respData.ratingKinopoisk}</li>
          <li class="modal__relise-year">Год выпуска: ${respData.year}</li>
          <details>
              <summary>Актеры:</summary>
                  <p style="font-size:12px">${getActors(actorsData)}</p>
                  <img src="${x[0]}" style="width:30px;">
                  <img src="${x[1]}" style="width:30px;">
          </details>
          <li class="modal__movie-genre">Жанр: ${respData.genres.map(
            (elem) => `<span> ${elem.genre}</span>`
          )}</li>
          ${
            respData.filmLength
              ? `<li class="modal__movie-runtime">Продолжительность: ${respData.filmLength} минут</li>`
              : ""
          }
          <li >Сайт: <a class="modal__movie-site" href="${respData.webUrl}">${
    respData.webUrl
  }</a></li>
          <li class="modal__movie-description">${respData.description}</li>
        </ul>
        ${
          myUrl !== undefined
            ? `<iframe class="iframe" width="300" height="240" src="${myUrl}" frameborder="0" loading="lazy" allowfullscreen>Трейлер</iframe>`
            : `<video class="iframe" width="320" height="240" controls> <source src="${myUrl__2}" type="video/ogg"></video>`
        }
        <button onclick="closeModal()" type="button" class="modal__button-close">Закрыть</button>
      </div>
`;
}

function closeModal() {
  modalEl.classList.remove("modal--show");
  document.body.classList.remove("stop-scrolling");
}

window.addEventListener("click", (e) => {
  if (e.target === modalEl) {
    closeModal();
  }
});

window.addEventListener("keydown", (e) => {
  if (e.keyCode == 27) {
    closeModal();
  }
});

function megaFunc(obj) {
  const link = [];
  obj.items.map((el) => {
    if (
      el.url.includes("https://www.youtube.com/watch?v=") &&
      !el.url.includes("&feature=youtu.be")
    ) {
      link.push(el.url.replace("watch?v=", "embed/"));
    } else if (el.url.includes("https://youtu.be")) {
      link.push(
        el.url.replace("https://youtu.be/", "https://www.youtube.com/embed/")
      );
    } else if (el.url.includes("https://www.youtube.com/v")) {
      link.push(el.url.replace("/v/", "/embed/"));
    }
  });
  if (link[0] === undefined) {
    return undefined;
  } else {
    return link[0].toString();
  }
}

function megaFunc_2(obj) {
  const link = [];
  obj.items.map((el) => {
    if (el.url.includes("store.volgafilm.ru")) {
      link.push(el.url);
    } else if (el.url.includes("tv.naver")) {
      link.push(el.url);
    } else if (el.url.includes("disk.yandex")) {
      link.push(el.url);
    } else if (el.url.includes("https://widgets.kinopoisk")) {
      link.push(el.url);
    }
  });
  if (link[0] === undefined) {
    return undefined;
  } else {
    return link[0].toString();
  }
}

function getActors(obj) {
  let actors = "";
  for (i = 0; i < 6; i++) {
    actors += obj[i + 1].nameRu + ", ";
  }
  return actors.substring(0, actors.length - 2);
}

function getActorsPhotos(obj) {
  let actorsPhoto = [];
  for (i = 0; i < 6; i++) {
    actorsPhoto.push(obj[i + 1].posterUrl);
  }
  console.log(actorsPhoto)
  return actorsPhoto;
}


