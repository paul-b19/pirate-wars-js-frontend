const url = "http://pirate-wars-rails.herokuapp.com/leaders"
const audio = document.querySelector("audio")
const prBar = document.querySelector('.while-loading')
const leaderbord = document.querySelector('tbody')
const homeScreen = document.querySelector('#home-screen')
const gameScreen = document.querySelector('#game-container')
const quitLink = document.querySelector('#quit-link')
const shipsBoard = document.querySelector('#ships-selection')
const playerGrid = document.querySelector('#player-grid')
const computerGrid = document.querySelector('#computer-grid')
let player = {}
let tempAccuracy = {hit: 0, shot: 0, totalAcc: 0}
let playerMatrix = []
let compMatrix = []
let ships = shipsBoard.querySelectorAll("[type='ship']")
let shipsMap = {'player': {}, 'comp': {}}
let shipOrientation = 'hor'
let shipLength = 0
let shipInProgress = false
let shipCounter = 0
let prevSuccessfulShot = []


//  navbar collapse
function collapseNavBar() {
  $('.navbar-nav>li>a').on('click', function(){
    $('.navbar-collapse').collapse('hide');
  });
}

//  progress bar
function progressBar() {
  console.log('progress barr start')
  
  homeScreen.setAttribute("style", "display: none;")
  prBar.setAttribute("style", "display: initial;")

  $(".progress-bar").animate({
    width: "70%"
  });
  
  let interval = setInterval(() => {
    fetch(url).then(resp => resp.json())
      .then(leaders => {
        addLeaders(leaders)
        endingProgressBar()
        clearInterval(interval)
      })
  }, 5000)
}

function endingProgressBar() {
  console.log('progress barr ending')
    
  $(".progress-bar").animate({
    width: "100%"
  });

  console.log('delay 3s')
  setTimeout(() => {
    prBar.setAttribute("style", "display: none;")
    homeScreen.setAttribute("style", "display: initial;")
    $(".progress-bar").css('width', '0%')
  }, 3000)
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
    .catch(error => {console.log('Error', error); progressBar()})
}

function addLeaders(leaders) {
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
      cellP.setAttribute("class", "cell")
      rowP.appendChild(cellP)

      let cellC = document.createElement("div")
      cellC.dataset.coordinates = `${x}${y}`
      cellC.setAttribute("class", "cell")
      rowC.appendChild(cellC)
    }
  } 
}

//  starting a game (ships arrangement)
function letsPlay(event) {
  event.preventDefault();
  const form = event.target.parentNode
  let name = form.elements[0].value
  // let avatar = form.elements[1].value
  let avatar = $("input:radio[name=radiob]:checked").val()
  // console.log(name)
  // console.log(avatar)

  const nameInput = document.querySelector('#playerName')
  const errMsg = document.querySelector('.invalid-feedback')

  if (name === "") {
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

    postPlayer(name, avatar)
  }
}

