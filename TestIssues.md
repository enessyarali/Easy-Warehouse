# Problemi Test [gruppo 34]

Questa è una raccolta di problemi che abbiamo riscontrato nei test.  
In particolare, come già anticipato al Professor Morisio in classe, ci siamo ritrovati con circa 165 su 174 test non passati causati da problemi nei test (piuttosto che nel nostro programma), soprattutto perché questi non rispettano la consistency del database, causando fallimenti a catena.  
Questo ci rende frustrati e dispiaciuti, perché abbiamo lavorato molto su questo progetto e ora ci ritroviamo a "peggiorare" il nostro codice, modificandolo in modo invasivo, per fare in modo che questi test non falliscano.  
Abbiamo quindi deciso di segnalare i problemi riscontrati, sperando in una patch che li risolva. Questi fix non cambiano la performance di tutti i progetti che non si sono preoccupati della consistency, ma fanno davvero la differenza per chi si è impegnato per mantenerla.  
Per cercare di testare il nostro codice per trovare dei veri difetti, abbiamo dovuto modificare il codice dei test. Le nostre modifiche sono raccolte in un apposito branch `test-fixing-branch` sul GitLab del corso, e segnalate da `FIXME`. Queste modifiche risolvono ***tutti i problemi*** elencati di sotto.

## Bug nelle funzioni di `deleteAll`
Come già scritto al professor Ardito, il comportamento di tutte le funzioni di `deleteAll` è scorretto.  
In particolare, aggiungendo delle stampe di debug per testare l'ordine di esecuzione delle istruzioni, si può notare come la scritta "done!" appaia dopo quelle di "Deleted" (e dopo che il test successivo è stato eseguito):

```
function deleteAllSkuItems(agent) {
    describe('removing all skuitems', function() {
        it('Getting SKUitems', function (done) {
            agent.get('/api/skuitems')
            .then(function (res) {
                console.log(res.body);
                res.should.have.status(200);
                if (res.body.length !==0) {
                    for (let i = 0; i < res.body.length; i++) {
                        agent.delete('/api/skuitems/'+res.body[i].RFID)
                        .then(function (res2) {
                            res2.should.have.status(204);
                            console.log("Deleted "+res.body[i].RFID);
                        });
                    }
                }
                console.log("done!");
                done();
            }).catch(err => done(err));
        });
    });


>>> OUTPUT
Server listening at http://localhost:3001


  Test skuitem CRUD features
    removing all skuitems
[
  {
    RFID: '12345678901234567890123456789015',
    SKUId: 55,
    Available: 1,
    DateOfStock: '2021/11/29 12:30'
  },
  {
    RFID: '12345678901234567890123456789016',
    SKUId: 55,
    Available: 0,
    DateOfStock: '2021/11/29 21:45'
  }
]
done!
      ✔ Getting SKUitems
    removing all skus
Deleted 12345678901234567890123456789015
Deleted 12345678901234567890123456789016
      ✔ Getting SKUs (77ms)
    post /api/sku/
```

Il problema è causato dal fatto che .then() non è un'operazione bloccante, quindi done() - un'operazione sincrona - è chiamata PRIMA delle delete - asincrone - causando l'esecuzione in parallelo delle API di delete e del test successivo (che se è una get fallisce perché il database non è ancora stato svuotato del tutto):
"Once a Promise is fulfilled or rejected, the respective handler function (onFulfilled or onRejected) will be called ***asynchronously*** (scheduled in the current thread loop). The behavior of the handler function follows a specific set of rules." [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then]
In questa documentazione c'è anche un esempio che mostra il comportamento non bloccante di .then().

Il problema si risolve utilizzando Promise.all(...).then(... done()). In questo modo le promesse sono eseguite in parallelo e combinate in un'unica promessa che viene accettata se tutte vengono accettate, o respinta se almeno una lo è, e il done() è inserito nel then di questa promessa:

```
function deleteAllSkuItems(agent) {
    describe('removing all skuitems', function() {
        it('Getting SKUitems', function (done) {
            agent.get('/api/skuitems')
            .then(function (res) {
                console.log(res.body);
                res.should.have.status(200);
                if (res.body.length !==0) {
                    Promise.all(res.body.map((item) => agent.delete('/api/skuitems/'+item.RFID)))
                    .then((results) => {
                        results.map((res2) => {
                            res2.should.have.status(204);
                            console.log("Deleted");
                        });
                        console.log("done!");
                        done();
                    });
                }
            }).catch(err => done(err));
        });
    });
}
```

