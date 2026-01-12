import { useEffect, useState } from "react";
import { Button, Alert, Spinner, Row, Col } from "react-bootstrap";
import GameCards from "../common/GameCards";
import API  from "../../API/API.mjs";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router";
function DemoPage(props){

    
    const [carta_round,setCarta_round] = useState({});
    const [mazzo,setMazzo] = useState([]);
    const [tempo_inizio,setTempo_inizio] = useState(0);
    const [posizioneSelezionata,setPosizioneSelezionata] = useState(-1);
    const [tempoRestante,setTempoRestante] = useState(30);
    const [roundIniziato,setRoundIniziato] = useState(false);
    const [errore, setErrore] = useState("");
    const [loading,setLoading] = useState(false);

    const navigate = useNavigate();
    const onPosizioneSelezionata = (index)=> {
        setErrore("");
        setPosizioneSelezionata(index);
    }

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
                
                risultato_round = await API.rispondiDemo(-1, carta_round, tempo_inizio, mazzo);
            }
            else{
                
                risultato_round = await API.rispondiDemo(posizioneSelezionata, carta_round, tempo_inizio, mazzo);
            }
            
            props.setStatoRound(risultato_round);
            navigate("/demo/risultato");
        }
        catch (err) {
            console.error("Impossibile completare la demo:", err);
            props.setMessaggio({msg: "Errore nella risposta alla Demo, verrai riportato alla home.", tipo: 'danger'});
            props.reset();
            navigate("/");
        }
        finally{
            setLoading(false);
        }
    }

    // Effetto per ottenere i dati del round
    useEffect(()=>{
        const iniziaRound = async ()=>{
            setLoading(true);
            try{
                
                if (props.statoRound === "in corso") return;
                const nuovo_round = await API.iniziaDemo();
                setCarta_round(nuovo_round.carta_round);
                setMazzo(nuovo_round.mazzo);
                setTempo_inizio(nuovo_round.tempo_inizio);
                props.setStatoRound("in corso");
                setRoundIniziato(true);
            }
            catch(err){
                console.error("Impossibile avviare la demo:", err);
                props.setMessaggio({msg: "Errore nell'avvio della Demo, verrai riportato alla home.", tipo: 'danger'});
                props.reset();
                navigate("/");

            }
            finally{
                setLoading(false);
            }
        }
        iniziaRound();
    },[]);

    // Effetto per il timer
    useEffect(() => {
    if (!roundIniziato) return;
    if (tempoRestante === 0) {
        onInvio(true);
        return;
    }
    const timeout = setTimeout(() => {
        setTempoRestante((t) => t - 1);
    }, 1000);

    return () => clearTimeout(timeout);

}, [roundIniziato, tempoRestante]);


    return(
        <>
            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{height: "60vh"}}>
                    <Spinner animation="border" variant="primary" />
                </div>
            ) :(
            <>
            <h2>Il round ha inizio!</h2>
            <Row className="mb-3 justify-content-center align-items-center">
                <Col xs="auto" className="d-flex flex-column align-items-center">
                    <h4>Hai {tempoRestante} secondi!</h4>
                    <div style={{ minHeight: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <GameCards 
                            src={`http://localhost:3001/img/carte/${carta_round.immagine}`} 
                            nome ={carta_round.nome} 
                            misteriosa ={"❓ Carta da inserire"}
                        />
                    </div>
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

                {mazzo.map((carta, index) => (
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
                onClick={()=> onInvio(false)}
                disabled={loading}
                className={`mt-2 ${tempoRestante <= 5 ? "active" : ""}`}
                size={ tempoRestante <= 5 ? "lg" : ""}
            >
                {loading ? <Spinner variant="primary" animation="border" size="sm"/> : "Invia risposta"} {tempoRestante}
            </Button>
            {tempoRestante <= 5 && (
                <Row className=" justify-content-center align-items-center text-danger fw-bold mt-2">Ultimi secondi!</Row>
            )}
            <Row className="my-4">
                {errore && <Alert variant="danger">{errore}</Alert>}
            </Row>
           </> )}
        </>
    );
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
                    <Button variant="outline-primary" onClick={() => props.onPosizioneSelezionata(props.index)} disabled={props.loading}>
                       <i className="bi bi-arrow-down"></i>
                    </Button>
                </div>)}
        </>
);
}

export default DemoPage;