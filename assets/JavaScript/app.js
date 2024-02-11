"use strict";
import { fetchData, url } from "./api.js";
import * as module from "./module.js";

const searchView = document.querySelector(".search-view");
const searchTogglers = document.querySelector(".search-toggler");

const toggleSearch = () => searchView.classList.toggle("active");
module.addEventOnElements(searchTogglers, "click", toggleSearch);
/*--------Search Integration -----*/
const searchField = document.querySelector(".search-field");
const searchResult = document.querySelector(".search-result");

let searchTimeout = null;
const searchTimeoutDuration = 500;

searchField.addEventListener("input", function () {
  searchTimeout ?? clearTimeout(searchTimeout);
  if (!searchField.value) {
    searchResult.classList.remove("active");
    searchResult.innerHTML = "";
    searchField.classList.remove("searching");
  } else {
    searchField.classList.add("searching");
  }

  if (searchField.value) {
    searchTimeout = setTimeout(() => {
      fetchData(url.geo(searchField.value), function (locations) {
        searchField.classList.remove("searching");
        searchField.classList.add("active");
        searchField.innerHTML = `<ul class="view-list" data-search-list></ul>`;

        const items = [];
        for (const { name, lat, lon, country, state } of locations) {
          const searchItem = document.querySelector("li");
          searchItem.classList.add("view-item");

          searchItem.innerHTML = `
            <span class="m-icon">location_on</span>
                <div>
                    <p class="item-title">${name}</p>
                    <p class="label-2 item-subtitle">${
                      state || ""
                    } ${country}</p>
                </div>
             <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link has-state" aria-label="${name} weather" data-search-toggler></a>
          `;
          searchResult.querySelector(".view-list").appendChild(searchItem);
          items.push(searchItem.querySelector(".item-link"));
        }
      });
    }, searchTimeoutDuration);
  }
});

