
// Paso 1: Definir el Tamaño del Mapa
const MAP_WIDTH = 3000;
const MAP_HEIGHT = 3000;

const ACCELERATION = 0.05; // Reducir la aceleración para un movimiento más suave
const MAX_SPEED = 4; // Velocidad máxima más baja
const INERTIA_FACTOR = 0.9; // Factor de inercia para suavizar los cambios de dirección
const DECELERATION_FACTOR = 0.95; // Factor de desaceleración
const MOVEMENT_SPEED = 0.05;

// Get the canvas element and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set the canvas to full window size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Define the jugador (player) properties
let jugador = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  size: 30,
  targetX: canvas.width / 2, // Posición objetivo X
  targetY: canvas.height / 2, // Posición objetivo Y
  moveSpeed: 0.8, // Velocidad de movimiento hacia el objetivo
  color: 'orange',
  vx: 0, // Velocidad en X
    vy: 0, // Velocidad en Y
    ax: 0, // Aceleración en X
    ay: 0, // Aceleración en Y

};


let foodItems = [/* ... tus elementos de comida ... */];
let players = [/* ... todos los jugadores, incluyendo el principal y los de IA ... */];
// Define the comida (food) properties
const comidaSize = 5;
let comidas = [];

// Define AI players
let aiPlayers = [];


// Paso 3: Cámara de Seguimiento
function getCameraView(player) {
  const viewLeft = player.x - canvas.width / 2;
  const viewTop = player.y - canvas.height / 2;
  return {
      x: Math.max(0, Math.min(viewLeft, MAP_WIDTH - canvas.width)),
      y: Math.max(0, Math.min(viewTop, MAP_HEIGHT - canvas.height)),
      width: canvas.width,
      height: canvas.height
  };
}

function moveTowardsTarget(player) {
  // Calcula la dirección hacia el objetivo
  const dx = player.targetX - player.x;
  const dy = player.targetY - player.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Si la distancia es muy pequeña, evita movimientos adicionales
  if (distance < 0.001) return;

  // Normaliza la dirección
  const directionX = dx / distance;
  const directionY = dy / distance;

  // Mueve al jugador hacia el objetivo
  player.x += directionX * MOVEMENT_SPEED * distance;
  player.y += directionY * MOVEMENT_SPEED * distance;
}



canvas.addEventListener('mousemove', (event) => {
  const cameraView = getCameraView(jugador);
  jugador.targetX = cameraView.x + event.clientX;
  jugador.targetY = cameraView.y + event.clientY;
});

// Function to generate comida at random positions
function spawnComida() {
  let position = {
      x: Math.random() * MAP_WIDTH,
      y: Math.random() * MAP_HEIGHT,
      size: comidaSize,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
  };
  comidas.push(position);
}
// Generate initial comida on the canvas
for (let i = 0; i < 100; i++) {
  spawnComida();
}




