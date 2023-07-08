import './App.css';
import { AnagramPuzzle } from './AnagramPuzzle';

function App() {
  return (
    <div className="App">
        <div className="container">
            <AnagramPuzzle letters={['g', 'a', 'n', 'a', 'r', 'a', 'm']} />
        </div>
    </div>
  );
}

export default App;
