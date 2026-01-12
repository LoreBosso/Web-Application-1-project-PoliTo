import { useEffect } from "react";
import { Container, Navbar, Nav, Badge } from "react-bootstrap";
import { Link } from "react-router";

function NavHeader(props) {

    useEffect(()=>{
        if(props.aggiornaStatistiche){
            props.aggiornaStatistiche();
        }
    },[props.statoRound,props.partita]);

    return (
        
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
            {props.game ? (
                <Nav className="ms-auto">
                    <Badge className="mx-2" bg="success">vittorie: {props.statistiche.vittorie ? props.statistiche.vittorie : 0}</Badge>
                    <Badge className="mx-2" bg="danger">sconfitte: {props.statistiche.sconfitte ? props.statistiche.sconfitte :0}</Badge>
                </Nav>
                
            ) 
            : 
            (
            <>
            <Nav className="me-auto mx-4">
                <Nav.Link as={Link} to="/" disabled={props.loading}><i className="bi bi-house-door-fill"></i></Nav.Link>
            </Nav>
            <Nav className="ms-auto">
                    {props.isLoggato ? (
                        <Nav.Link className="d-flex align-items-center" as={Link} to="/profilo" disabled={props.loading}>
                            {props.utente.username || "Profilo"} <i className="bi bi-person-square mx-3"></i>
                        </Nav.Link>
                    ) : (
                        <Nav.Link className="d-flex align-items-center"  as={Link} to="/login" disabled={props.loading}>
                            Accedi
                        </Nav.Link>
                    )}
            </Nav>
            </>
            )}
            
        </Container>
      </Navbar>
    
    );
}

export default NavHeader;