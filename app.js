import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function TicTacToe3D() {
  const containerRef = useRef(null);
  const [gameState, setGameState] = useState(Array(25).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const boardMeshesRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const piecesRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 12, 18);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x4a90e2, 1.5, 100);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xe94560, 1.5, 100);
    pointLight2.position.set(5, 5, -5);
    scene.add(pointLight2);

    // Create board
    createBoard(scene);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      
      // Rotate board slowly
      scene.rotation.y += 0.002;
      
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    function handleResize() {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    }
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Handle clicks
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    function handleClick(event) {
      if (winner) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const intersects = raycasterRef.current.intersectObjects(boardMeshesRef.current);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const index = clickedMesh.userData.index;

        if (gameState[index] === null) {
          const newGameState = [...gameState];
          newGameState[index] = currentPlayer;
          setGameState(newGameState);

          // Add piece to board
          addPiece(sceneRef.current, index, currentPlayer);

          // Check for winner
          const winningPlayer = checkWinner(newGameState);
          if (winningPlayer) {
            setWinner(winningPlayer);
          } else if (!newGameState.includes(null)) {
            setWinner('Draw');
          } else {
            setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
          }
        }
      }
    }

    renderer.domElement.addEventListener('click', handleClick);
    return () => {
      renderer.domElement.removeEventListener('click', handleClick);
    };
  }, [gameState, currentPlayer, winner]);

  function createBoard(scene) {
    const boardGroup = new THREE.Group();
    const boardSize = 5;
    const spacing = 2.5;
    const squareSize = 2;
    
    // Create grid squares
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        const geometry = new THREE.BoxGeometry(squareSize, 0.3, squareSize);
        const material = new THREE.MeshStandardMaterial({
          color: 0x2d4059,
          metalness: 0.3,
          roughness: 0.7
        });
        const square = new THREE.Mesh(geometry, material);
        
        square.position.set(
          (j - 2) * spacing,
          0,
          (i - 2) * spacing
        );
        square.castShadow = true;
        square.receiveShadow = true;
        square.userData.index = i * boardSize + j;
        
        boardMeshesRef.current.push(square);
        boardGroup.add(square);
      }
    }

    // Create grid lines
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x4a90e2, linewidth: 2 });
    
    // Vertical lines (4 lines between 5 columns)
    for (let i = -1.5; i <= 1.5; i += 1) {
      const points = [];
      points.push(new THREE.Vector3(i * spacing, 0.2, -5.5));
      points.push(new THREE.Vector3(i * spacing, 0.2, 5.5));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      boardGroup.add(line);
    }

    // Horizontal lines (4 lines between 5 rows)
    for (let i = -1.5; i <= 1.5; i += 1) {
      const points = [];
      points.push(new THREE.Vector3(-5.5, 0.2, i * spacing));
      points.push(new THREE.Vector3(5.5, 0.2, i * spacing));
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, lineMaterial);
      boardGroup.add(line);
    }

    scene.add(boardGroup);
  }

  function addPiece(scene, index, player) {
    const boardSize = 5;
    const spacing = 2.5;
    const row = Math.floor(index / boardSize);
    const col = index % boardSize;
    const x = (col - 2) * spacing;
    const z = (row - 2) * spacing;

    if (player === 'X') {
      // Create X with two cylinders
      const geometry = new THREE.CylinderGeometry(0.15, 0.15, 2, 16);
      const material = new THREE.MeshStandardMaterial({
        color: 0xff3366,
        metalness: 0.6,
        roughness: 0.4,
        emissive: 0xff3366,
        emissiveIntensity: 0.2
      });

      const x1 = new THREE.Mesh(geometry, material);
      x1.position.set(x, 1.3, z);
      x1.rotation.z = Math.PI / 4;
      x1.castShadow = true;
      x1.userData.isPiece = true;
      scene.add(x1);
      piecesRef.current.push(x1);

      const x2 = new THREE.Mesh(geometry, material.clone());
      x2.position.set(x, 1.3, z);
      x2.rotation.z = -Math.PI / 4;
      x2.castShadow = true;
      x2.userData.isPiece = true;
      scene.add(x2);
      piecesRef.current.push(x2);

      console.log('Added X piece at', x, z);
    } else {
      // Create O with torus
      const geometry = new THREE.TorusGeometry(0.7, 0.2, 16, 32);
      const material = new THREE.MeshStandardMaterial({
        color: 0x3399ff,
        metalness: 0.6,
        roughness: 0.4,
        emissive: 0x3399ff,
        emissiveIntensity: 0.2
      });

      const o = new THREE.Mesh(geometry, material);
      o.position.set(x, 1.3, z);
      o.rotation.x = Math.PI / 2;
      o.castShadow = true;
      o.userData.isPiece = true;
      scene.add(o);
      piecesRef.current.push(o);

      console.log('Added O piece at', x, z);
    }
  }

  function checkWinner(board) {
    const boardSize = 5;
    const winLength = 5; // Need 5 in a row to win
    
    // Check rows
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col <= boardSize - winLength; col++) {
        const start = row * boardSize + col;
        let winner = board[start];
        if (!winner) continue;
        
        let isWin = true;
        for (let i = 1; i < winLength; i++) {
          if (board[start + i] !== winner) {
            isWin = false;
            break;
          }
        }
        if (isWin) return winner;
      }
    }
    
    // Check columns
    for (let col = 0; col < boardSize; col++) {
      for (let row = 0; row <= boardSize - winLength; row++) {
        const start = row * boardSize + col;
        let winner = board[start];
        if (!winner) continue;
        
        let isWin = true;
        for (let i = 1; i < winLength; i++) {
          if (board[start + i * boardSize] !== winner) {
            isWin = false;
            break;
          }
        }
        if (isWin) return winner;
      }
    }
    
    // Check diagonal (top-left to bottom-right)
    for (let row = 0; row <= boardSize - winLength; row++) {
      for (let col = 0; col <= boardSize - winLength; col++) {
        const start = row * boardSize + col;
        let winner = board[start];
        if (!winner) continue;
        
        let isWin = true;
        for (let i = 1; i < winLength; i++) {
          if (board[start + i * (boardSize + 1)] !== winner) {
            isWin = false;
            break;
          }
        }
        if (isWin) return winner;
      }
    }
    
    // Check diagonal (top-right to bottom-left)
    for (let row = 0; row <= boardSize - winLength; row++) {
      for (let col = winLength - 1; col < boardSize; col++) {
        const start = row * boardSize + col;
        let winner = board[start];
        if (!winner) continue;
        
        let isWin = true;
        for (let i = 1; i < winLength; i++) {
          if (board[start + i * (boardSize - 1)] !== winner) {
            isWin = false;
            break;
          }
        }
        if (isWin) return winner;
      }
    }
    
    return null;
  }

  function resetGame() {
    setGameState(Array(25).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    
    // Clear pieces from scene
    if (sceneRef.current) {
      piecesRef.current.forEach(piece => {
        sceneRef.current.remove(piece);
        piece.geometry.dispose();
        piece.material.dispose();
      });
      piecesRef.current = [];
    }
  }

  return (
    <div className="w-full h-screen bg-gray-900 flex flex-col">
      <div className="p-6 bg-gray-800 shadow-lg">
        <h1 className="text-4xl font-bold text-center text-white mb-4">
          3D Tic Tac Toe - 5x5
        </h1>
        <div className="flex justify-center items-center gap-8">
          <div className="text-center">
            {winner ? (
              <div className="text-2xl font-bold">
                {winner === 'Draw' ? (
                  <span className="text-yellow-400">It's a Draw!</span>
                ) : (
                  <span className={winner === 'X' ? 'text-red-400' : 'text-blue-400'}>
                    Player {winner} Wins
                  </span>
                )}
              </div>
            ) : (
              <div className="text-2xl font-semibold">
                <span className="text-gray-400">Current Player: </span>
                <span className={currentPlayer === 'X' ? 'text-red-400' : 'text-blue-400'}>
                  {currentPlayer}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            New Game
          </button>
        </div>
        <div className="mt-4 text-center text-gray-400 text-sm">
          Get 5 in a row to win! • Click on squares to place your piece • Board rotates automatically
        </div>
      </div>
      <div ref={containerRef} className="flex-1" />
    </div>
  );
}