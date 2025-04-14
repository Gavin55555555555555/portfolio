console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'projects/', title: 'Contact' },
  { url: 'projects/', title: 'Resume' }
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  // next step: create link and add it to nav
}

let a = document.createElement('a');
a.href = url;
a.textContent = title;
nav.append(a);

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/website/";         // GitHub Pages repo name

  if (!url.startsWith('http')) {
  url = BASE_PATH + url;
}

if (!url.startsWith('http')) {
  url = BASE_PATH + url;
}

if (a.host === location.host && a.pathname === location.pathname) {
  a.classList.add('current');
}

if (a.host !== location.host) {
  a.setAttribute("target", "_blank");
}