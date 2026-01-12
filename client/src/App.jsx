import { useEffect, useState } from 'react';
import './App.css';
import { Routes, Route, Navigate, useNavigate} from 'react-router';
import HomePage from './components/HomePage';
import DemoPage from './components/demo/DemoPage';
import DemoResult from './components/demo/DemoResult';
import DefaultLayout from './components/layout/DefaultLayout';
import LoginPage from './components/LoginPage';
import API from './API/API.mjs';
import ProfilePage from './components/profile/ProfilePage';
import GamePage from './components/game/GamePage';
import GameResult from './components/game/GameResult';
import RoundResult from './components/game/RoundResult';
import GameLayout from './components/layout/GameLayout';
import NotFound from './components/NotFound';

function App() {
  
  const [statoRound,setStatoRound] = useState({});
  const [messaggio,setMessaggio] = useState({msg: "", tipo: ""});
  const [isLoggato,setIsLoggato]= useState(false);
  const [utente,setUtente] = useState({});
  const [partita,setPartita] = useState({id: 0, rounds_giocati: 0});
  const [mano,setMano] = useState([]);
  const [statistiche,setStatistiche] = useState({});
  const [loading,setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (credenziali)=>{
    setLoading(true);
    try{
      const user = await API.login(credenziali);
      setIsLoggato(true);
      setMessaggio({msg: 'Benvenut* ' + user.username + '!' , tipo: 'success'});
      setUtente(user);
    }
    catch(err){
      
      if (err.message === "Failed to fetch") {
        setMessaggio({msg: "Errore di comunicazione con il server. Riprova più tardi.", tipo: 'danger'});
      } 
      else if (err.message === "Unauthorized") {
        setMessaggio({msg: "Credenziali non valide.", tipo: 'danger'});
      } 
      else {
        setMessaggio({msg: "Errore sconosciuto. Riprova.", tipo: 'danger'});
      }
    }
    finally{
      setLoading(false);
    }       
  }

  const handleLogout = async ()=>{
    setLoading(true);
    try{
      await API.logout();
      setIsLoggato(false);
      setUtente({});
      setStatoRound({});
      setMano([]);
      setStatistiche({});
      setPartita({id: 0, rounds_giocati: 0});
      setMessaggio({msg: 'Logout effettuato correttamente', tipo: 'success'});
    }
    catch(err){
      if (err.message === "Failed to fetch") {
        setMessaggio({msg: "Errore di comunicazione con il server. Riprova più tardi.", tipo: 'danger'});
      } 
      else if (err.message === "Unauthorized") {
        setMessaggio({msg: "Sessione scaduta", tipo: 'danger'});
      } 
      else {
        setMessaggio({msg: "Errore sconosciuto. Riprova.", tipo: 'danger'});
      }
    }
    finally{
      setLoading(false);
    }
  }
  
  const reset = ()=>{
    setStatoRound({});
    setMano([]);
    setStatistiche({});
    setPartita({id: 0, rounds_giocati: 0});
    setMessaggio({msg: "", tipo: ""});
    
  }

  const iniziaPartita = async(utente_id)=>{
    setLoading(true);
    try{
      const p = await API.iniziaPartita(utente_id);
      setPartita({ id: p.partita_id, rounds_giocati: 1 });
      setMano(p.mazzo);
      
      navigate("/partita");
    }
    catch(err){
      console.error("Impossibile avviare la partita: ",err);
      if (err.message === "Failed to fetch") {
        setMessaggio({msg: "Errore di comunicazione con il server. Riprova più tardi.", tipo: 'danger'});
      } 
      else if (err.message === "Unauthorized") {
        setMessaggio({msg: "Sessione scaduta. Impossibile avviare la partita. Effettua nuovamente il login.", tipo: 'danger'});
      } 
      else {
        setMessaggio({msg: "Errore sconosciuto. Riprova.", tipo: 'danger'});
      }
    }
    finally{
      setLoading(false);
    }
  }

  const prossimoRound = async ()=>{
    try{
      await aggiornaMano();
      setPartita(prev => ({...prev, rounds_giocati: prev.rounds_giocati + 1}));
      setStatoRound({});
     
      navigate("/partita");
    }
    catch(err){
      console.error("Impossibile continuare la partita: ",err);
    }
  }

  const aggiornaMano= async()=>{
    setLoading(true);
    try{
      const m = await API.getMano(partita.id);
      setMano(m.mazzo);
    }
    catch(err){
      console.error("Impossibile recuperare il mazzo: ",err);
      if (err.message === "Failed to fetch") {
        setMessaggio({msg: "Errore di comunicazione con il server. Riprova più tardi.", tipo: 'danger'});
      } 
      else if (err.message === "Unauthorized") {
        setMessaggio({msg: "Sessione scaduta. Impossibile recuperare le carte. Effettua nuovamente il login.", tipo: 'danger'});
      } 
      else {
        setMessaggio({msg: "Errore sconosciuto. Riprova.", tipo: 'danger'});
      }
    }
    finally{
      setLoading(false);
    }
  }

  const aggiornaStatistiche = async ()=>{
    setLoading(true);
    try{
      const stats = await API.getStatistiche(partita.id);
      setStatistiche(stats);
    }
    catch(err){
      console.error("Errore nel recupero delle statistiche partita: ",err);
      if (err.message === "Failed to fetch") {
        setMessaggio({msg: "Errore di comunicazione con il server. Riprova più tardi.", tipo: 'danger'});
      } 
      else if (err.message === "Unauthorized") {
        setMessaggio({msg: "Sessione scaduta. Impossibile recuperare le statistiche. Effettua nuovamente il login.", tipo: 'danger'});
      } 
      else {
        setMessaggio({msg: "Errore sconosciuto. Riprova.", tipo: 'danger'});
      }
    }
    finally{
      setLoading(false);
    }
  }

  //Effetto di recupero informazioni utente loggato
  useEffect(()=>{
    const checkLoggato = async ()=>{
      setLoading(true);
      try{
        const u = await API.getInformazioniSessione();
        setIsLoggato(true);
        setUtente(u);
      }
      catch(err){
        setIsLoggato(false);
        setUtente({});
      }
      finally{
        setLoading(false);
      }
    }
    checkLoggato();
  },[]);

  return (
    <>
      <Routes>
        <Route element ={<DefaultLayout messaggio={messaggio} setMessaggio = {setMessaggio} isLoggato={isLoggato} utente = {utente} loading={loading} setLoading={setLoading} />}>
          <Route path='/' element={<HomePage isLoggato={isLoggato} utente={utente} iniziaPartita={iniziaPartita}/>}/>
          <Route path='/demo' element={<DemoPage setStatoRound ={setStatoRound} setMessaggio = {setMessaggio} reset={reset} />}/>
          <Route path='/demo/risultato' element={<DemoResult statoRound ={statoRound}/>}/>
          <Route path='/profilo' element={isLoggato ? <ProfilePage  handleLogout={handleLogout} utente={utente} setMessaggio={setMessaggio}/> : <Navigate to= "/"/>}/>
          <Route path='/login' element={isLoggato ? <Navigate to= "/"/> : <LoginPage handleLogin = {handleLogin} setMessaggio = {setMessaggio} setLoading={setLoading} loading={loading}/>}/>
          <Route path="*" element={<NotFound/>} />
        </Route>
        <Route element ={<GameLayout isLoggato={isLoggato} utente = {utente} aggiornaStatistiche ={aggiornaStatistiche} statistiche={statistiche} statoRound ={statoRound} partita={partita}/> } >
          <Route path='/partita' element={isLoggato ? <GamePage utente = {utente} setStatoRound={setStatoRound} statoRound={statoRound} setMessaggio = {setMessaggio} mano={mano} partita={partita} reset={reset}/> : <Navigate to="/"/>}/>
          <Route path='/partita/round/risultato' element={isLoggato ? <RoundResult statoRound={statoRound} prossimoRound={prossimoRound} loading={loading} /> : <Navigate to="/"/>}/>
        </Route>
        <Route path='/partita/risultato' element={isLoggato ? <GameResult statoRound={statoRound} prossimoRound={prossimoRound} iniziaPartita ={iniziaPartita} utente={utente} partita ={partita} mano={mano} aggiornaMano={aggiornaMano} aggiornaStatistiche={aggiornaStatistiche} reset={reset} loading={loading}/> : <Navigate to="/"/>}/>
      </Routes>
      
    </>
  )
}

export default App
