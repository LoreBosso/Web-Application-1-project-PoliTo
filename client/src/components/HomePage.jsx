import { Button, Accordion, Row} from 'react-bootstrap';
import { useNavigate } from 'react-router';


function HomePage(props){

    const navigate = useNavigate();
    return(
        <>
        <Row className="text-center mb-5">
            <h1 className="display-4">Stuff Happens: Viaggi e Turismo</h1>
            <p className="lead">Classifica le disgrazie in vacanza e sfida la fortuna!</p>
        </Row>
        <h2 className="mb-4">Regole del gioco</h2>
        <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
                <Accordion.Header>🎯 Obiettivo</Accordion.Header>
                <Accordion.Body>
                    Colleziona 6 carte classificando correttamente le situazioni di viaggio in base alla loro sfortuna. Sbagli 3 volte? La partita finisce!
                </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
            <Accordion.Header>🃏 Le carte</Accordion.Header>
            <Accordion.Body>
                Ogni carta rappresenta una sventura turistica con un nome, immagine e un indice di sfortuna (1-100). L'indice è segreto finché non vinci la carta!
            </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
                <Accordion.Header>🎮 Come si gioca</Accordion.Header>
                <Accordion.Body>
                    <ul>
                        <li>Parti con 3 carte con sfortuna visibile.</li>
                        <li>Ogni round, ricevi una nuova carta (senza indice visibile).</li>
                        <li>Inseriscila al posto giusto tra le tue.</li>
                        <li>Hai 30 secondi! Se indovini → ottieni la carta, altrimenti la perdi.</li>
                    </ul>
                </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
                <Accordion.Header>🏁 Fine della partita</Accordion.Header>
                <Accordion.Body>
                    Vinci con 6 carte corrette. Perdi con 3 errori.
                </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="4">
                <Accordion.Header>👥 Modalità utente</Accordion.Header>
                <Accordion.Body>
                    <strong>Utenti Registrati:</strong> giocano partite complete e vedono la cronologia.<br/>
                    <strong>Visitatori:</strong> partita demo da 1 round, senza salvataggi.
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
        { !props.isLoggato ? (
        <div className="text-center my-5">
            <h3>Vuoi provare subito?</h3>
            <p>Gioca una partita demo da un solo round, senza registrazione!</p>
            <Button variant="dark" className="mx-3" size="lg" onClick={()=>navigate("/demo")}>Prova la demo</Button>
            oppure
            <Button variant="outline-secondary" className="mx-4" size="lg" onClick={()=>navigate("/login")}>Accedi</Button>
        </div>) : <div className="text-center my-5"><Button variant="dark" className="mx-3" size="lg" onClick={()=>props.iniziaPartita(props.utente.id)}>Gioca ora</Button></div>
        }
    </>
    );

}

export default HomePage;