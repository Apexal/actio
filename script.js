const jsonOut = document.getElementById('json');
const timeTable = document.getElementById('time-table-body');
const newStudentNameInput = document.getElementById('new-student-name');
const detailsList = document.getElementById('details-list');
const clearData = document.getElementById('clear-data');

let current = {};

let students = {

};

if (!!window.localStorage.getItem('students')) students = JSON.parse(window.localStorage.getItem('students'));

/* {
	'Student One': [[start, end], [start, end], [start, end]]
}*/

// Load students from memory somehow
function setup() {
  for (let s in students) {
    //students[s] = [];
    addStudentRow(s);
  }

  updateDisplay();
}

function save() {
	window.localStorage.setItem('students', JSON.stringify(students));
}

function addStudentRow(student) {
  const row = document.createElement('tr');
	row.id = `${student}-row`;
  
  const button = document.createElement('button');
  button.classList.add('action-button');
  button.innerText = 'Start';
  button.onclick = () => {
    handleClick(student, button);
  };
  const removeButton = document.createElement('button');
  removeButton.innerText = 'X';
  removeButton.classList.add('remove-student-button');
  removeButton.onclick = () => {
  	if(confirm(`Remove data for ${student}?`)) removeStudent(student);
  }
  const td1 = document.createElement('td');
  td1.append(removeButton);
  td1.append(button);
  row.append(td1);

  const td2 = document.createElement('td');
  const a = document.createElement('a');
  a.href = `#details-${student}`;
  a.innerText = student;
  td2.append(a);
  td2.classList.add('student-name');
  row.append(td2);

  const td3 = document.createElement('td');
  td3.classList.add('student-total-time');
  td3.innerText = '~0 seconds total';
  td3.id = `${student}-total-time`;
  row.append(td3);

  timeTable.append(row);
}

function handleClick(student, button) {
  if (isActive(student)) {
    button.classList.remove('active');

    const start = current[student];
    const end = Date.now();
    students[student].push([start, end]);

    delete current[student];
  } else {
    button.classList.add('active');
    current[student] = Date.now();
  }
  button.innerText = isActive(student) ? 'Stop' : 'Start';
  updateDisplay();
  save();
}

function isActive(student) {
  return (student in current);
}

function updateDisplay() {
  if (Object.keys(students).length > 0) {
    Object.keys(students).forEach(s => {
      const times = students[s];
      const seconds = times.map(pair => Math.round((pair[1] - pair[0]) / 1000));
      let totalSeconds = seconds.reduce(((a, b) => a + b), 0);

      // Account for active
      if (isActive(s)) {
        totalSeconds += Math.round((Date.now() - current[s]) / 1000);
      }

      const label = secondsToLabel(totalSeconds);
      document.getElementById(`${s}-total-time`).innerText = label;
    });
  }
  // Details List
  /*
  	- Student 1
    	- 12:40:23 to 14:03:30 (90 seconds)
  */
  detailsList.innerHTML = Object.keys(students).map(s => {
    let html = '<li class="time-run one-half column">';

    // Student Name
    html += s;

    // Times
    html += `<ul id="details-${s}">`;
    students[s].forEach(pair => {
      const seconds = Math.round((pair[1] - pair[0]) / 1000);
      const start = new Date(pair[0]).toLocaleTimeString();
      const end = new Date(pair[1]).toLocaleTimeString();
      html += `<li>${start} to ${end} (~${secondsToLabel(seconds)})</li>`;
    });
    html += '</ul>';

    html += '</li>';

    return html;
  }).join('');
}

document.getElementById('new-student-form').onsubmit = (event) => {
  event.preventDefault();
  addStudent();
}

function addStudent() {
  const names = newStudentNameInput.value.split(';').map(n => n.trim()).map(n => n.substring(0, 20));
  newStudentNameInput.value = '';

  names.forEach(n => {
    if (!n || n in students) return;
    students[n] = [];
    addStudentRow(n);
  });

  updateDisplay();
}

function removeStudent(student) {
  delete students[student];
  delete current[student];
  document.getElementById(`${student}-row`).remove();
  save();
  updateDisplay();
}

function secondsToLabel(totalSeconds) {
  if (totalSeconds >= 60) {
    return `${Math.floor(totalSeconds / 60)} minutes ${totalSeconds % 60} seconds`;
  } else {
    return `${totalSeconds} seconds`;
  }
}

clearData.onclick = () => {
  if (confirm('Clear all data?')) 
    for (s in students) { removeStudent(s); }
};

setup();
setInterval(updateDisplay, 1000);
