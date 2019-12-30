const url = "http://localhost:3000/leaders"
const homeScreen = document.querySelector('#home-screen')
const gameScreen = document.querySelector('#game-container')
const quitLink = document.querySelector('#quit-link')
const shipsBoard = document.querySelector('#ships-selection')
const playerGrid = document.querySelector('#player-grid')
const computerGrid = document.querySelector('#computer-grid')
let playerMatrix = []
let compMatrix = []
let shipsMap = {'player': {}, 'comp': {}}
let shipOrientation = 'hor'
let shipLength = 0
let shipInProgress = false
let shipCounter = 0


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
      cellP.setAttribute("class", "cell") // class: "border"
      rowP.appendChild(cellP)

      let cellC = document.createElement("div")
      cellC.dataset.coordinates = `${x}${y}`
      cellC.setAttribute("class", "cell") // class: "border"
      rowC.appendChild(cellC)
    }
  } 
}

//  starting a game (ships arrangement)
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

  /// shipsSelection --> active
  /// computerGrid --> inactive
  /// reset player matrix
  /// or function resetAll() ???
}

//  selecting ships
function selectingShips() {
  // const shipsBoard = document.querySelector('#ships-selection')
  const random = shipsBoard.querySelector('#random')
  const rotate = shipsBoard.querySelector('#rotate')
  const go = shipsBoard.querySelector('#go')
  let ships = shipsBoard.querySelectorAll("[type='ship']")
  let matrix = playerMatrix
  shipsBoard.addEventListener('click', function(e) {
    // ship click
    if (e.target.getAttribute("type") === "ship" && !e.target.classList.contains("set-selected") && shipInProgress === false) {
      console.log(e.target.parentNode.getAttribute("name"))
      shipInProgress = true
      e.target.classList.remove("set-active")
      e.target.classList.add("set-selected")
      random.classList.remove("set-active")
      random.classList.add("set-selected")
      setShip(e.target.parentNode.getAttribute("name"))
    } else if (e.target === random && !e.target.classList.contains("set-selected")) {
      // random click
      console.log(e.target.id)
      ships.forEach(ship => {
        ship.classList.remove("set-active")
        ship.classList.add("set-selected")
      })
      rotate.classList.remove("set-active")
      rotate.classList.add("set-selected")
      go.classList.remove("set-selected")
      go.classList.add("set-active")
      resetMatrix(matrix)
      shipsRandomizer(matrix)
    } else if (e.target === rotate && !e.target.classList.contains("set-selected")) {
      // rotate click
      console.log(e.target.id)
      shipOrientation === 'hor' ? shipOrientation = 'ver' : shipOrientation = 'hor'
    } else if (e.target === go && !e.target.classList.contains("set-selected")) {
      // go click
      console.log(e.target.id)
      ships.forEach(ship => {
        ship.classList.remove("set-selected")
        ship.classList.add("set-active")
      })
      rotate.classList.remove("set-selected")
      rotate.classList.add("set-active")
      random.classList.remove("set-selected")
      random.classList.add("set-active")
      go.classList.remove("set-active")
      go.classList.add("set-selected")

      shipsBoard.setAttribute("style", "display: none;")
      computerGrid.setAttribute("style", "display: initial;")
      // computerGrid.style.display = ""
      resetMatrix(compMatrix)
      shipsRandomizer(compMatrix)
      // console.log(compMatrix)

      playerMove()
    }
  }) 
}

//  reset matrix
function resetMatrix(matrix) {
  matrix.length = 0
  for (x=0; x<10; x++) {
    let gridRow = []
    for (y=0; y<10; y++) {
      gridRow.push(0)
    }
    matrix.push(gridRow)
  }
}

//  setting ship type and horizontal orientation
function setShip(type) {
  // console.log(type)
  shipOrientation = "hor"
  switch (type) {
    case "ship-four":
      shipLength = 4
      break;
    case "ship-three":
      shipLength = 3
      break;
    case "ship-two":
      shipLength = 2
      break;
    case "ship-one":
      shipLength = 1
      break;
  }
}

//  arranging ships manual
function shipsArrangement() {
  playerGrid.addEventListener('click', function(e) {
    if (shipLength !== 0) {
      console.log(e.target.dataset.coordinates)
      let xc = parseInt(e.target.dataset.coordinates.charAt(0))
      let yc = parseInt(e.target.dataset.coordinates.charAt(1))
      let matrix = playerMatrix

      if (coordVerification(xc, yc, matrix)) {
        console.log('true')

        addShip(xc, yc, matrix)
        renderShip(xc, yc)
        shipCounter++
        if (shipCounter === 10) {
          shipCounter = 0
          rotate.classList.remove("set-active")
          rotate.classList.add("set-selected")
          go.classList.remove("set-selected")
          go.classList.add("set-active")
        }
      }
    }
  })
}

//  arranging ships random
function shipsRandomizer(matrix) {
  let orientation = ['hor', 'ver']
  let ships = [4,3,3,2,2,2,1,1,1,1]
  if (matrix === playerMatrix) {
    playerGrid.querySelectorAll('.cell-ship').forEach(ship => {
      ship.classList.remove("cell-ship")
    })
  }
  while (ships.length > 0) {
    let xc = Math.floor(Math.random()*10)
    let yc = Math.floor(Math.random()*10)
    shipLength = ships[0]
    shipOrientation = orientation[Math.floor(Math.random() * orientation.length)];
    if (coordVerification(xc, yc, matrix)) {
      addShip(xc, yc, matrix)
      if (matrix === playerMatrix) {
        renderShip(xc, yc)
      }
      ships.shift()
      shipCounter++
    }
  }
  shipLength = 0
  shipOrientation = 'hor'
  shipCounter = 0
}

