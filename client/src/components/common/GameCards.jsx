import { Card } from "react-bootstrap";

function GameCards(props){
    return(
        <Card
        style=
        {{ 
        width: (props.misteriosa || props.fine  ? "20rem" : "15rem") 
        }}  
        className="mb-5 shadow-lg p-3 rounded mx-2"
        bg={props.indice ? "light" : "warning"}
        border={props.indice ? "light" : "warning"}
        >
            <Card.Img variant="top" 
                      src={props.src} 
                      alt={props.nome} 
            />
            
            <Card.Body>
                <Card.Text className="card-text">
                    {props.nome}
                </Card.Text>
            </Card.Body>
            {props.indice ? (<Card.Footer className="text-muted">Indice di sfortuna: {props.indice}</Card.Footer>) 
            : (<Card.Footer className="text-muted">Indice di sfortuna: ❓</Card.Footer>) }     
        </Card>
    );
}

export default GameCards;