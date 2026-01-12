import { useEffect} from "react";
import { Button, Container, Row, Col, Spinner, Navbar, Nav, } from "react-bootstrap";
import { useNavigate } from "react-router";
import ManoComponent from "./ManoComponent";

function GameResult(props) {
    const navigate = useNavigate();

    const handleNuovaPartita = async () => {
        try{
            await props.iniziaPartita(props.utente.id);
            props.aggiornaStatistiche();
        }
        catch(err){
            console.error(err);
        }
    }

    const tornaHome = () => {
        props.reset();
        navigate("/");
    }
    
    useEffect(()=>{
        const aggiorna = async () => {
            try {
                await props.aggiornaMano();
            } catch (err) {
                console.error("Errore nell'aggiornamento della mano:", err);
            }
        };
        aggiorna();
    },[]);

    return (
        <>
            <Navbar bg="light" data-bs-theme="light" className="shadow p-3 mb-5 rounded">
                <Container>
                    <Navbar.Brand className="ms-3">
                        <img
                            src="/scritta.png"
                            width="70"
                            height="70"
                            alt="Stuff Happens"
                        />
                    </Navbar.Brand>
                </Container>
            </Navbar>
            <Container fluid className='my-5 shadow p-3 rounded bg-light'>
                <Row className="justify-content-center my-4">
                    
                        <h2>{props.statoRound.msg}</h2>
        
                </Row>
                
                <h4>Le carte vinte in questa partita:</h4>
                <Row className="justify-content-center align-items-center my-3">
                    <ManoComponent mano={props.mano} fine = {1}/>
                </Row>
                <Row className="justify-content-center align-items-center">
                    <Col>
                        <Button
                            variant="dark"
                            className="mx-2 my-2"
                            onClick={handleNuovaPartita}
                            disabled={props.loading}
                        >
                            {props.loading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" variant="primary"/>
                                </>
                            ) : (
                                "Nuova Partita"
                            )}
                        </Button>
                        <Button
                            variant="outline-secondary"
                            className="mx-2 my-2"
                            onClick={tornaHome}
                            disabled={props.loading}
                        >
                            Torna alla home
                        </Button>
                    </Col>
                </Row>
            </Container>
            <footer className="text-center py-3 mt-auto">
            © 2025 Applicazioni Web I - Gioco della Sfortuna - Bosso Lorenzo s349410
            </footer>
        </>
    );
}

export default GameResult;