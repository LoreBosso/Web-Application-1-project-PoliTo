import { useEffect } from "react";
import { Accordion, Table, Badge, Spinner, Row } from "react-bootstrap";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

function GameHistory(props) {
  

  useEffect(() => {
    const cronologia = async()=>{
      try{
       await props.getCronologia();
      }
      catch(err){
        console.error("Errore nel recupero della cronologia partite: ", err);
      }
    }
    cronologia();
  }, []);

  return (
    <>
    {props.loading ? (
                <Row className="d-flex justify-content-center align-items-center" style={{height: "60vh"}}>
                    <Spinner animation="border" variant="primary" />
                </Row>
            ) :
    (<>
      {props.crono && props.crono.length > 0 ? (
        <>
          <h5>Cronologia partite completate</h5>
          <Accordion className="my-5">
            {props.crono.map((partita, idx) => (
              <Accordion.Item eventKey={idx.toString()} key={partita.id}>
                <Accordion.Header>
                  <span className="d-flex align-items-center w-100" style={{gap: "1rem"}}>
                    <strong>Data:</strong> {dayjs(partita.data.trim(),'DD-MM-YYYY HH:mm:ss').format("DD/MM/YYYY HH:mm")}  |
                    <strong>Esito:</strong>{" "}
                    <Badge
                      bg={
                        partita.esito === "vinta"
                          ? "success"
                          : partita.esito === "persa"
                          ? "danger"
                          : "secondary"
                      }
                    >
                      {partita.esito}
                    </Badge>
                    |
                    {partita.rounds_vinti === 1 ? (<strong>{partita.rounds_vinti} carta raccolta:</strong>) : <strong>{partita.rounds_vinti} carte raccolte:</strong>}
                  </span>
                </Accordion.Header>
                <Accordion.Body>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Situazione orribile</th>
                        <th>Vinta</th>
                        <th>Round</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partita.carte.map((carta, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{carta.nome_carta}</td>
                          <td>
                            {carta.numero_round ? (
                              <Badge
                                bg={
                                  carta.esito_round === "vinto"
                                    ? "success"
                                    : carta.esito_round === "perso"
                                    ? "danger"
                                    : "secondary"
                                }
                              >
                                {carta.esito_round === "vinto"
                                  ? "Si"
                                  : carta.esito_round === "perso"
                                  ? "No"
                                  : null}
                              </Badge>
                            ) : (
                              <Badge bg="secondary">--</Badge>
                            )}
                          </td>
                          <td>
                            {carta.numero_round ? (
                              carta.numero_round
                            ) : (
                              <span className="text-muted">Iniziale</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </>
      ) : (
        <p>Nessuna partita completata trovata.</p>
      )}
    </>)}
</>
  );
}

export default GameHistory;