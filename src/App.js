import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navebar from './Navebar';
import Home from './Components/Home';
import MoviesList from './Components/MoviesList';
import Movie from './Components/Movie';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Navebar />}>
            <Route index element={<Home />} />
            <Route path='/movies' element={<MoviesList />} />
            <Route path='/:postId/:title' element={<Movie />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
