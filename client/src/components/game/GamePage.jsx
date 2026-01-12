import { useEffect, useState} from "react";
import { Button, Alert, Spinner, Row, Col} from "react-bootstrap";
import GameCards from "../common/GameCards";
import ManoComponent from "./ManoComponent";
import API  from "../../API/API.mjs";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router";

function GamePage(props){

    const [carta_round,setCarta_round] = useState({});
    const [posizioneSelezionata,setPosizioneSelezionata] = useState(-1);
    const [tempoRestante,setTempoRestante] = useState(30);
    const [errore, setErrore] = useState("");
    const [roundId,setRoundId] = useState(0);
    const [roundIniziato,setRoundIniziato] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Effetto per ottenere i dati del round
    
        
    const iniziaRound = async ()=>{
        if (!props.partita?.id) return;
        
        if (props.statoRound === "in corso") return;
        setLoading(true);
        try{
            const nuovo_round = await API.iniziaRound(props.partita.id);
            setCarta_round(nuovo_round.carta);
            setRoundId(nuovo_round.round_id);
            props.setStatoRound("in corso");
            setRoundIniziato(true);
        }
        catch(err){
            console.error("Errore nell'avvio del round: ",err);
            if (err.message === "Unauthorized") {
                props.setMessaggio({msg: "Sessione scaduta. Impossibile continuare la partita. Effettua nuovamente il login.", tipo: 'danger'});
                props.reset();
                navigate("/");
            } 
            else if (err.message === "Failed to fetch") {
                props.setMessaggio({msg: "Errore di comunicazione con il server.", tipo: 'danger'});
                props.reset();
                navigate("/");
            }       
            else{
                props.setMessaggio({msg: "Errore sconosciuto. Verrai riportato alla home.", tipo: 'danger'});
                props.reset();
                navigate("/");
            }
        }
        finally{
            setLoading(false);
        }
    }

    // Effetto per il timer
    useEffect(() => {
    if (!roundIniziato) return;
    if (tempoRestante === 0) {
        onInvio(1);
        return;
    }
    const timeout = setTimeout(() => {
        setTempoRestante((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timeout);

    }, [roundIniziato, tempoRestante]);

    // Funzione di selezione
    const onPosizioneSelezionata = (index)=> {
        setErrore("");
        setPosizioneSelezionata(index);
    }


    // Funzione di invio

    const onInvio = async (fine) =>{ 
        if (loading) return;   
        if (posizioneSelezionata === -1 && tempoRestante>0) {
            setErrore("Seleziona una posizione!");
            return;
        }
        setLoading(true);
        try {
            let risultato_round = {};
            if(fine){
                
                risultato_round = await API.rispondiRound(props.partita.id,roundId,-1);
            }
            else{
                
                risultato_round = await API.rispondiRound(props.partita.id,roundId,posizioneSelezionata);
            }
            
             
            props.setStatoRound(risultato_round);
            if(risultato_round.partita=== 'in corso'){
                navigate("/partita/round/risultato");
                return;
            }
            navigate("/partita/risultato");
        }
        catch (err) {
            console.error("Impossibile rispondere al round:", err);
            if (err.message === "Unauthorized") {
                props.setMessaggio({msg: "Sessione scaduta. Impossibile continuare la partita. Effettua nuovamente il login.", tipo: 'danger'});
                props.reset();
                navigate("/");
            } 
            else if (err.message === "Failed to fetch") {
                props.setMessaggio({msg: "Errore di comunicazione con il server.", tipo: 'danger'});
                props.reset();
                navigate("/");
            }       
            else{
                props.setMessaggio({msg: "Errore sconosciuto. Verrai riportato alla home.", tipo: 'danger'});
                props.reset();
                navigate("/");
            }
        }
        finally{
            setLoading(false);
        }
    }

    return(    
        <>
            {props.statoRound === "in corso" ? (
        <>
            <h2>Round {props.partita.rounds_giocati}</h2>
            <Row className="mb-3 justify-content-center align-items-center">
                <Col xs="auto" className="d-flex flex-column align-items-center">
                    <h5>Hai {tempoRestante} secondi!</h5>
                    <Row className="mb-3 justify-content-center align-items-center">
                        <GameCards 
                            src={`http://localhost:3001/img/carte/${carta_round.immagine}`} 
                            nome ={carta_round.nome} 
                            misteriosa ={1}
                        />
                    </Row>
                    <Row className="my-2">
                        <p>Clicca sul pulsante tra le carte dove pensi vada inserita la carta misteriosa in base all'indice di sfortuna e invia la risposta entro i 30 secondi!</p>
                    </Row>
                </Col>
            </Row>
            <div style={{
                    overflowX: "auto",
                    whiteSpace: "nowrap"
                    }}
                >
                {posizioneSelezionata === 0 ? 
                (
                    <div style={{ display: "inline-block" }}>
                    <GameCards 
                            src={`http://localhost:3001/img/carte/${carta_round.immagine}`} 
                            nome ={carta_round.nome} 
                        
                    />
                    </div>
                ) :
                (
            
                <div style={{ display: "inline-block" }}>
                    <Button  className="mx-2" variant="outline-primary" onClick={() => onPosizioneSelezionata(0)} disabled={loading}>
                        <i className="bi bi-arrow-down"></i>
                    </Button>
                </div>
                
                )}
                {props.mano.map((carta, index) => (
                    <ComponenteMazzo 
                        key={index} 
                        index={index+1} 
                        carta={carta} 
                        onPosizioneSelezionata={onPosizioneSelezionata} 
                        posizioneSelezionata={posizioneSelezionata} 
                        loading={loading}
                        carta_round={carta_round}
                    />
                ))}
                
            </div>
            <Button
                variant={ tempoRestante >5 && tempoRestante<= 10 ? "warning" : tempoRestante <= 5 ? "danger" : "success"}
                onClick={() => onInvio(false)}
                disabled={loading}
                className={`mt-4 ${tempoRestante <= 5 ? "active" : ""}`}
                size={ tempoRestante <= 5 ? "lg" : ""}
            >
                 {loading ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" variant="primary"/>
                                </>
                            ) : (
                                `Invia risposta ${tempoRestante}`
                            )}

            </Button>
            {tempoRestante <= 5 && (
                <Row className="justify-content-center align-items-center text-danger fw-bold mt-2">Ultimi secondi!</Row>
            )}
            <Row className="my-4">
                {errore && <Alert variant="danger">{errore}</Alert>}
            </Row>
        </>
        
            ) : (<>
            
            
        {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{height: "60vh"}}>
                    <Spinner animation="border" variant="primary" />
                </div>
            ) 
            
            : 
            
            (
                <>
                    <h2>Le tue carte attuali:</h2>
                    <Row className="justify-content-center align-items-center my-5">
                        <ManoComponent mano={props.mano}/>
                    </Row>
                    <Row className="justify-content-center align-items-center">
                        <Col>
                            <Button variant="dark" onClick={iniziaRound} disabled={loading}>Inizia il round</Button>
                        </Col>
                    </Row>
                </>
            )
        }</>)
            }
        
    </>);
}

function ComponenteMazzo(props){
    return(
        <> 
            <div style={{ display: "inline-block" }}>
            <GameCards src={`http://localhost:3001/img/carte/${props.carta.immagine}`} nome ={props.carta.nome} indice ={props.carta.indice}/>
            </div>
            {props.posizioneSelezionata === props.index ? 
                (
                    <div style={{ display: "inline-block"}}>
                    <GameCards 
                            src={`http://localhost:3001/img/carte/${props.carta_round.immagine}`} 
                            nome ={props.carta_round.nome} 
                        
                    />
                    </div>
                ) :
                (
            <div style={{ display: "inline-block" }}>      
            <Button  className="mx-2" variant="outline-primary" onClick={() => props.onPosizioneSelezionata(props.index)} disabled={props.loading}>
                <i className="bi bi-arrow-down"></i>
            </Button>
            </div> )} 
        </>
    );
}

export default GamePage;