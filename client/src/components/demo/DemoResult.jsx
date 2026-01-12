import { useNavigate } from "react-router";
import { Button, Container, Row,Col } from "react-bootstrap";

function DemoResult(props){

    const navigate = useNavigate();
    
    return(
        <>
            <Container fluid>
            <Row className="justify-content-center my-5">  
                <h2>{props.statoRound.msg}</h2>
            </Row>
            <Row className="justify-content-center my-5">
                <Col>
                <Button variant="dark" className="mx-2 my-2" onClick={() => navigate("/demo")}>Riprova la demo</Button>
                <Button variant="outline-secondary"className="mx-2 my-2" onClick={() => navigate("/")}>Torna alla home</Button>
                </Col>
            </Row>
            </Container>
        </>

    );
}

export default DemoResult;