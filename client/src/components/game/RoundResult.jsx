import { Button, Row,Col, Spinner } from "react-bootstrap";

function RoundResult(props){

const handleProssimoRound = async () => {
    try{
        await props.prossimoRound();
    }
    catch(err){
        console.error(err);
    } 
};
    
    return(
        <>
            <>
                <Row className="justify-content-center my-5">  
                    <h2>{props.statoRound.msg}</h2>
                </Row>
                <Row className="justify-content-center my-5">
                    <Col>
                        <Button variant="dark" className="mx-2 my-2"onClick={handleProssimoRound} disabled={props.loading}>
                        {props.loading ? 
                            (
                                <Spinner as="span" animation="border" size="sm" variant="primary"/>
                            ) 
                            : 
                            (
                                "Prossimo round"
                            )
                        }
                        </Button>
                    </Col>
                </Row>
            </>
        </>

    );
}

export default RoundResult;