import { Container } from "react-bootstrap";
import { Outlet } from "react-router";
import NavHeader from "./NavHeader";

function GameLayout(props) {
  
  return(
    <>
        <NavHeader utente ={props.utente} isLoggato = {props.isLoggato} game={1} statistiche={props.statistiche} aggiornaStatistiche ={props.aggiornaStatistiche} statoRound={props.statoRound} partita = {props.partita}/>
        <Container fluid className="my-5 shadow p-3 rounded bg-white">
            <Outlet />
        </Container>
        <footer className="text-center py-3 mt-auto">
          © 2025 Applicazioni Web I - Gioco della Sfortuna - Bosso Lorenzo s349410
        </footer>
    </>
  );
}

export default GameLayout;