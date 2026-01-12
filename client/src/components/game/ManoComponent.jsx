import { Col, Row } from "react-bootstrap";
import GameCards from "../common/GameCards";

function ManoComponent(props){
    return(
        <>
        { props.fine ? (
            <Row 
                className="justify-content-center align-items-center" 
            >
            {(props.mano).map((carta, index) => (
                <Col xs="auto" key={index}>
                    <GameCards src={`http://localhost:3001/img/carte/${carta.immagine}`} 
                               nome ={carta.nome} 
                               indice ={carta.indice}
                               fine ={props.fine}/>
                </Col>
            ))}
            </Row>
        ) : (
            <div 
                style={{overflowX: "auto", whiteSpace: "nowrap"}}
            >
            
            {(props.mano).map((carta, index) => (
                <div key={index} style={{ display: "inline-block" }}>
                    <GameCards src={`http://localhost:3001/img/carte/${carta.immagine}`} nome ={carta.nome} indice ={carta.indice}/>
                </div>
            ))}
            </div>
    )}
    </>)
}

export default ManoComponent;