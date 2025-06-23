import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Define initial dirty clothes
const initialDirtyClothes = [
  { id: 'sock', name: 'Sock', src: 'https://placehold.co/60x60/c4b5fd/ffffff?text=🧦', cleanSrc: 'https://placehold.co/60x60/d1fae5/374151?text=🧦' }, // Changed dirty color, kept clean
  { id: 'tshirt', name: 'T-Shirt', src: 'https://placehold.co/80x80/fcd34d/ffffff?text=👕', cleanSrc: 'https://placehold.co/80x80/d1fae5/374151?text=👕' }, // Changed dirty color
  { id: 'pants', name: 'Pants', src: 'https://placehold.co/90x90/93c5fd/ffffff?text=👖', cleanSrc: 'https://placehold.co/90x90/d1fae5/374151?text=👖' }, // Changed dirty color
  { id: 'towel', name: 'Towel', src: 'https://placehold.co/70x70/a78bfa/ffffff?text=🧺', cleanSrc: 'https://placehold.co/70x70/d1fae5/374151?text=🧺' }, // Changed dirty color
];

const App = () => {
  // State for Firebase initialization and user authentication
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  // Game state
  const [dirtyClothes, setDirtyClothes] = useState(initialDirtyClothes);
  const [clothesInMachine, setClothesInMachine] = useState([]);
  const [washMode, setWashMode] = useState(null); // 'Quick', 'Eco', 'Heavy'
  const [isWashing, setIsWashing] = useState(false);
  const [isClean, setIsClean] = useState(false);
  const [message, setMessage] = useState("Drag clothes into the washing machine!");
  const [washProgress, setWashProgress] = useState(0);

  // Refs for drag and drop
  const washingMachineRef = useRef(null);

  // Initialize Firebase
  useEffect(() => {
    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

      if (Object.keys(firebaseConfig).length > 0) {
        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestore);
        setAuth(firebaseAuth);

        // Sign in with custom token or anonymously
        const signIn = async () => {
          try {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
              await signInWithCustomToken(firebaseAuth, __initial_auth_token);
            } else {
              await signInAnonymously(firebaseAuth);
            }
          } catch (error) {
            console.error("Firebase authentication error:", error);
            setMessage("Error: Firebase authentication failed.");
          }
        };
        signIn();

        // Listen for auth state changes
        onAuthStateChanged(firebaseAuth, (user) => {
          if (user) {
            setUserId(user.uid);
            console.log("User ID:", user.uid); // For debugging
          } else {
            setUserId(null);
          }
          setIsAuthReady(true);
        });
      } else {
        console.warn("Firebase config not found. Running without Firebase.");
        setIsAuthReady(true); // Still allow game to run
      }
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
      setMessage("Error: Failed to initialize Firebase.");
      setIsAuthReady(true); // Still allow game to run
    }
  }, []);

  // Handle drag start
  const handleDragStart = (e, clothId) => {
    e.dataTransfer.setData('clothId', clothId);
    e.dataTransfer.effectAllowed = 'move';
    // Add a class for visual feedback during drag
    e.currentTarget.classList.add('dragging-cloth');
  };

  // Handle drag end (clean up class)
  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('dragging-cloth');
  };

  // Handle drag over the washing machine
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (washingMachineRef.current) {
      washingMachineRef.current.classList.add('wash-machine-drag-over');
    }
  };

  // Handle drag leave the washing machine
  const handleDragLeave = () => {
    if (washingMachineRef.current) {
      washingMachineRef.current.classList.remove('wash-machine-drag-over');
    }
  };

  // Handle drop on the washing machine
  const handleDrop = (e) => {
    e.preventDefault();
    if (washingMachineRef.current) {
      washingMachineRef.current.classList.remove('wash-machine-drag-over');
    }

    const clothId = e.dataTransfer.getData('clothId');
    const droppedCloth = dirtyClothes.find(cloth => cloth.id === clothId);

    if (droppedCloth) {
      // Remove from dirty clothes
      setDirtyClothes(prev => prev.filter(cloth => cloth.id !== clothId));
      // Add to clothes in machine
      setClothesInMachine(prev => [...prev, { ...droppedCloth, isInMachine: true }]);
      setMessage("Clothes are in! Now select a wash mode.");
      setIsClean(false); // Reset clean state
      setWashMode(null); // Reset wash mode
      setWashProgress(0); // Reset progress
    }
  };

  // Handle wash mode selection
  const selectWashMode = (mode) => {
    setWashMode(mode);
    setMessage(`"${mode}" mode selected. Click "Wash" when ready!`);
  };

  // Handle washing animation and process
  const startWashing = () => {
    if (clothesInMachine.length === 0) {
      setMessage("No clothes in the machine! Drag some in first.");
      return;
    }
    if (!washMode) {
      setMessage("Please select a wash mode first (Quick, Eco, or Heavy).");
      return;
    }

    setIsWashing(true);
    setMessage("Washing in progress...");
    setWashProgress(0);

    const durationMap = {
      Quick: 2000,
      Eco: 4000, // Slightly longer for eco
      Heavy: 6000 // Longer for heavy
    };
    const duration = durationMap[washMode];
    let startTime = null;

    // Simulate progress bar
    const animateProgress = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / duration;
      setWashProgress(Math.min(progress * 100, 100));

      if (progress < 1) {
        requestAnimationFrame(animateProgress);
      } else {
        setIsWashing(false);
        setIsClean(true);
        setMessage("Clothes are clean! ✨ Time to dry!");
        // Update clothes to their clean state
        setClothesInMachine(prev => prev.map(cloth => ({ ...cloth, isClean: true })));
      }
    };

    requestAnimationFrame(animateProgress);
  };

  // Reset the game
  const resetGame = () => {
    setDirtyClothes(initialDirtyClothes);
    setClothesInMachine([]);
    setWashMode(null);
    setIsWashing(false);
    setIsClean(false);
    setMessage("Game reset! Drag clothes into the washing machine.");
    setWashProgress(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4 font-inter overflow-auto">
      <div className="bg-white rounded-[40px] shadow-2xl p-6 md:p-10 max-w-5xl w-full flex flex-col items-center space-y-8 border-6 border-purple-300 transform perspective-1000 rotate-x-3 transition-transform duration-500 hover:rotate-x-0">
        <h1 className="text-5xl font-extrabold text-gray-800 text-center mb-4 drop-shadow-lg animate-fade-down">Wash Day! 🧺</h1>

        {/* User ID display (if authenticated) */}
        {isAuthReady && userId && (
          <div className="text-sm text-gray-600 mb-4 bg-purple-50 p-2 rounded-xl border border-purple-200 shadow-sm">
            User ID: <span className="font-mono text-purple-700 break-all">{userId}</span>
          </div>
        )}

        {/* Message area */}
        <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl shadow-md text-center font-semibold text-xl animate-fade-in w-full max-w-xl border-2 border-blue-200">
          {message}
        </div>

        <div className="flex flex-col lg:flex-row w-full justify-around items-stretch lg:items-start space-y-8 lg:space-y-0 lg:space-x-8">
          {/* Dirty Clothes Area */}
          <div className="flex flex-col items-center bg-amber-50 p-6 rounded-3xl shadow-xl border-2 border-amber-200 w-full lg:w-1/3 min-h-[250px] transform hover:scale-[1.01] transition-transform duration-300">
            <h2 className="text-3xl font-bold text-gray-700 mb-6 border-b-2 border-amber-300 pb-2">Dirty Clothes</h2>
            <div className="flex flex-wrap justify-center gap-5">
              {dirtyClothes.map(cloth => (
                <div
                  key={cloth.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, cloth.id)}
                  onDragEnd={handleDragEnd}
                  className="cloth-item cursor-grab bg-amber-100 p-4 rounded-xl shadow-lg hover:scale-110 transition-all duration-300 flex flex-col items-center justify-center transform hover:rotate-3 active:cursor-grabbing border border-amber-200"
                  style={{ width: '110px', height: '110px' }}
                >
                  <img src={cloth.src} alt={cloth.name} className="w-16 h-16 object-contain drop-shadow" />
                  <span className="text-sm text-gray-700 mt-2 font-medium">{cloth.name}</span>
                </div>
              ))}
            </div>
            {dirtyClothes.length === 0 && (
              <p className="text-gray-500 mt-6 text-lg animate-pulse">All clothes are loaded!</p>
            )}
          </div>

          {/* Washing Machine Area */}
          <div
            ref={washingMachineRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="relative bg-gradient-to-br from-blue-400 to-blue-600 p-8 rounded-3xl shadow-3xl border-4 border-blue-700 flex flex-col items-center justify-center w-full lg:w-1/3 h-[350px] transition-all duration-300 transform hover:scale-[1.02] overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-800 opacity-20 rounded-3xl pointer-events-none z-0"></div> {/* Darker glass effect */}
            <h2 className="text-4xl font-extrabold text-white mb-6 drop-shadow-md z-10">Washing Machine</h2>
            <div className="relative w-56 h-56 bg-gray-100 rounded-full flex items-center justify-center border-8 border-gray-300 shadow-inner overflow-hidden z-10 before:content-[''] before:absolute before:inset-0 before:bg-gray-200 before:rounded-full before:opacity-50">
              {/* Washing Machine Drum */}
              <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isWashing ? 'opacity-100' : 'opacity-0'}`}>
                {/* Washing animation: spinning effect with water droplet */}
                <div className="w-full h-full rounded-full border-4 border-solid border-blue-400 animate-spin-fast opacity-80"></div>
                <div className="absolute text-6xl animate-pulse text-blue-500">💧</div>
                <div className="absolute text-4xl text-gray-700 font-bold opacity-90 drop-shadow-lg">
                  {Math.round(washProgress)}%
                </div>
                {/* Clothes inside drum during washing */}
                <div className="absolute flex flex-wrap justify-center items-center gap-2 p-2 transform rotate-animation">
                  {clothesInMachine.map((cloth, index) => (
                    <img
                      key={`wash-${cloth.id}-${index}`}
                      src={cloth.src} // Still dirty during wash
                      alt={cloth.name}
                      className="w-10 h-10 object-contain rounded-md transform scale-90"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    />
                  ))}
                </div>
              </div>

              {/* Clothes in machine when not washing */}
              {!isWashing && (
                <div className="flex flex-wrap justify-center items-center gap-3 p-4 transition-all duration-500">
                  {clothesInMachine.length > 0 ? (
                    clothesInMachine.map(cloth => (
                      <img
                        key={`static-${cloth.id}`}
                        src={isClean ? cloth.cleanSrc : cloth.src}
                        alt={cloth.name}
                        className={`w-14 h-14 object-contain rounded-lg transition-all duration-500 ${isClean ? 'animate-sparkle' : ''} shadow-sm`}
                      />
                    ))
                  ) : (
                    <span className="text-gray-400 text-center text-lg font-medium">Drop clothes here</span>
                  )}
                </div>
              )}
            </div>

            {clothesInMachine.length > 0 && !isWashing && !isClean && (
              <div className="absolute bottom-6 flex space-x-3 z-20 animate-fade-in-up">
                <button
                  onClick={() => selectWashMode('Quick')}
                  className={`wash-mode-btn ${washMode === 'Quick' ? 'bg-purple-600 text-white shadow-xl scale-105' : 'bg-white text-purple-700 hover:bg-purple-100'}`}
                >
                  Quick
                </button>
                <button
                  onClick={() => selectWashMode('Eco')}
                  className={`wash-mode-btn ${washMode === 'Eco' ? 'bg-purple-600 text-white shadow-xl scale-105' : 'bg-white text-purple-700 hover:bg-purple-100'}`}
                >
                  Eco
                </button>
                <button
                  onClick={() => selectWashMode('Heavy')}
                  className={`wash-mode-btn ${washMode === 'Heavy' ? 'bg-purple-600 text-white shadow-xl scale-105' : 'bg-white text-purple-700 hover:bg-purple-100'}`}
                >
                  Heavy
                </button>
              </div>
            )}
          </div>

          {/* Control Panel / Clean Clothes Area */}
          <div className="flex flex-col items-center bg-teal-50 p-6 rounded-3xl shadow-xl border-2 border-teal-200 w-full lg:w-1/3 min-h-[250px] transform hover:scale-[1.01] transition-transform duration-300">
            <h2 className="text-3xl font-bold text-gray-700 mb-6 border-b-2 border-teal-300 pb-2">Controls / Clean Clothes</h2>
            <div className="flex flex-col space-y-5 w-full items-center">
              <button
                onClick={startWashing}
                disabled={isWashing || clothesInMachine.length === 0 || !washMode}
                className="action-button bg-green-500 hover:bg-green-600 text-white"
              >
                {isWashing ? 'Washing...' : 'Wash!'}
              </button>

              {isClean && clothesInMachine.length > 0 && (
                <div className="flex flex-wrap justify-center gap-5 mt-4 animate-fade-in">
                  {clothesInMachine.map(cloth => (
                    <div
                      key={`clean-${cloth.id}`}
                      className="clean-cloth-item bg-teal-100 p-4 rounded-xl shadow-lg flex flex-col items-center justify-center animate-pop-in border border-teal-200"
                      style={{ width: '110px', height: '110px' }}
                    >
                      <img src={cloth.cleanSrc} alt={`Clean ${cloth.name}`} className="w-16 h-16 object-contain animate-sparkle-loop drop-shadow-md" />
                      <span className="text-sm text-gray-700 mt-2 font-medium">Clean {cloth.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={resetGame}
                className="action-button bg-red-500 hover:bg-red-600 text-white mt-6"
              >
                Reset Game
              </button>
            </div>
          </div>
        </div>

        {/* Custom CSS for enhanced aesthetics and animations */}
        <style>
          {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          .font-inter {
            font-family: 'Inter', sans-serif;
          }

          /* General Button Styles */
          .action-button {
            width: 100%;
            max-width: 250px;
            font-bold py-3 px-6 rounded-full shadow-lg text-lg
            transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
            border-b-4 border-opacity-75;
            background-image: linear-gradient(to right, var(--tw-gradient-stops));
            text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
          }
          .action-button.bg-green-500 { --tw-gradient-from: #10B981; --tw-gradient-to: #059669; border-color: #047857; }
          .action-button.bg-red-500 { --tw-gradient-from: #EF4444; --tw-gradient-to: #DC2626; border-color: #B91C1C; }

          .wash-mode-btn {
            px-5 py-2 rounded-full text-md font-semibold transition-all duration-200 shadow-md border-2 border-transparent
            transform hover:translate-y-1;
          }
          .wash-mode-btn.bg-purple-600 {
            background-image: linear-gradient(to right, #9333ea, #7e22ce);
            border-color: #6d28d9;
          }

          /* Dragging feedback */
          .cloth-item.dragging-cloth {
            opacity: 0.7;
            transform: scale(1.05) rotate(5deg) !important;
            box-shadow: 0 10px 20px rgba(0,0,0,0.2);
          }

          /* Washing Machine Drag Over effect */
          .wash-machine-drag-over {
            box-shadow: 0 0 0 8px rgba(129, 140, 248, 0.5); /* Ring effect */
            transform: scale(1.03);
          }

          /* Animations */
          .animate-spin-fast {
            animation: spin 1s linear infinite; /* Faster spin */
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-fade-down {
            animation: fadeDown 1s ease-out forwards;
          }
          @keyframes fadeDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-fade-in-up {
            animation: fadeInUp 0.7s ease-out forwards;
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-sparkle {
            animation: sparkle 1.5s ease-in-out infinite alternate;
          }
          @keyframes sparkle {
            0% { filter: brightness(1); text-shadow: none; }
            50% { filter: brightness(1.5); text-shadow: 0 0 8px rgba(255,255,200,0.8), 0 0 15px rgba(255,255,200,0.5); }
            100% { filter: brightness(1); text-shadow: none; }
          }
          .animate-sparkle-loop {
            animation: sparkle 2s ease-in-out infinite;
          }

          .animate-pop-in {
            animation: popIn 0.4s ease-out forwards;
          }
          @keyframes popIn {
            0% { transform: scale(0.8); opacity: 0; }
            70% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); }
          }

          .rotate-animation {
            animation: rotateClothes 3s linear infinite; /* Clothes rotate with the drum */
          }
          @keyframes rotateClothes {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          `}
        </style>
      </div>
    </div>
  );
};

export default App;