// Function to draw the jugador and comida
function draw() {
  const cameraView = getCameraView(jugador);

    // Limpia el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Renderiza jugador, comida y IA dentro del área visible
    [jugador, ...comidas, ...aiPlayers].forEach(element => {
        if (element.x > cameraView.x && element.x < cameraView.x + cameraView.width &&
            element.y > cameraView.y && element.y < cameraView.y + cameraView.height) {
            ctx.fillStyle = element.color;
            ctx.beginPath();
            ctx.arc(element.x - cameraView.x, element.y - cameraView.y, element.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

class AiPlayer {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = 30;
      this.color = 'blue';
      this.velocity = 3; // Velocidad del jugador de IA
      this.direction = { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }; // Dirección aleatoria inicial
    }
    updateAI(players, comidas) {
      // Evita jugadores más grandes
      
      // Aquí podrías añadir más lógica, como buscar comida, etc.
      for (let i = comidas.length - 1; i >= 0; i--) {
        if (checkCollision(this, comidas[i])) {
            // Aumentar el tamaño de la IA y eliminar la comida
            this.size += comidas[i].size;
            comidas.splice(i, 1);
        }
      }

      // Mueve el jugador de IA
      this.adjustDirectionBasedOnEnvironment(players, comidas);

      // Mueve el jugador de IA
      this.move();
  }
  avoidLargerPlayers(players) {
      players.forEach(player => {
          if (this.size < player.size) {
              const dx = this.x - player.x;
              const dy = this.y - player.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < 200) { // Un umbral arbitrario, ajusta según sea necesario
                  // Moverse en dirección opuesta
                  this.x += dx / distance;
                  this.y += dy / distance;
              }
          }
      });
  }

  adjustDirectionBasedOnEnvironment(players, comidas) {
    // Aquí puedes agregar lógica para cambiar la dirección
    // Por ejemplo, buscar comida o evitar jugadores más grandes
    this.avoidLargerPlayers(players);
}
    
      move() {
        // Asegurarse de que la dirección tenga una magnitud unitaria
        const magnitude = Math.sqrt(this.direction.x ** 2 + this.direction.y ** 2);
        this.direction.x /= magnitude;
        this.direction.y /= magnitude;

        if (this.x <= 0 || this.x >= MAP_WIDTH) {
          this.direction.x *= -1;
          }
          if (this.y <= 0 || this.y >= MAP_HEIGHT) {
              this.direction.y *= -1;
          }

        // Aplicar velocidad a la dirección para calcular el cambio de posición
        this.x += this.direction.x * this.velocity;
        this.y += this.direction.y * this.velocity;

        // Mantener a los jugadores de IA dentro del mapa
        this.x = Math.max(0, Math.min(this.x, MAP_WIDTH));
        this.y = Math.max(0, Math.min(this.y, MAP_HEIGHT));
    }
  }
  
  // Create some AI players
  for (let i = 0; i < 10; i++) {
    aiPlayers.push(new AiPlayer());
  }


// Function to check collision between circles
function checkCollision(circle1, circle2) {
  const dx = circle1.x - circle2.x;
  const dy = circle1.y - circle2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < circle1.size + circle2.size;
}

function eatAndGrow(player, others) {
    others.forEach((other, index) => {
      if (checkCollision(player, other)) {
        if (player.size >= other.size) {
          player.size += other.size;
          others.splice(index, 1); // Remove the eaten circle
        }
      }
    });
  }

  // Function to generate a random name
function generateRandomName() {
  const namesList = ["CyberDrake", "QuantumWizard", "NeonKnight", "PixelShaman", "DataSorceress", "BinarySage", "CodeMystic", "SiliconSpecter", "DigitalOverlord", "PhantomHacker"];
  return namesList[Math.floor(Math.random() * namesList.length)];
}

  function updateLeaderboard() {
    // Ordena las IA y el jugador por tamaño
    const sortedPlayers = aiPlayers.concat(jugador).sort((a, b) => b.size - a.size);

    // Obtiene la referencia al elemento del leaderboard
    const leaderList = document.getElementById('leaderList');
    leaderList.innerHTML = ''; // Limpia el leaderboard actual

    // Crea los elementos de la lista para el leaderboard
    sortedPlayers.forEach(player => {
      if(!player.name || player.name === "player") {
          player.name = player.isMainPlayer ? "player" : generateRandomName();
      }
      const listItem = document.createElement('li');
      listItem.textContent = `${player.name}: ${player.size}`;
      leaderList.appendChild(listItem);
  });
}



  function restartGame() {
    // Restablecer propiedades del jugador
    jugador.x = canvas.width / 2;
    jugador.y = canvas.height / 2;
    jugador.size = 30; // tamaño inicial del jugador
    jugador.vx = 0;
    jugador.vy = 0;

    // Restablecer comida y jugadores de IA
    comidas = [];
    for (let i = 0; i < 100; i++) {
        spawnComida(); // Regenerar comida
    }

    aiPlayers = [];
    for (let i = 0; i < 10; i++) {
        aiPlayers.push(new AiPlayer()); // Regenerar jugadores de IA
    }
}

function endGame() {
    let playAgain = confirm("Has perdido. ¿Quieres jugar otra vez?");
    if (playAgain) {
        restartGame();
    }
}

// Main game loop
function gameLoop() {
    // ... existing game loop code ...

    moveTowardsTarget(jugador);
    // Move AI players
    aiPlayers.forEach(aiPlayer => aiPlayer.move());
  
    // Check for jugador eating comida
    eatAndGrow(jugador, comidas);
  
  
    // Check for AI eating comida
    aiPlayers.forEach(aiPlayer => {
      aiPlayer.updateAI(players, comidas);
  });
    
    // Verificar colisiones entre el jugador y las bolas de la IA
    aiPlayers.forEach((aiPlayer, index) => {
      if (checkCollision(jugador, aiPlayer)) {
          // Manejar colisión
          // Por ejemplo, aumentar el tamaño del jugador y eliminar la bola de la IA
          if (jugador.size >= aiPlayer.size) {
              jugador.size += aiPlayer.size;
              aiPlayers.splice(index, 1); // Eliminar la bola de la IA
          }
          else{
              endGame(); // Fin del juego si el jugador colisiona con una IA más grande
              return; // Sale del bucle del juego
          }
      }
  });


  
    // Draw everything
    draw();

    updateLeaderboard();
  
    // Continue the game loop
    requestAnimationFrame(gameLoop);
  }

// Start the game loop


requestAnimationFrame(gameLoop);
