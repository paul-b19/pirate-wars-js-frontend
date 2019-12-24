const url = "http://localhost:3000/leaders"
const homeScreen = document.querySelector('#home-screen')
const gameScreen = document.querySelector('#game-container')
const quitLink = document.querySelector('#quit-link')

//  navbar collapse
function collapseNavBar() {
  $('.navbar-nav>li>a').on('click', function(){
    $('.navbar-collapse').collapse('hide');
  });
}

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

//  rendering leaderbord
function renderLeaderboard() {
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

//  rendering game grids
function renderGameGrids() {
  const playerGrid = document.querySelector('#player-grid')
  const computerGrid = document.querySelector('#computer-grid')
  
  for (x=0; x<10; x++) {
    let rowP = document.createElement('div')
    rowP.setAttribute("class", "row")
    playerGrid.appendChild(rowP)
    let rowC = document.createElement('div')
    rowC.setAttribute("class", "row")
    computerGrid.appendChild(rowC)
    for (y=0; y<10; y++) {
      let cellP = document.createElement("div")
      cellP.dataset.coordinates = `${x}${y}`
      cellP.setAttribute("class", "cell border border-dark")
      rowP.appendChild(cellP)

      let cellC = document.createElement("div")
      cellC.dataset.coordinates = `${x}${y}`
      cellC.setAttribute("class", "cell border border-dark")
      rowC.appendChild(cellC)
    }
  } 
}

//  starting a game
function letsPlay(event) {
  event.preventDefault();
  const form = event.target.parentNode
  console.log(form.elements[0].value)

  const nameInput = document.querySelector('#playerName')
  const errMsg = document.querySelector('.invalid-feedback')

  if (form.elements[0].value === "") {
    nameInput.classList.add("is-invalid")
    // alert("Please provide a username!")
    nameInput.classList.add("apply-shake");
    nameInput.addEventListener("animationend", (e) => {
      nameInput.classList.remove("apply-shake");
    })
    errMsg.setAttribute("style", "display: initial;")

  } else {
    nameInput.classList.remove("is-invalid")
    errMsg.setAttribute("style", "display: none;")
    form.reset()
    homeScreen.setAttribute("style", "display: none;")
    // gameScreen.setAttribute("style", "display: block;")
    gameScreen.style.display = ""
    quitLink.setAttribute("style", "display: initial;")
  }
}

//  quitting game
function quitGame(event) {
  event.preventDefault()
  console.log(event.target)
  gameScreen.setAttribute("style", "display: none;")
  quitLink.setAttribute("style", "display: none;")
  homeScreen.setAttribute("style", "display: initial;")
}











window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  collapseNavBar()
  renderAvatars()
  renderLeaderboard()
  renderGameGrids()

});