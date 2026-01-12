import { Alert, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router";
import NavHeader from "./NavHeader";

function DefaultLayout(props) {
  
  return(
    <>
      <NavHeader utente ={props.utente} isLoggato = {props.isLoggato} game={0} loading={props.loading} setLoading={props.setLoading}/>
      {props.messaggio.msg.length > 0 && 
        <Row>
        <Alert className="shadow p-3 rounded" variant={props.messaggio.tipo} onClose={() => props.setMessaggio({msg: "", tipo: ""})} dismissible>{props.messaggio.msg}</Alert>
        </Row>
        }
      <Container fluid className="my-5 shadow p-3 rounded bg-light">
        <Outlet />
      </Container>
      <footer className="text-center py-3 mt-auto">
        © 2025 Applicazioni Web I - Gioco della Sfortuna - Bosso Lorenzo s349410
      </footer>
    </>
  );
}

export default DefaultLayout;