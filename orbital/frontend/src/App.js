import './App.css';
//import PromptForm from './components/PromptForm';
import ButtonAppBar from './components/ButtonAppBar';
import { createBrowserRouter,RouterProvider, BrowserRouter, Routes, Route, Outlet} from 'react-router-dom';
import Feedback from './pages/Feedback'
import Home from './pages/Home';
import NotFound from './pages/NotFound';


function App() {

  const router = createBrowserRouter([
    {
      path: '/',
      element:<ButtonAppBar></ButtonAppBar>,
      errorElement: <NotFound></NotFound>,
      children: [
      {
        path: '/',
        element:<Home></Home>,
        errorElement: <NotFound></NotFound>
      },
      {
        path: '/feedback',
        element: <Feedback></Feedback>
      }
    ]
    },
    
  ]);

return (<RouterProvider router = {router} />)


  /*const Layout = () => {
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
  ); */
}


export default App;