//  selecting ships
function selectingShips() {
  const random = shipsBoard.querySelector('#random')
  const rotate = shipsBoard.querySelector('#rotate')
  const go = shipsBoard.querySelector('#go')
  // let ships = shipsBoard.querySelectorAll("[type='ship']")
  let matrix = playerMatrix
  shipsBoard.addEventListener('click', function(e) {
    // ship click
    if (e.target.getAttribute("type") === "ship" && !e.target.classList.contains("set-selected") && shipInProgress === false) {
      // console.log(e.target.parentNode.getAttribute("name"))
      shipInProgress = true
      e.target.classList.remove("set-active")
      e.target.classList.add("set-selected")
      random.classList.remove("set-active")
      random.classList.add("set-selected")
      setShip(e.target.parentNode.getAttribute("name"))
    } else if (e.target === random && !e.target.classList.contains("set-selected")) {
      // random click
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
      shipOrientation === 'hor' ? shipOrientation = 'ver' : shipOrientation = 'hor'
    } else if (e.target === go && !e.target.classList.contains("set-selected")) {
      // go click
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
      let xc = parseInt(e.target.dataset.coordinates.charAt(0))
      let yc = parseInt(e.target.dataset.coordinates.charAt(1))
      let matrix = playerMatrix

      if (coordVerification(xc, yc, matrix)) {
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
function playerMove() {
  computerGrid.addEventListener('click', gridClick)
}

function gridClick(e) {
  let xc = parseInt(e.target.dataset.coordinates.charAt(0))
  let yc = parseInt(e.target.dataset.coordinates.charAt(1))
  executeMove(compMatrix, xc, yc)
}

function compMove() {
  computerGrid.removeEventListener('click', gridClick)
  let xc = 0
  let yc = 0
  // let contSearch = true

  if (prevSuccessfulShot.length === 0) {
    xc = Math.floor(Math.random()*10)
    yc = Math.floor(Math.random()*10)
    while (playerMatrix[xc][yc] === 'x' || playerMatrix[xc][yc] === '*') {
      xc = Math.floor(Math.random()*10)
      yc = Math.floor(Math.random()*10)
    }

    // while (contSearch) {
    //   if (playerMatrix[xc][yc] !== "x" || playerMatrix[xc][yc] !== "*") {
    //     xc === 0 ? x = 0 : x = xc-1
    //     xc === 9 ? xMax = 9 : xMax = xc+1
    //     for (x; x<=xMax; x++) {
    //       yc === 0 ? y = 0 : y = yc-1
    //       yc === 9 ? yMax = 9 : yMax = yc+1
    //       for (y; y<=yMax; y++) {
    //         if (playerMatrix[x][y] === "x" ) {
    //           contSearch = true
    //           break;
    //         } else {
    //           contSearch = false
    //         }
    //       }
    //       if (contSearch) {break}
    //     }
    //   } else {
    //     xc = Math.floor(Math.random()*10)
    //     yc = Math.floor(Math.random()*10)
    //   }
    //   if (contSearch) {
    //     xc = Math.floor(Math.random()*10)
    //     yc = Math.floor(Math.random()*10)
    //   }
    // } 
  } else if (prevSuccessfulShot.length === 1) {
    xc = prevSuccessfulShot[0][0]
    yc = prevSuccessfulShot[0][1]

    if (xc !== 0 && playerMatrix[xc-1][yc] !== "x" && playerMatrix[xc-1][yc] !== "*") {
      xc = xc - 1
    } else if (xc !== 9 && playerMatrix[xc+1][yc] !== "x" && playerMatrix[xc+1][yc] !== "*") {
      xc = xc + 1
    } else if (yc !== 0 && playerMatrix[xc][yc-1] !== "x" && playerMatrix[xc][yc-1] !== "*") {
      yc = yc - 1
    } else if (yc !== 9 && playerMatrix[xc][yc+1] !== "x" && playerMatrix[xc][yc+1] !== "*") {
      yc = yc + 1
    }
  } else if (prevSuccessfulShot.length > 1){
    let ys = []
    let xs = []
    if (prevSuccessfulShot[0][0] === prevSuccessfulShot[1][0]) {
      xc = prevSuccessfulShot[0][0]
      prevSuccessfulShot.forEach(coord => {
        ys.push(coord[1])
      })
      if (Math.min(...ys) !== 0 && playerMatrix[xc][Math.min(...ys) - 1] !== "*") {
        yc = Math.min(...ys) - 1
      } else if (Math.max(...ys) !== 9 && playerMatrix[xc][Math.max(...ys) + 1] !== "*") {
        yc = Math.max(...ys) + 1
      }
    } else {
      yc = prevSuccessfulShot[0][1]
      prevSuccessfulShot.forEach(coord => {
        xs.push(coord[0])
      })
      if (Math.min(...xs) !== 0 && playerMatrix[Math.min(...xs) -1][yc] !== "*") {
        xc = Math.min(...xs) - 1
      } else if (Math.max(...xs) !== 9 || playerMatrix[Math.max(...xs) +1][yc] !== "*") {
        xc = Math.max(...xs) + 1
      }
    }
  }
  // contSearch = true
  setTimeout(() => { executeMove(playerMatrix, xc, yc) }, 1000);
}

function executeMove(matrix, xc, yc) {
  matrix === compMatrix ? (grid = computerGrid, hash = 'comp') : (grid = playerGrid, hash = 'player')
  switch (matrix[xc][yc]) {
    case 0:
      matrix[xc][yc] = '*'
      grid.querySelector(`[data-coordinates = '${xc}${yc}']`).classList.add("cell-miss")
      
      matrix === compMatrix ? (tempAccuracy.shot++ , compMove()) : playerMove()
      break;
    case 1:
      matrix[xc][yc] = 'x'
      grid.querySelector(`[data-coordinates = '${xc}${yc}']`).classList.remove("cell-ship")
      grid.querySelector(`[data-coordinates = '${xc}${yc}']`).classList.add("cell-shot")

      matrix === compMatrix ? (tempAccuracy.hit++, tempAccuracy.shot++) : prevSuccessfulShot.push([xc,yc])
  
      let shipId = grid.querySelector(`[data-coordinates = '${xc}${yc}']`).dataset.id
      let shipIsDone = true
      shipsMap[hash][shipId].forEach(cell => {
        if (matrix[cell[0]][cell[1]] === 1) {
          shipIsDone = false
        }
      })
      if (shipIsDone) {
        matrix === playerMatrix ? prevSuccessfulShot = [] : null

        shipsMap[hash][shipId].forEach(cell => {
          grid.querySelector(`[data-coordinates = '${[cell[0]]}${[cell[1]]}']`).classList.remove("cell-shot")
          grid.querySelector(`[data-coordinates = '${[cell[0]]}${[cell[1]]}']`).classList.add("cell-dead")
        })
        delete shipsMap[hash][shipId]
        if (Object.keys(shipsMap[hash]).length === 0){
          if (hash === "player") {
            result = "You lose. Don't give up, try again!"
            patchPlayer('loss')
          } else {
            result = "Congratulations! You won!"
            patchPlayer('win')
          }
          document.querySelector('.game-over > h3').innerHTML = result
          $('#gameOver').modal('show')
        }
      }
      matrix === compMatrix ? playerMove() : setTimeout(() => { compMove() }, 1000)

      break;
    default:
      break;
  }
}

//  quitting game from nav bar + from modal window
function quitGame(event) {
  if (event.target.id !== 'modal-quit') {
    event.preventDefault()
    
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
  }
  player = {}
  gameScreen.setAttribute("style", "display: none;")
  quitLink.setAttribute("style", "display: none;")
  homeScreen.setAttribute("style", "display: initial;")

  tempAccuracy = {hit: 0, shot: 0, totalAcc: 0}
  leaderbord.innerHTML = ''
  renderLeaderboard()
  resetGameScreen()
}

function resetGameScreen() {
  shipsBoard.setAttribute("style", "display: initial;")   /// or block???
  computerGrid.setAttribute("style", "display: none;")
  resetMatrix(playerMatrix)
  // resetMatrix(compMatrix)
  shipsMap = {'player': {}, 'comp': {}}
  gameScreen.querySelectorAll('.cell').forEach(cell => {
    cell.classList.remove("cell-ship", "cell-shot", "cell-dead", "cell-miss")
  })
  prevSuccessfulShot = []
}

//  play again
function playAgain() {
  tempAccuracy.hit = 0
  tempAccuracy.shot = 0
  resetGameScreen()
}

//  posting player and saving player object
function postPlayer(name, avatar) {
  console.log(`posting player ${name} the ${avatar}`)
  player = {
    name: `${name}`,
    avatar: `${avatar}`,
    wins: 0,
    losses: 0,
    accuracy: 0
  }
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(player)
  })
    .then(resp => resp.json())
    .then(respPlayer => {console.log(respPlayer); player.id = respPlayer.id})
    .catch(error => console.log('Error', error))
}

//  patching player and updating player object
function patchPlayer(result) {
  result === 'win' ? player.wins++ : player.losses++

  let tempAcc = tempAccuracy.hit / tempAccuracy.shot * 100
  tempAccuracy.totalAcc += tempAcc
  player.accuracy = Number.parseFloat(tempAccuracy.totalAcc / (player.wins + player.losses)).toFixed(1)

  fetch(`${url}/${player.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(player)
  })
    .then(resp => resp.json())
    .then(respPlayer => console.log(respPlayer))
    .catch(error => console.log('Error', error))
}

//  invite a friend
function inviteFriend(event) {
  event.preventDefault()
  console.log(event.target)
}

//  background music
function music(event) {
  event.preventDefault()
  if (audio.paused) {
    event.target.innerHTML = 'Turn Off Sound'
    audio.volume = 0.4
    audio.play()
  } else {
    event.target.innerHTML = 'Turn On Sound'
    audio.pause()
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