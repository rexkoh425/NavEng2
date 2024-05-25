import './App.css';
import Form from './components/Form';
import NavEng from './components/NavEng';
import PromptForm from './components/PromptForm';
import MyComponent from './components/MyComponent';
import Navbar from './components/Navbar';
import BasicButtons from './components/BasicButtons';
import ButtonAppBar from './components/ButtonAppBar';


function App() {
  return (
    <>
    <ButtonAppBar></ButtonAppBar>
    <PromptForm></PromptForm>
    </>
  );
}

/*function App() {
  return (
    <>
      <header>
        <h1 class="heading">NavEng</h1>
        <h2>Welcome back</h2>
        <button>Change name</button>
      </header>
      <main>
        <h2>Start Location</h2>
        <p>Search or select the location closest to you</p>
        <form>
          <input type="text"/>
          <br>
          </br>
          <h2>End Location</h2>
          <input type="text"/>
          <br>
          </br>
          <br>
          </br>
          <button>Submit!</button>
        </form>
        <MyFormComponent />
        <MyForm />
        <div id = "image_path" class = 'img_container'> </div>
        <table>
          <thead>
            <tr>
              <th>No. </th>
              <th>Task </th>
              <th>Completed? </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1. </td>
              <td>Wash dishes</td>
              <td>
                <input type="checkbox" />
              </td>
            </tr>
            <tr>
              <td>2. </td>
              <td>Take a shower</td>
              <td>
                <input type="checkbox" />
              </td>
            </tr>
            <tr>
              <td>3. </td>
              <td>Give a react js workshop</td>
              <td>
                <input type="checkbox" />
              </td>
            </tr>
          </tbody>
        </table>
      </main> 
    </>
  );
} */

export default App;
