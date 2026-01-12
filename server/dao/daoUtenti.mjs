import crypto from 'crypto';
import { db } from '../db/openDb.mjs';

// Funzione per verificare l'esistenza di un utente nel database
export function getNomeUtente(id) {
    return new Promise((res,rej)=>{
        const sql =`SELECT username 
                    FROM utenti 
                    WHERE id = ?`;

        db.get(sql, [id], (err, row) => {
            if (err) {
                console.error("Errore nella ricerca dell'utente: " + err.message);
                rej(err);
            }
            else if (row === undefined) {
               
                res(null);
            }
            else {
                res(row);
            } 
            
        });
    });
}


export function getUtente(username,password){
    return new Promise((res,rej)=>{
        const sql =`SELECT * 
                    FROM utenti 
                    WHERE username = ?`;
                    
        db.get(sql,[username],(err,row)=>{
            if(err){
                rej(err);
            }
            else if(row===undefined){
                res(null);
            }
            else{
                const user = {id: row.id, username: row.username };
                crypto.scrypt(password,row.salt,32,(err,hashedPassword)=>{
                    if(err){
                        rej(err);
                    }
                    if(crypto.timingSafeEqual(Buffer.from(row.password,'hex'), hashedPassword)){
                        res(user);
                    }
                    else{
                        res(null);
                    }
                });
            }
        });
    });
}