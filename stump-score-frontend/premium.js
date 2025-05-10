// --- Premium.js ---
// This script powers the voting and prediction accuracy demo for premium.html
// Cleaned up and documented for maintainability.

// Demo: Load matches with types
const matches = [
  { id: 1, name: "India vs Australia", type: "ICC", teams: ["India", "Australia"] },
  { id: 2, name: "England vs Pakistan", type: "Test", teams: ["England", "Pakistan"] },
  { id: 3, name: "South Africa vs New Zealand", type: "ODI", teams: ["South Africa", "New Zealand"] },
  { id: 4, name: "RCB vs MI", type: "IPL", teams: ["RCB", "MI"] },
  { id: 5, name: "CSK vs KKR", type: "IPL", teams: ["CSK", "KKR"] },
  { id: 6, name: "Australia vs England", type: "ICC", teams: ["Australia", "England"] }
];

const matchTypes = ["IPL", "ICC", "Test", "ODI"];

const matchTypeSelect = document.createElement('select');
matchTypeSelect.id = 'matchTypeSelect';
matchTypeSelect.className = 'w-full p-2 border rounded mb-2';
matchTypeSelect.innerHTML = '<option value="">Select match type</option>' + matchTypes.map(t => `<option value="${t}">${t}</option>`).join('');

const matchSelect = document.getElementById('matchSelect');
const teamsVote = document.getElementById('teamsVote');
const voteBtn = document.getElementById('voteBtn');
const voteMsg = document.getElementById('voteMsg');
let selectedTeam = '';

// Insert matchTypeSelect before matchSelect
matchSelect.parentNode.insertBefore(matchTypeSelect, matchSelect);

function populateMatches(type) {
  matchSelect.innerHTML = '<option value="">Select a match</option>';
  if (!type) return;
  matches.filter(m => m.type === type).forEach(match => {
    matchSelect.innerHTML += `<option value="${match.id}">${match.name}</option>`;
  });
}

function showTeamsForType(type) {
  const teamsSet = new Set();
  matches.filter(m => m.type === type).forEach(match => {
    match.teams.forEach(t => teamsSet.add(t));
  });
  const teamsDiv = document.getElementById('teamsForType');
  if (!teamsDiv) return;
  teamsDiv.innerHTML = '';
  if (teamsSet.size === 0) {
    teamsDiv.innerHTML = '<div class="text-gray-500">No teams found for this match type.</div>';
    return;
  }
  teamsDiv.innerHTML = '<div class="mb-2 font-semibold">Teams participating:</div>';
  teamsSet.forEach(team => {
    teamsDiv.innerHTML += `<span class="inline-block bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white rounded px-3 py-1 m-1">${team}</span>`;
  });
}

matchTypeSelect.addEventListener('change', function() {
  populateMatches(this.value);
  showTeamsForType(this.value);
  matchSelect.value = '';
  teamsVote.innerHTML = '';
  selectedTeam = '';
  voteBtn.disabled = true;
  voteMsg.textContent = '';
});

// When a match is selected, show team buttons
matchSelect.addEventListener('change', function() {
  const match = matches.find(m => m.id == this.value);
  teamsVote.innerHTML = '';
  selectedTeam = '';
  voteBtn.disabled = true;
  voteMsg.textContent = '';
  if (match) {
    match.teams.forEach(team => {
      const btn = document.createElement('button');
      btn.textContent = team;
      btn.className = 'px-4 py-2 rounded bg-gray-200 hover:bg-blue-200 text-gray-800 font-semibold';
      btn.onclick = function() {
        selectedTeam = team;
        Array.from(teamsVote.children).forEach(b => b.classList.remove('bg-blue-600', 'text-white'));
        btn.classList.add('bg-blue-600', 'text-white');
        voteBtn.disabled = false;
      };
      teamsVote.appendChild(btn);
    });
  }
});

// Add a div to show teams for selected type
const teamsForTypeDiv = document.createElement('div');
teamsForTypeDiv.id = 'teamsForType';
matchSelect.parentNode.insertBefore(teamsForTypeDiv, matchSelect.nextSibling);

// Handle voting
voteBtn.addEventListener('click', function() {
  if (!selectedTeam) return;
  voteMsg.textContent = `You voted for ${selectedTeam}!`;
  voteMsg.className = 'mt-2 text-sm text-green-600';
  // In a real app, send vote to backend here
});

// --- Demo accuracy values (replace with real data from backend) ---
document.getElementById('userAccuracy').textContent = (Math.random() * 100).toFixed(1);
document.getElementById('systemAccuracy').textContent = (80 + Math.random() * 20).toFixed(1);
