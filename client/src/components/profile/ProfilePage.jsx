import { Button} from "react-bootstrap";
import API from "../../API/API.mjs";
import { useState } from "react";
import GameHistory from "./GamesHistory";

function ProfilePage(props) {

    const [crono,setCrono] = useState([]);
    const [loading,setLoading] = useState(false);

    const getCronologia = async ()=>{
        setLoading(true);
        try{
            
            const c = await API.getCronologia(props.utente.id);
            setCrono(c);
        }
        catch(err){
            console.error("Errore nel recupero della cronologia partita: ",err);
            if (err.message === "Failed to fetch") {
                props.setMessaggio({msg: "Errore di comunicazione con il server. Riprova più tardi.", tipo: 'danger'});
            } 
            else if (err.message === "Unauthorized") {
                props.setMessaggio({msg: "Sessione scaduta. Impossibile recuperare la cronologia partite. Effettua nuovamente il login.", tipo: 'danger'});
            } 
            else {
                props.setMessaggio({msg: "Errore sconosciuto. Riprova.", tipo: 'danger'});
            }
        }
        finally{
            setLoading(false);
        }
    }

    return (
        <>
            <h1 className="mb-4">Profilo di {props.utente.username}</h1>
            <GameHistory crono ={crono} getCronologia={getCronologia} loading ={loading}/>
            <Button variant="danger" className="my-5" onClick={props.handleLogout}>Logout</Button>
        </>
    );
}

export default ProfilePage;