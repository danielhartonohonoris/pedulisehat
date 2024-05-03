"use strict";

const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
};

const preloader = document.querySelector("[data-preloader]");

window.addEventListener("load", function () {
  preloader.classList.add("loaded");
  document.body.classList.add("loaded");
});

const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNav = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("nav-active");
};

addEventOnElements(navTogglers, "click", toggleNav);

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

backTopBtn.addEventListener("click", function (event) {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

const activeElementOnScroll = function () {
  if (window.scrollY > 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
};

window.addEventListener("scroll", activeElementOnScroll);

const revealElements = document.querySelectorAll("[data-reveal]");

const revealElementOnScroll = function () {
  for (let i = 0, len = revealElements.length; i < len; i++) {
    if (
      revealElements[i].getBoundingClientRect().top <
      window.innerHeight / 1.15
    ) {
      revealElements[i].classList.add("revealed");
    } else {
      revealElements[i].classList.remove("revealed");
    }
  }
};

window.addEventListener("scroll", revealElementOnScroll);

window.addEventListener("load", revealElementOnScroll);

document.addEventListener("DOMContentLoaded", function () {
  var toggleBtn = document.getElementById("toggleBtn");
  var teksAwal = document.getElementById("teksAwal");
  var teksLengkap = document.getElementById("teksLengkap");

  toggleBtn.addEventListener("click", function (event) {
    event.preventDefault();
    if (teksLengkap.style.display === "none") {
      teksLengkap.style.display = "block";
      toggleBtn.innerHTML = "Tutup";
    } else {
      teksLengkap.style.display = "none";
      toggleBtn.innerHTML = "Baca Selengkapnya";
    }
  });
});

function toggleText() {
  var teksLengkap = this.parentElement.querySelector("#teksLengkap");
  var toggleBtn = this;

  if (teksLengkap.style.display === "none" || teksLengkap.style.display === "") {
    teksLengkap.style.display = "block";
    toggleBtn.textContent = "Tutup";
  } else {
    teksLengkap.style.display = "none";
    toggleBtn.textContent = "Baca Selengkapnya";
  }
}
document.querySelectorAll('.toggleBtn').forEach(item => {
  item.addEventListener('click', toggleText)
})
