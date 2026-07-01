const fs = require('fs');

let content = fs.readFileSync('src/App.jsx', 'utf8');

const levelCompleteStart = content.indexOf('  /* ========== LEVEL COMPLETE ========== */');
const finalReturn = content.indexOf('  return null;\n}\n\nexport default App;');

if (levelCompleteStart !== -1 && finalReturn !== -1) {
  const replacement = `  /* ========== GAME SCREEN ========== */
  if (screen === 'game') {
    return (
      <GameContainer 
        setScreen={setScreen}
        setPreviousScreen={setPreviousScreen}
        learnedWords={learnedWords}
        setLearnedWords={setLearnedWords}
        maxUnlockedLevel={maxUnlockedLevel}
        setMaxUnlockedLevel={setMaxUnlockedLevel}
      />
    );
  }

`;
  content = content.substring(0, levelCompleteStart) + replacement + content.substring(finalReturn);
}

// Remove imports that are now only in GameContainer
content = content.replace(/import Grid from '.\/components\/Grid';\n/, '');
content = content.replace(/import Wheel from '.\/components\/Wheel';\n/, '');
content = content.replace(/import LevelComplete from '.\/components\/LevelComplete';\n/, '');
content = content.replace(/import BonusLockers from '.\/components\/BonusLockers';\n/, '');

// Add GameContainer import
content = content.replace(/import NavigationContainer from '.\/components\/NavigationContainer';\n/, "import NavigationContainer from './components/NavigationContainer';\nimport GameContainer from './components/GameContainer';\n");

// Write back
fs.writeFileSync('src/App.jsx', content);
console.log('App.jsx stripped game UI');