o, in alternativa, con async-await poiché await, al contrario di .then(), è bloccante:
"The await expression causes async function execution to ***pause*** until a Promise is settled (that is, fulfilled or rejected), and to resume execution of the async function after fulfillment. When resumed, the value of the await expression is that of the fulfilled Promise."
[https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await].

```
function deleteAllSkuItems(agent) {
    describe('removing all skuitems', function() {
        it('Getting SKUitems', async function () {
            const res = await agent.get('/api/skuitems');
            console.log(res.body);
            res.should.have.status(200);
            if (res.body.length !==0) {
                let res2;
                for (let i = 0; i < res.body.length; i++) {
                    res2 = await agent.delete('/api/skuitems/'+res.body[i].RFID);
                    res2.should.have.status(204);
                    console.log("Deleted "+ res.body[i].RFID);
                }
            }
            console.log("done!");
        });
    });
}
```

In entrambi i casi, il flusso di esecuzione ha il comportamento atteso:

```
Server listening at http://localhost:3001


  Test skuitem CRUD features
    removing all skuitems
[
  {
    RFID: '12345678901234567890123456789015',
    SKUId: 67,
    Available: 1,
    DateOfStock: '2021/11/29 12:30'
  },
  {
    RFID: '12345678901234567890123456789016',
    SKUId: 67,
    Available: 0,
    DateOfStock: '2021/11/29 21:45'
  }
]
Deleted 12345678901234567890123456789015
Deleted 12345678901234567890123456789016
done!
      ✔ Getting SKUitems (69ms)
    removing all skus
```
Molti colleghi stanno avendo lo stesso problema, il che non fa che rafforzare l'idea riportata di sopra.

## Consistency delle operazioni di delete
Le operazioni di delete sono eseguite in un ordine che "rompe" la consistency del database.  
Un esempio si può trovare in test-CRUD-testDescriptor.

```
skuitems.deleteAllSkuItems(agent);      
skus.deleteAllSkus(agent);
testdescriptors.deleteAllTestDescriptors(agent);
```

In questo caso, chiaramente i test descriptor dipendono dagli SKU, quindi eliminare prima gli SKU e poi i test descriptor romperebbe la consistency del database, ed è per questo impedito.  
A questo punto, gli SKU sono ancora nel database, e tutti - o quasi - i test successivi falliscono di conseguenza.  
Il problema potrebbe essere risolto semplicemente invertendo l'ordine delle delete:

```
testdescriptors.deleteAllTestDescriptors(agent);
skuitems.deleteAllSkuItems(agent);      
skus.deleteAllSkus(agent);
```
La stessa cosa accade in altre CRUD suite:
- test-CRUD-InternalOrder
- test-CRUD-Item
- test-CRUD-TestResult


## Modifiche del database
In generale, tutti i test non lasciano il database nello stato in cui lo hanno trovato, ma si preoccupano semplicemente di eliminare ciò che *credono* gli servirà all'inizio (senza eliminare quello che hanno inserito). Questo causa, di nuovo, problemi di consistency, questa volta più sottili e difficili da identificare.
Ad esempio, in test-CRUD-internalOrder, gli internal order vengono creati, ma NON eliminati alla fine dei test.  
Poiché ogni internal order ha una dipendenza da un customer (cioè un user), la volta successiva che `testDeleteAllNotManagerUsers` viene chiamata, l'operazione fallisce a causa della dipendenza dagli internal order, causando - di nuovo - fallimenti a cascata.   
Un problema simile si ha, in generale, con **tutti i CRUD** più la suite `testEzWhAPI`.

## Bug in `test-CRUD-user`
In questa test suite, l'utente `user12@ezwh.com, customer` viene aggiunto. Dopodiché, il suo tipo viene modificato, e l'utente diventa `user12@ezwh.com, clerk`.  
Dato che i CRUD vengono eseguiti due volte, alla chiamata successiva si cerca di eliminare `user12@ezwh.com, customer`, che però non esiste più (quindi la chiamata non ha effetto).  
L'utente viene quindi ri-inserito nel database (che ora contiene sia `user12@ezwh.com, customer` che `user12@ezwh.com, clerk`), e quando si cerca di modificare `user12@ezwh.com, customer` in `user12@ezwh.com, clerk`, l'operazione fallisce e il database ritorna "UNIQUE constraint failed".

## Bug in `testGetSkuById` (`utils-sku`)
Nella condizione dell'if a riga 109, `skuid==null` dovrebbe essere sostituito da `skuid===null`. Questo perché, passando 0 come parametro (ovvero un indice valido per il vettore id[]), `skuid==null` ritorna `true`, mentre `skuid===null` ritorna `false` (che è il comportamento corretto, poiché si vuole eseguire l'else).

