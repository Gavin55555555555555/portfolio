import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
import scrollama from "https://esm.sh/scrollama";
async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
  
    return data;
}
let xScale;
let yScale;
function processCommits(data) {
  return d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/vis-society/lab-7/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };
  
      Object.defineProperty(ret, 'lines', {
        value: lines,
        // What other options do we need to set?
        // Hint: look up configurable, writable, and enumerable
      });
  
      return ret;
    });
}

function renderCommitInfo(data, commits) {
  // Create the dl element
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);
  
  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);
  
  // Add more stats as needed...
  let weekdays = {
      0 : 0, //Sun
      1 : 0,
      2 : 0,
      3 : 0,
      4 : 0,
      5 : 0,
      6 : 0 //Sat
  }
  let numToDay = {
      0 : 'Sunday',
      1 : 'Monday',
      2 : 'Tuesday',
      3 : 'Wednesday',
      4 : 'Thursday',
      5 : 'Friday',
      6 : 'Saturday' //Sat
  }
  let mostCommonDay;
  let meanTime = 0;
  let maxDepth = 0;
  for(let i = 0; i < commits.length; i++){
      meanTime += commits[i]['hourFrac']/commits.length;
      weekdays[commits[i]['date'].getDay()] += 1;
      if(commits[i]['depth'] > maxDepth){
        maxDepth = commits[i]['depth'];
      }
  }
  mostCommonDay = 0;
  for(let i = 1; i < 7; i++){
      console.log(weekdays[i]);
      if(weekdays[mostCommonDay] < weekdays[i]){
          mostCommonDay = i;
      }
  }
  mostCommonDay = numToDay[mostCommonDay];
  console.log(mostCommonDay);


    
  dl.append('dt').text('Day Most Work is Done');
  dl.append('dd').text(mostCommonDay);

  dl.append('dt').text('Average time Work is Done');
  dl.append('dd').text(meanTime);

  dl.append('dt').text('Max Depth');
  dl.append('dd').text(maxDepth);
}
function renderTooltipContent(commit) {
  //console.log(commit);
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const lines = document.getElementById('commit-lines');

  if (Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', {
    dateStyle: 'full',
  });
  lines.textContent = commit.totalLines;
}
function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.hidden = !isVisible;
}
function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  tooltip.style.left = `${event.clientX}px`;
  tooltip.style.top = `${event.clientY}px`;
}
// Brush
function isCommitSelected(selection, commit) {
  if (!selection) {
    return false;
  }
  let commitX = xScale(commit.datetime);
  let commitY = yScale(commit.hourFrac);
  if((commitX >= selection[0][0])
    && (commitX <= selection[1][0])
    && (commitY >= selection[0][1])
    && (commitY <= selection[1][1])){
    return true;
  }
    return false;
}
function brushed(event) {
  const selection = event.selection;
  d3.selectAll('circle').classed('selected', (d) =>
    isCommitSelected(selection, d),
  );
  renderSelectionCount(selection);
  renderLanguageBreakdown(selection);
}

function createBrushSelector(svg) {
  const brush = d3.brush()
    .on('start brush end',brushed)
  svg.call(brush);
  svg.selectAll('.dots, .overlay ~ *').raise();
  svg.selectAll('.dots, .overlay ~ *').raise();
  
}

function renderSelectionCount(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

  const countElement = document.querySelector('#selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}

function renderLanguageBreakdown(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type,
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }
}


//Plot
function renderScatterPlot(data, commits) {
  commits = d3.sort(commits, (d) => -d.totalLines);
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };
  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3
    .scaleSqrt()
    .domain([minLines, maxLines])
    .range([2, 30]);
  const svg = d3.select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');
  xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();
  yScale = d3.scaleLinear().domain([0, 24]).range([usableArea.bottom, usableArea.top]);
  const dots = svg.append('g').attr('class', 'dots');
  dots.selectAll('circle')
    .data(commits, (d) => d.id)
    .join('circle')
    .attr('cx',(d) => xScale(d.datetime))
    .attr('cy',(d) => yScale(d.hourFrac))
    .attr('r',(d) => rScale(d.totalLines))
    .attr('fill','steelblue')
    .attr('fill-opacity',(d) =>  1- rScale(d.totalLines)/30)
    .on('mouseenter',(event,d) => {
      renderTooltipContent(d);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', () => {
      updateTooltipVisibility(false);
    });
  // Add gridlines BEFORE the axes
  const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);
  
  gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
  // Create the axes
  let xAxis = d3.axisBottom(xScale);
  let yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');;

  // Add X axis
  svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .attr('class', 'x-axis')
    .call(xAxis);
  // Add Y axis
  svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .attr('class','y-axis')
    .call(yAxis);
  
  const b = svg.append('g').attr('class', 'brush');
  createBrushSelector(b);
  svg.selectAll('.dots, .overlay ~ *').raise();
}

function updateScatterPlot(data, commits,maxTime) {
  const width = 1000;
  const height = 600;
  const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  const svg = d3.select('#chart').select('svg');

  xScale = xScale.domain(d3.extent(commits, (d) => d.datetime));

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]);

  const xAxis = d3.axisBottom(xScale);

  // CHANGE: we should clear out the existing xAxis and then create a new one.
  const xAxisGroup = svg.select('g.x-axis');
  xAxisGroup.selectAll('*').remove();
  xAxisGroup.call(xAxis);
  const dots = svg.select('g.dots');

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  dots
    .selectAll('circle')
    .data(sortedCommits, (d) => d.id)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .on('mouseenter', (event, commit) => {
      d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
      renderTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mouseleave', (event) => {
      d3.select(event.currentTarget).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });
}

