"use strict";

import { fetchData, url } from "./api.js";
import * as module from "./module.js";

const searchView = document.querySelector(".search-view");
const searchTogglers = document.querySelector(".search-toggler");

const toggleSearch = () => searchView.classList.toggle("active");
module.addEventOnElements(searchTogglers, "click", toggleSearch);
