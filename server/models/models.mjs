// Round

function Round(partita_id,numRound,carta_id,startTime){
    this.partita_id = partita_id;
    this.numRound = numRound;
    this.carta_id = carta_id;
    this.startTime = startTime;
}

// Carta

function Carta(partita_id,carta_id,vinta_in_round){
    this.partita_id = partita_id;
    this.carta_id = carta_id;
    this.vinta_in_round = vinta_in_round;

}

function Partita(id,esito,numero_rounds,data,vittorie){
    this.id = id;
    this.esito = esito;
    this.numero_rounds = numero_rounds;
    this.data = data;
    this.carte = [];
    this.rounds_vinti = vittorie;
}

export {Round, Carta, Partita};