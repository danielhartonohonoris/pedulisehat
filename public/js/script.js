"use strict";

/**
 * add event listener on multiple elements
 */

const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
};

/**
 * PRELOADER
 *
 * preloader will be visible until document load
 */

const preloader = document.querySelector("[data-preloader]");

window.addEventListener("load", function () {
  preloader.classList.add("loaded");
  document.body.classList.add("loaded");
});

/**
 * MOBILE NAVBAR
 *
 * show the mobile navbar when click menu button
 * and hidden after click menu close button or overlay
 */

const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNav = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("nav-active");
};

addEventOnElements(navTogglers, "click", toggleNav);

/**
 * HEADER & BACK TOP BTN
 *
 * active header & back top btn when window scroll down to 100px
 */

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

backTopBtn.addEventListener("click", function(event) {
  event.preventDefault(); // Hindari penambahan #top pada URL
  window.scrollTo({ top: 0, behavior: "smooth" }); // Gulir ke atas dengan efek smooth
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

/**
 * SCROLL REVEAL
 */

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

// toggle berita
document.addEventListener("DOMContentLoaded", function() {
  var toggleBtn = document.getElementById("toggleBtn");
  var teksAwal = document.getElementById("teksAwal");
  var teksLengkap = document.getElementById("teksLengkap");

  toggleBtn.addEventListener("click", function(event) {
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

document.getElementById('searchInput').addEventListener('input', function() {
  filterBoxes();
});

function filterBoxes() {
  const selectedRole = document.getElementById('roleFilter').value;
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  const boxes = document.querySelectorAll('.box');

  boxes.forEach(box => {
    const role = box.classList.contains(selectedRole) || selectedRole === '';
    const title = box.querySelector('h3').textContent.toLowerCase();
    const matchSearch = title.includes(searchQuery);

    if (role && matchSearch) {
      box.style.display = 'block';
    } else {
      box.style.display = 'none';
    }
  });
}