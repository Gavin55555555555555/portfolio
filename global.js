console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  {url: 'meta/', title: 'Meta'},
  {url: 'https://github.com/Gavin55555555555555', title: 'GitHub'}
];

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/portfolio/";         // GitHub Pages repo name

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  if (!url.startsWith('http')) {
    url = BASE_PATH + url;
  }

  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  if (a.host === location.host && a.pathname === location.pathname) {
    a.classList.add('current');
  }
  
  if (a.host !== location.host) {
    a.setAttribute("target", "_blank");
  }
  nav.append(a);
}

document.body.insertAdjacentHTML(
  "afterbegin",
  `<label class = "color-scheme">
    Theme:
    <select>
      <option value = "light dark">Automatic</option>
      <option value = "light">Light</option>
      <option value = "dark">Dark</option>
    </select>
  </label>`
);
let select = document.querySelector(".color-scheme select");
select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  document.documentElement.style.setProperty('color-scheme', event.target.value);
  localStorage.colorScheme = event.target.value;
});

if ("colorScheme" in localStorage){
  select.value = localStorage.getItem("colorScheme");
  document.documentElement.style.setProperty("color-scheme",localStorage.getItem("colorScheme"));
  
  
}

let form = document.getElementById("contact_form");
form?.addEventListener("submit", function(event){
  event.preventDefault();
  let data = new FormData(form);
  let url_addr = "mailto:gawu@ucsd.edu?subject=" + data.get("subject") + "&body=" + data.get("body");
  let url = new URL(url_addr);
  location.href = url;
}
);

export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';
  let article = document.createElement('article');
  for(const project of projects){
    article = document.createElement('article');
    article.innerHTML = `
    <${headingLevel}>${project.title}</${headingLevel}>
    <img src="${project.image}" alt="${project.title}">
    <p>${project.description}</p>
    <p>C. ${project.year}</p>`;
    containerElement.appendChild(article);
  }
}

export function fetchGitHubData(){
  return fetchJSON("https://api.github.com/users/Gavin55555555555555");
}

//const a = document.querySelector('.projects');
//const b = await fetchJSON("../lib/projects.json");
//renderProjects(b,a,'h2');

