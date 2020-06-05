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
  searchFromInput = document.querySelector(".search__form-input"),
  preloader = document.querySelector(".preloader"),
  dropdown = document.querySelectorAll(".dropdown"),
  tvShowsHead = document.querySelector(".tv-shows__head"),
  posterWrapper = document.querySelector(".poster__wrapper"),
  modalContent = document.querySelector(".modal__content"),
  trailer = document.getElementById("trailer"),
  headTrailer = document.getElementById("headTrailer");

const loading = document.createElement("div");
loading.className = "loading";

//Open/close menu
const closeDropdown = () => {
  dropdown.forEach((item) => {
    item.classList.remove("active");
  });
};

hamburger.addEventListener("click", () => {
  leftMenu.classList.toggle("openMenu");
  hamburger.classList.toggle("open");
  closeDropdown();
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".left-menu")) {
    leftMenu.classList.remove("openMenu");
    hamburger.classList.remove("open");
    closeDropdown();
  }
});

leftMenu.addEventListener("click", (event) => {
  event.preventDefault();
  const target = event.target;
  const dropdown = target.closest(".dropdown");
  if (dropdown) {
    dropdown.classList.toggle("active");
    leftMenu.classList.add("openMenu");
    hamburger.classList.add("open");
  }

  if (target.closest("#top-rated")) {
    dbService.getTopRated().then((response) => renderCard(response, target));
  }
  if (target.closest("#popular")) {
    dbService.getPopular().then((response) => renderCard(response, target));
  }
  if (target.closest("#week")) {
    dbService.getWeek().then((response) => renderCard(response, target));
  }
  if (target.closest("#today")) {
    dbService.getToday().then((response) => renderCard(response, target));
  }
  if (target.closest("#search")) {
    tvShowsList.textContent = "";
    tvShowsHead.textContent = "";
  }
});

// Open modal window
tvShowsList.addEventListener("click", (event) => {
  event.preventDefault();

  const target = event.target;
  const card = target.closest(".tv-card");

  if (card) {
    preloader.style.display = "block";

    dbService
      .getTvShow(card.id)
      .then((response) => {
        if (response.poster_path) {
          tvCardImg.src = IMG_URL + response.poster_path;
          tvCardImg.alt = response.name;
          posterWrapper.style.display = "";
          modalContent.style.paddingLeft = "";
        } else {
          posterWrapper.style.display = "none";
          modalContent.style.paddingLeft = "25px";
        }

        modalTitle.textContent = response.name;
        genresList.innerHTML = response.genres.reduce((acc, item) => {
          return `${acc}<li>${item.name}</li>`;
        }, "");
        rating.textContent = response.vote_average;
        description.textContent = response.overview;
        modalLink.href = response.homepage;
        return response.id;
      })
      .then(dbService.getVideo)
      .then((response) => {
        headTrailer.classList.add("hide");
        trailer.textContent = "";
        if (response.results.length) {
          headTrailer.classList.remove("hide");
          response.results.forEach((item) => {
            const trailerItem = document.createElement("li");
            trailerItem.innerHTML = `
              <iframe width="460" 
                height="300" 
                src="https://www.youtube.com/embed/${item.key}" 
                frameborder="0"; 
                allowfullscreen>
              </iframe>
              <h4>${item.name}</h4>
            `;
            trailer.append(trailerItem);
          });
        }
      })
      .then(() => {
        document.body.style.overflow = "hidden";
        modal.classList.remove("hide");
      })
      .finally(() => {
        preloader.style.display = "none";
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
    tvShows.append(loading);
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

  getTopRated = () => {
    return this.getData(
      `${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`
    );
  };

  getPopular = () => {
    return this.getData(
      `${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`
    );
  };

  getToday = () => {
    return this.getData(
      `${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`
    );
  };

  getWeek = () => {
    return this.getData(
      `${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`
    );
  };

  getVideo = (id) => {
    return this.getData(
      `${SERVER}/tv/${id}/videos?api_key=${API_KEY}&language=ru-RU`
    );
  };
};

const dbService = new DBService();

const renderCard = (response, target) => {
  tvShowsList.textContent = "";

  if (!response.total_results) {
    loading.remove();
    tvShowsHead.textContent =
      "К сожалению по вашему запросу ничего не найдено...";
    tvShowsHead.style.cssText = "color: red";
    return;
  }
  tvShowsHead.textContent = target ? target.textContent : "Результат поиска:";
  tvShowsHead.style.color = "green";

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
    dbService.getSearchResult(value).then(renderCard);
  }
  searchFromInput.value = "";
});
