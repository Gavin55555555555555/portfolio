import { fetchJSON, renderProjects, fetchGitHubData} from './global.js';
// Recent Projects
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.createElement("div");
console.log(projectsContainer);
projectsContainer.classList.add("projects");
renderProjects(latestProjects,projectsContainer,);
let intro = document.querySelector(".introduction");
let header = document.createElement("h2")
header.innerHTML = "Latest Projects";
intro.append(header);
intro.append(projectsContainer);
// GitHub set-up 
const githubData = await fetchGitHubData();
const profileStats = document.querySelector(".github");
if (profileStats) {
    profileStats.innerHTML = `
          <h2>${githubData.login}'s GitHub Statistics</h2>
          <dl class = stats>
            <img src = ${githubData.avatar_url} width = 100px height = 100px>
            <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers:</dt><dd>${githubData.followers}</dd>
            <dt>Following:</dt><dd>${githubData.following}</dd>
          </dl>
      `;
  }