//  coordinates verification
function coordVerification(xc, yc, matrix) {
  let result = false
  if (shipOrientation === "hor") {
    if (yc + shipLength - 1 <= 9) {
      xc === 0 ? x = 0 : x = xc-1
      xc === 9 ? xMax = 9 : xMax = xc+1
      for (x; x<=xMax; x++) {
        yc === 0 ? y = 0 : y = yc-1
        yc+shipLength-1 === 9 ? yMax = 9 : yMax = yc+shipLength
        for (y; y<=yMax; y++) {
          if (matrix[x][y] == 1) {
            result = false
            break;
          } else {
            result = true
          }
        }
        if (result === false) {break}
      }
    }
  } else {
    if (xc + shipLength - 1 <= 9) {
      xc === 0 ? x = 0 : x = xc-1
      xc+shipLength-1 === 9 ? xMax = 9 : xMax = xc+shipLength
      for (x; x<=xMax; x++) {
        yc === 0 ? y = 0 : y = yc-1
        yc === 9 ? yMax = 9 : yMax = yc+1
        for (y; y<=yMax; y++) {
          if (matrix[x][y] === 1) {
            result = false
            break;
          } else {
            result = true
          }
        }
        if (result === false) {break}
      }
    }
  }
  console.log(result)
  return result
}

//  adding ship to matrix + adding ship to shipsMap + adding ship data-id to grid cell
function addShip(xc, yc, matrix) {
  if (matrix === playerMatrix) {
    hash = shipsMap['player']
    grid = playerGrid
  } else {
    hash = shipsMap['comp']
    grid = computerGrid
  }

  if (shipOrientation === "hor") {
    hash[shipCounter] = []
    for (i=yc; i<yc+shipLength; i++) {
      matrix[xc][i] = 1
      hash[shipCounter].push([xc, i])
      grid.querySelector(`[data-coordinates = '${xc}${i}']`).dataset.id = shipCounter
    }
  } else {
    hash[shipCounter] = []
    for (i=xc; i<xc+shipLength; i++) {
      matrix[i][yc] = 1
      hash[shipCounter].push([i, yc])
      grid.querySelector(`[data-coordinates = '${i}${yc}']`).dataset.id = shipCounter
    }
  }
  // console.log(matrix)
}

//  rendering ship on player's grid
function renderShip(xc, yc) {
  if (shipOrientation === "hor") {
    for (i=yc; i<yc+shipLength; i++) {
      playerGrid.querySelector(`[data-coordinates = '${xc}${i}']`).classList.add("cell-ship")
    }
  } else {
    for (i=xc; i<xc+shipLength; i++) {
      playerGrid.querySelector(`[data-coordinates = '${i}${yc}']`).classList.add("cell-ship")
    }
  }
  shipLength = 0
  shipInProgress = false
}

//  starting battle

// function playerMove() {
//   computerGrid.addEventListener('click', function gridClick(e) {
//     console.log(e.target.dataset.coordinates)
//     let xc = parseInt(e.target.dataset.coordinates.charAt(0))
//     let yc = parseInt(e.target.dataset.coordinates.charAt(1))
//     executeMove(compMatrix, xc, yc)
//   })

//   computerGrid.removeEventListener('click', gridClick(e), true)
// }

function playerMove() {
  computerGrid.addEventListener('click', gridClick)
}

function gridClick(e) {
  // console.log(e.target.dataset.coordinates)
  let xc = parseInt(e.target.dataset.coordinates.charAt(0))
  let yc = parseInt(e.target.dataset.coordinates.charAt(1))
  executeMove(compMatrix, xc, yc)
}

function compMove() {
  computerGrid.removeEventListener('click', gridClick)

  let xc = Math.floor(Math.random()*10)
  let yc = Math.floor(Math.random()*10)
  while (playerMatrix[xc][yc] === 'x' || playerMatrix[xc][yc] === '*') {
    xc = Math.floor(Math.random()*10)
    yc = Math.floor(Math.random()*10)
  }
  setTimeout(() => { executeMove(playerMatrix, xc, yc) }, 1000);
}

function executeMove(matrix, xc, yc) {
  matrix === compMatrix ? (grid = computerGrid, hash = 'comp') : (grid = playerGrid, hash = 'player')
  switch (matrix[xc][yc]) {
    case 0:
      matrix[xc][yc] = '*'
      grid.querySelector(`[data-coordinates = '${xc}${yc}']`).classList.add("cell-miss")
      
      matrix === compMatrix ? compMove() : playerMove()
      break;
    case 1:
      matrix[xc][yc] = 'x'
      grid.querySelector(`[data-coordinates = '${xc}${yc}']`).classList.remove("cell-ship")
      grid.querySelector(`[data-coordinates = '${xc}${yc}']`).classList.add("cell-shot")
  
      let shipId = grid.querySelector(`[data-coordinates = '${xc}${yc}']`).dataset.id
      let shipIsDone = true
      shipsMap[hash][shipId].forEach(cell => {
        if (matrix[cell[0]][cell[1]] === 1) {
          shipIsDone = false
        }
      })
      if (shipIsDone) {
        shipsMap[hash][shipId].forEach(cell => {
          grid.querySelector(`[data-coordinates = '${[cell[0]]}${[cell[1]]}']`).classList.remove("cell-shot")
          grid.querySelector(`[data-coordinates = '${[cell[0]]}${[cell[1]]}']`).classList.add("cell-dead")
        })
      }
      matrix === compMatrix ? playerMove() : setTimeout(() => { compMove() }, 1000)
      break;
    default:
      break;
  }
}











window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  collapseNavBar()
  renderAvatars()
  renderLeaderboard()
  resetMatrix(playerMatrix)
  renderGameGrids()
  selectingShips()
  shipsArrangement()

});