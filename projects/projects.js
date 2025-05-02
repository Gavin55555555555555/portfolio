import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const project_header = document.querySelector(".projects-title");
project_header.innerHTML = `${projects.length} Projects`;
// Start
// let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// let arc = arcGenerator({
//     startAngle: 0,
//     endAngle: 2 * Math.PI,
// });

// d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

// let rolledData = d3.rollups(
//   projects,
//   (v) => v.length,
//   (d) => d.year,
// );


// let data = rolledData.map(([year, count]) => {
//   return { value: count, label: year };
// });
// let colors = d3.scaleOrdinal(d3.schemeTableau10);
// let total = 0
// for(let d of data){
//     total += d.value;
// }
// console.log(total);
// let angle = 0;
// let arcData = [];
// for (let d of data) {
//   let endAngle = angle + (d.value / total) * 2 * Math.PI;
//   arcData.push({ startAngle: angle, endAngle });
//   angle = endAngle;
// }
// let arcs = arcData.map((d) => arcGenerator(d));
// let i = 0;
// arcs.forEach((arc, idx) => {
//     d3.select('svg')
//       .append('path')
//       .attr('d', arc)
//       .attr('fill', colors(idx)) 
// })
// let sliceGenerator = d3.pie().value((d) => d.value);
// let legend = d3.select('.legend');
// legend.innerHTML = '';
// data.forEach((d, idx) => {
//   legend
//     .append('li')
//     .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
//     .attr('class', 'legend_element')
//     .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
// });
// End

function renderPieChart(projects){
  d3.selectAll('path').remove();
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
  );
  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  let total = 0
  for(let d of data){
    total += d.value;
  }
  let angle = 0;
  let arcData = [];
  for (let d of data) {
    let endAngle = angle + (d.value / total) * 2 * Math.PI;
    arcData.push({ startAngle: angle, endAngle });
    angle = endAngle;
  }
  let arcs = arcData.map((d) => arcGenerator(d));
  let i = 0;
  arcs.forEach((arc, idx) => {
      d3.select('svg')
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx)) 
  })
  let sliceGenerator = d3.pie().value((d) => d.value);
  let legend = d3.select('.legend');
  d3.selectAll('.legend_element').remove();
  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
      .attr('class', 'legend_element')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
  });
  // Interactive Pie Chart
  let selectedIndex = -1;
  let svg = d3.select('svg');
  svg.selectAll('path').remove();
  arcs.forEach((arc, i) => {
    svg
    .append('path')
    .attr('d', arc)
    .attr('fill', colors(i))
    .on('click', () => {
      let paths = document.querySelectorAll('path');
      let legend_elements = document.querySelector('.legend').querySelectorAll('li');
      console.log(legend_elements);
      console.log(paths);
      selectedIndex = selectedIndex === i ? -1 : i;
      for(let i = 0; i < paths.length; i++ ){
        if(i === selectedIndex){
          paths[i].classList.add("selected");
          legend_elements[i].classList.add("selected");
        }
        else{
          paths[i].classList.remove("selected");
          legend_elements[i].classList.remove("selected");
        }
      }
      
    });
});
}
renderPieChart(projects);
let query = '';

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = searchInput.value;
  console.log(query);
  query = event.target.value;
  // TODO: filter the projects
  console.log(projects);
  let contains = function(proj){
    let all_text = Object.values(proj).join('\n').toLowerCase();
    return all_text.includes(query.toLowerCase());
  }
  let filtered_projects = projects.filter(contains);
  console.log(filtered_projects);
  renderProjects(filtered_projects,projectsContainer,'h2');
  renderPieChart(filtered_projects);
});



