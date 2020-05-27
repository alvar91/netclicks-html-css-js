//Constants
const IMG_URL = "https://image.tmdb.org/t/p/w185_and_h278_bestv2";
const SERVER = "https://api.themoviedb.org/3";
const API_KEY = "08f4b8dae8c78a5afed1fc1dd61130f4";

//Menu
const leftMenu = document.querySelector(".left-menu"),
  hamburger = document.querySelector(".hamburger"),
  tvShowsList = document.querySelector(".tv-shows__list"),
  modal = document.querySelector(".modal"),
  tvShows = document.querySelector(".tv-shows"),
  tvCardImg = document.querySelector(".tv-card__img"),
  modalTitle = document.querySelector(".modal__title"),
  genresList = document.querySelector(".genres-list"),
  rating = document.querySelector(".rating"),
  description = document.querySelector(".description"),
  modalLink = document.querySelector(".modal__link"),
  searchForm = document.querySelector(".search__form"),
  searchFromInput = document.querySelector(".search__form-input");

const loading = document.createElement("div");
loading.className = "loading";

//Open/close menu
hamburger.addEventListener("click", () => {
  leftMenu.classList.toggle("openMenu");
  hamburger.classList.toggle("open");
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".left-menu")) {
    leftMenu.classList.remove("openMenu");
    hamburger.classList.remove("open");
  }
});

leftMenu.addEventListener("click", () => {
  event.preventDefault();
  const target = event.target;
  const dropdown = target.closest(".dropdown");
  if (dropdown) {
    dropdown.classList.toggle("active");
    leftMenu.classList.add("openMenu");
    hamburger.classList.add("open");
  }
});

// Open modal window
tvShowsList.addEventListener("click", (event) => {
  event.preventDefault();

  const target = event.target;
  const card = target.closest(".tv-card");

  if (card) {
    new DBService()
      .getTvShow(card.id)
      .then((response) => {
        tvCardImg.src = IMG_URL + response.poster_path;
        tvCardImg.alt = response.name;
        modalTitle.textContent = response.name;
        genresList.innerHTML = response.genres.reduce((acc, item) => {
          return `${acc}<li>${item.name}</li>`;
        }, "");
        rating.textContent = response.vote_average;
        description.textContent = response.overview;
        modalLink.href = response.homepage;
      })
      .then(() => {
        document.body.style.overflow = "hidden";
        modal.classList.remove("hide");
      });
  }
});

// Close modal window
modal.addEventListener("click", (event) => {
  const target = event.target;
  const cross = target.closest(".cross");
  const modalArea = target.classList.contains("modal");

  if (cross || modalArea) {
    document.body.style.overflow = "";
    modal.classList.add("hide");
  }
});

// Change card
const changeImage = (event) => {
  const card = event.target.closest(".tv-shows__item");

  if (card) {
    const img = card.querySelector(".tv-card__img");

    if (img.dataset.backdrop) {
      [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
    }
  }
};

tvShowsList.addEventListener("mouseover", changeImage);
tvShowsList.addEventListener("mouseout", changeImage);

//Cards render
const DBService = class {
  getData = async (url) => {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`Не удалось получить данные по адресу: ${url}`);
    }
  };

  getTestData = () => {
    return this.getData("test.json");
  };

  getTestCard = () => {
    return this.getData("card.json");
  };

  getSearchResult = (query) => {
    return this.getData(
      `${SERVER}/search/tv?api_key=${API_KEY}&language=ru-RU&query=${query}&include_adult=false`
    );
  };

  getTvShow = (id) => {
    return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
  };
};

const renderCard = (response) => {
  tvShowsList.textContent = "";
  response.results.forEach((item) => {
    const {
      backdrop_path: backdrop,
      name: title,
      poster_path: poster,
      vote_average: vote,
      id,
    } = item;

    const posterIMG = poster ? IMG_URL + poster : "img/no-poster.jpg";
    const backdropIMG = backdrop ? IMG_URL + backdrop : "";
    const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : "";

    const card = document.createElement("li");
    card.idTV = id;
    card.classList.add("tv-shows__item");
    card.innerHTML = `
      <a href="#" id="${id}" class="tv-card">
        ${voteElem}
        <img
          class="tv-card__img"
          src="${posterIMG}"
          data-backdrop="${backdropIMG}"
          alt="${title}"
        />
        <h4 class="tv-card__head">${title}</h4>
      </a>
    `;
    loading.remove();
    tvShowsList.append(card);
  });
};

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = searchFromInput.value.trim();
  if (value) {
    tvShows.append(loading);
    new DBService().getSearchResult(value).then(renderCard);
  }
  searchFromInput.value = "";
});