## Problemi di `test-CRUD-restockOrder`
1. L'utente creato alla riga 26 ha dei numeri nel nome-cognome. In uno scenario reale, questo non dovrebbe essere possibile. L'inserimento di questo utente ritorna con stato 422, facendo quindi fallire il test (e molti altri a catena).  
2. Gli SKU item definiti alle righe 37-38 hanno la dateOfStock nel futuro. Di nuovo, in uno scenario reale, questo non dovrebbe essere possibile. L'inserimento di questi ritorna con stato 422, facendo quindi fallire i test (e molti altri a catena). 

## Problemi di `test-CRUD-returnOrder`
1. *[come in restock order]* - L'utente creato alla riga 25 ha dei numeri nel nome-cognome. In uno scenario reale, questo non dovrebbe essere possibile. L'inserimento di questo utente ritorna con stato 422, facendo quindi fallire il test (e molti altri a catena).  
2. *[come in restock order]* - Gli SKU item definiti alle righe 36-37 hanno la dateOfStock nel futuro. Di nuovo, in uno scenario reale, questo non dovrebbe essere possibile. L'inserimento di questi ritorna con stato 422, facendo quindi fallire i test (e molti altri a catena). 
3. In addskuitems[0] (linea 40) la corrispondenza SKU-RFID è scorretta (rfid[2] è associato a SKU 1, non 0)
4. In myproductswithrfid[0] (linea 53) la corrispondenza SKU-RFID è scorretta (myproducts[0] è associato a SKU 0, mentre rfid[2] è associato a SKU 1)
5. Alle righe 72-73, vengono inseriti nel database skuitems[0] e skuitems[1], ma poi vengono associati al returnOrder skuitems[2] e skuitems[3] ,che però non sono nel database. Questo rompe la consistency, facendo fallire l'inserimento del returnOrder.

## Problemi di `test-CRUD-internalOrder`
1. L'internal order creato alla linea 33 ha come data "2021/11/29 9:30". Questo formato è in contraddizione con quanto richiesto dalle APIs ("dates can be in the format "YYYY/MM/DD" or in format "YYYY/MM/DD HH:MM").
2. Alla riga 53, la funzione `testEditInternalOrder` associa degli SKU item all'ordine, che però non sono presenti nel database. Inoltre, questi SKU item sono associati ad uno SKU id "statico". Per questo motivo, abbiamo inserito i relativi SKU item nel database e poi reso gli SKU id dinamici utilizzando le funzionalità fornite da `utils-id`.

## Problemi di `test-CRUD-item`
1. *[come in restock order]* - L'utente creato alla riga 28 ha dei numeri nel nome-cognome. In uno scenario reale, questo non dovrebbe essere possibile. L'inserimento di questo utente ritorna con stato 422, facendo quindi fallire il test (e molti altri a catena).
2. Alle righe 31-32, gli item vengono definiti con id pari a 0. Poiché le nostre APIs accettano valori strettamente positivi di id, la creazione ritorna sempre 422 (causando di nuovo fallimenti a catena).

## Problemi di `testEzWhAPI`
1. Alla riga 110, si cerca di eliminare lo SKU con id 0. Poiché le nostre APIs accettano valori strettamente positivi di id, la delete ritorna con 422.
2. Prima di cancellare tutti gli SKU a linea 131, bisognerebbe eliminare prima i test descriptor, per evitare di rompere la consistency.

## Postfazione
Ci scusiamo davvero molto per questo elenco lunghissimo.  
Speriamo vivamente che capiate il nostro stato d'animo: ci siamo impegnati davvero tanto, lavorando per molte ore al giorno, e ora ci troviamo in una posizione in cui avremmo ottenuto risultati nettamente migliori lavorando la metà - se non addirittuara meno.
Questo ci sconforta molto, soprattutto perché, con queste correzioni e senza alcuna modifica al nostro codice, avremmo fallito soltanto una decina di test. Restiamo comunque soddisfatti del nostro lavoro, nonostante ci si sia ritorto contro.  
Inoltre, questa situazione ci costringe a cambiare il nostro codice in peggio; i controlli di consistency richiedono molte modifiche, alcuni sono addirittura intrinsechi nel design.  
Ovviamente, dove necessario, lo faremo: speriamo solo di aver mostrato in qualche modo le features di un progetto di cui andiamo molto fieri, e che sentiamo non sia correttamente rappresentato né dall'alto numero di test falliti, né tantomeno da tutte le righe di codice che dovremmo modificare per farli passare.  

Grazie infinite per la vostra attenzione, come al solito.  

Gruppo 34,  
Ilaria Pilo, Marco Sacchet, Luca Scibetta, Enes Yarali
