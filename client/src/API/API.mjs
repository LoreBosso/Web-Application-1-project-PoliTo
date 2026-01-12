import { Round } from "../models/modelli.mjs";

//URL 
const SERVER_URL = 'http://localhost:3001';

// Funzione per lanciare gli errori
const handleError = async (response) => {
  let msg = await response.text();
  throw new Error(msg);
};

// Autenticazione
// POST /api/sessioni
const login = async (credenziali)=>{
  const response = await fetch(`${SERVER_URL}/api/sessioni`,{
      method: 'POST',
      headers: {
      'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(credenziali)
    });
    if(!response.ok){
      await handleError(response);
    }
    const user = await response.json();
    return user;
}

// Logout
// DELETE /api/sessioni/corrente
const logout = async() =>{
  const response = await fetch(`${SERVER_URL}/api/sessioni/corrente`,{
    method: 'delete',
    credentials: 'include'
  });
  if(response.ok){
    return null;
  }
  else{
    await handleError(response);
  }

}

// Ottiene le informazioni sulla sessione corrente
// GET /api/sessioni/corrente
const getInformazioniSessione= async ()=>{
  const response = await fetch(`${SERVER_URL}/api/sessioni/corrente`,{
    credentials: 'include'
  });
  if(response.ok){
    return await response.json();
  }
  else{
    await handleError(response);
  }
}

// Crea una partita demo
// GET /api/demo/partita
const iniziaDemo= async ()=> {
    const response = await fetch(`${SERVER_URL}/api/demo/partita`);
    if (!response.ok) {
      await handleError(response);
    }
    const responseJson= await response.json();
    return new Round(responseJson.mazzo,responseJson.carta_round,responseJson.tempo_inizio);
}

// Risponde al round di una demo
// PUT /api/demo/risposta
const rispondiDemo= async (risposta,carta_round,tempo_inizio,mazzo)=>{
    const response = await fetch(`${SERVER_URL}/api/demo/risposta`,{
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      risposta,
    mazzo: mazzo,
    carta_round: {id: carta_round.id},
    tempo_inizio
    })
    });
    if(!response.ok){
      await handleError(response);
    }
    const responseJson = await response.json();
    return responseJson;
}

// Crea una nuova partita con un utente 
// POST /api/utenti/<uid>/partite
const iniziaPartita = async (utente_id)=>{
  const response = await fetch(`${SERVER_URL}/api/utenti/${utente_id}/partite`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include'
  });
  if(!response.ok){
    await handleError(response);
  }
  const responseJson = await response.json();
  return responseJson;
}

// Avvia un nuovo round all'interno di una partita
// POST /api/partite/<pid>/rounds
const iniziaRound = async (partita_id)=>{
  const response = await fetch(`${SERVER_URL}/api/partite/${partita_id}/rounds`,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
  });
  
  if(!response.ok){
    await handleError(response);
  }
  const responseJson = await response.json();
  return responseJson;
}

// Risponde a un round di una partita
// PUT /api/partite/<pid>/rounds/<rid>/risposta
const rispondiRound = async (partita_id,round_id,risposta)=>{
  const response = await fetch(`${SERVER_URL}/api/partite/${partita_id}/rounds/${round_id}/risposta`,{
    method: "PUT",
    headers: {"Content-Type": "application/json"},
    credentials: 'include',
    body: JSON.stringify({
    posizione: risposta
    })
    });
  if(!response.ok){
    await handleError(response);
  }
  const responseJson = await response.json();
  return responseJson;
}

// Permette di ottenere la mano corrente di un giocatore
// GET /api/partite/<pid>/mazzo
const getMano = async (partita_id)=>{
  const response = await fetch(`${SERVER_URL}/api/partite/${partita_id}/mazzo`,{
    credentials: 'include'
  });
  if(!response.ok){
    await handleError(response);
  }
  const responseJson = await response.json();
  return responseJson;
}

// Permette di ottenere la cronologia delle partite di un utente
// GET /api/utenti/<uid>/partite
const getCronologia = async (utente_id)=>{
  const response = await fetch(`${SERVER_URL}/api/utenti/${utente_id}/partite`,{
    credentials: 'include'
  });
  if(!response.ok){
    await handleError(response);
  }
  const responseJson = await response.json();
  return responseJson;
}

// Permette di ottenere le vittorie e le sconfitte di una partita
// GET /api/partite/<pid>/stats
const getStatistiche = async (partita_id)=>{
  const response = await fetch(`${SERVER_URL}/api/partite/${partita_id}/stats`,{
    credentials: 'include'
  });
  if(!response.ok){
    await handleError(response);
  }
  const responseJson = await response.json();
  return responseJson;
}

const API = {
  iniziaDemo,
  rispondiDemo,
  login,
  getInformazioniSessione,
  logout,
  iniziaPartita,
  iniziaRound,
  rispondiRound,
  getMano,
  getCronologia,
  getStatistiche
};
export default API;