const url = "http://localhost:3000/leaders"

//  rendering avatars
function renderAvatars() {
  const avatarSelection = document.querySelector('.avatars')
  const avatars = [
    'pirate', 'camouflaged', 'birg', 'cyborg', 
    'geisha', 'ghost', 'hunter', 'ninja',
    'samurai', 'vamp', 'viking', 'warrior'
  ]
  avatars.forEach(avatar => {
    avatarSelection.innerHTML += `
      <input type="radio" name="radiob" id="${avatar}" value="${avatar}">
      <label class="ava" for="${avatar}">
        <img class="ava-img" alt="${avatar}" src="media/avatars/${avatar}.png">
      </label>
    `
  })
  avatarSelection.querySelector('input').setAttribute("checked", "")
}

// rendering leaderbord
function renderLeaderboard() {
  console.log('Leaderboard')
  fetch(url).then(resp => resp.json())
    .then(leaders => addLeaders(leaders))
}

function addLeaders(leaders) {
  const leaderbord = document.querySelector('tbody')
  let i = 1
  leaders.forEach(leader => {
    let trAct = document.createElement('tr')
    trAct.setAttribute("class", "table-active")
    let trSec = document.createElement('tr')
    trSec.setAttribute("class", "table-secondary")
    i % 2 === 0 ? tr = trSec : tr = trAct
    i++
    tr.innerHTML = `
      <td>
        <img class="leader-ava" alt="${leader.avatar}" src="media/avatars/${leader.avatar}.png">
        ${leader.name}
      </td>
      <td>${leader.wins}</td>
      <td>${leader.losses}</td>
      <td>${leader.accuracy}%</td>
    `
    leaderbord.appendChild(tr)
  })
  
}











window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  renderAvatars()
  renderLeaderboard()
});