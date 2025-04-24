console.log('hi');
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const project_header = document.querySelector(".projects-title");
project_header.innerHTML = `${projects.length} Projects`;
console.log(projects.length);
