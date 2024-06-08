import { Link } from "react-router-dom";
import ButtonAppBar from "../components/ButtonAppBar";
export default function NotFound() {
    return (
        <>
        <ButtonAppBar></ButtonAppBar>
            <div className="NotFoundPage"><p>404 Not Found</p>
            <Link to="/" className="ReturnLink">Return to Homepage</Link>
    </div></>

);
}