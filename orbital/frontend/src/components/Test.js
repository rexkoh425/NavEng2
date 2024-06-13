import ContentOutsideForm from "./ContentOutsideForm";

function Test() {
    const Helloworld = "Hello";
    return (
        <div>
            <ContentOutsideForm someText={Helloworld}/>
        </div>
    )
}

export default Test;