function updateCommitInfo(data, commits) {
  // Create the dl element
  d3.select('#stats').html("");
  const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
  // Add total LOC
  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);
  
  // Add total commits
  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);
  
  // Add more stats as needed...
  let weekdays = {
      0 : 0, //Sun
      1 : 0,
      2 : 0,
      3 : 0,
      4 : 0,
      5 : 0,
      6 : 0 //Sat
  }
  let numToDay = {
      0 : 'Sunday',
      1 : 'Monday',
      2 : 'Tuesday',
      3 : 'Wednesday',
      4 : 'Thursday',
      5 : 'Friday',
      6 : 'Saturday' //Sat
  }
  let mostCommonDay;
  let meanTime = 0;
  let maxDepth = 0;
  for(let i = 0; i < commits.length; i++){
      meanTime += commits[i]['hourFrac']/commits.length;
      weekdays[commits[i]['date'].getDay()] += 1;
      if(commits[i]['depth'] > maxDepth){
        maxDepth = commits[i]['depth'];
      }
  }
  mostCommonDay = 0;
  for(let i = 1; i < 7; i++){
      if(weekdays[mostCommonDay] < weekdays[i]){
          mostCommonDay = i;
      }
  }
  mostCommonDay = numToDay[mostCommonDay];


    
  dl.append('dt').text('Day Most Work is Done');
  dl.append('dd').text(mostCommonDay);

  dl.append('dt').text('Average time Work is Done');
  dl.append('dd').text(meanTime);

  dl.append('dt').text('Max Depth');
  dl.append('dd').text(maxDepth);
}


   





   



let data = await loadData();

let commits = processCommits(data);

let commitProgress = 100;

let timeScale = d3.scaleTime(
  [d3.min(commits, (d) => d.datetime), d3.max(commits, (d) => d.datetime)],
  [0, 100],
);
let commitMaxTime = timeScale.invert(commitProgress);
let input = d3.select("input");
let time = d3.select("time");



input.on("input", (event) =>
  {
    let val = input.property("value");
    time.html(timeScale.invert(val).toLocaleString());
    commitMaxTime = timeScale.invert(val);
    let filteredCommits = commits.filter(
      (commit) => commit.date < commitMaxTime
    );

    let lines = filteredCommits.flatMap((d) => d.lines);
    let files = [];
    files = d3
      .groups(lines, (d) => d.file)
      .map(([name, lines]) => {
      return { name, lines };
    });
    files = files.sort((a, b) => b.lines.length - a.lines.length);

    d3.select('.files').selectAll('div').remove(); 
    let filesContainer = d3.select('.files').selectAll('div').data(files).enter().append('div');
    console.log(files);
    filesContainer.append('dt').append('code').text(d => d.name); 
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    filesContainer.append('dd')
              .selectAll('div')
              .data(d =>  d.lines)
              .join('div')
              .attr('class', 'line')
              .attr('style', (d) => `--color: ${colors(d.type)}`);
              

    updateCommitInfo(data, filteredCommits);
    updateScatterPlot(data, filteredCommits,commitMaxTime);
  });

  

renderCommitInfo(data, commits);
renderScatterPlot(data, commits);

let sorted = d3.sort(commits, d => new Date(d.date));

d3.select('#scatter-story')
  .selectAll('.step')
  .data(sorted)
  .join('div')
  .attr('class', 'step')
  .html(
    (d, i) => `
		On ${d.datetime.toLocaleString('en', {
      dateStyle: 'full',
      timeStyle: 'short',
    })},
		I made <a href="${d.url}" target="_blank">${
      i > 0 ? 'another glorious commit' : 'my first commit, and it was glorious'
    }</a>.
		I edited ${d.totalLines} lines across ${
      d3.rollups(
        d.lines,
        (D) => D.length,
        (d) => d.file,
      ).length
    } files.
		Then I looked over all I had made, and I saw that it was very good.
	`,
  );

  function onStepEnter(response) {
    console.log(response.element.__data__.datetime);
    let commitMaxTime = response.element.__data__.datetime
    let filteredCommits = commits.filter(
      (commit) => commit.date <= commitMaxTime
    );

    let lines = filteredCommits.flatMap((d) => d.lines);
    let files = [];
    files = d3
      .groups(lines, (d) => d.file)
      .map(([name, lines]) => {
      return { name, lines };
    });
    files = files.sort((a, b) => b.lines.length - a.lines.length);

    d3.select('.files').selectAll('div').remove(); 
    let filesContainer = d3.select('.files').selectAll('div').data(files).enter().append('div');
    console.log(files);
    filesContainer.append('dt').append('code').text(d => d.name); 
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    filesContainer.append('dd')
              .selectAll('div')
              .data(d =>  d.lines)
              .join('div')
              .attr('class', 'line')
              .attr('style', (d) => `--color: ${colors(d.type)}`);
              
    updateScatterPlot(data,filteredCommits);
    updateCommitInfo(data,filteredCommits);

  }
  
  const scroller = scrollama();
  scroller
    .setup({
      container: '#scrolly-1',
      step: '#scrolly-1 .step',
    })
    .onStepEnter(onStepEnter);




  