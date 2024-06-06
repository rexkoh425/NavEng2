import './App.css';
//import PromptForm from './components/PromptForm';
import ButtonAppBar from './components/ButtonAppBar';
import { BrowserRouter, Routes, Route, Outlet} from 'react-router-dom';
import Feedback from './pages/Feedback'
import Home from './pages/Home';


function App() {

  const Layout = () => {
    return (
      <>
      <ButtonAppBar></ButtonAppBar>
      <Outlet></Outlet>
      </>
    )
  }

  return (
    <>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout/>}>
      <Route path="/" element={<Home />} />
      <Route path="feedback" element={<Feedback />} />
      </Route>
    </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
