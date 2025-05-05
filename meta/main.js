import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

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
    console.log(commits[0]['date'].getDay());
    for(let i = 0; i < commits.length; i++){
        meanTime += commits[i]['hourFrac']/commits.length;
        weekdays[commits[i]['date'].getDay()] += 1;
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

    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  }


  let data = await loadData();

  let commits = processCommits(data);

  renderCommitInfo(data, commits);
  console.log(data);