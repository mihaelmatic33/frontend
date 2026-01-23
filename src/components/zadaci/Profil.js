import Korisnik from "./data/korisnik.json";

//Funkcija za prikaz korisnika
const Profil = () => {

    //OVO JE JAVASCRIPT OBLIK
    // //  const Korisnik = {
    // //     // Javascript objekt se sastoji od "key" : "value" parova
    // //     "name" : "Mihael", //string
    // //     "surrname" : "Matić", //string
    // //     "godine" : 26, //number
    // //     "vozacka" : true, //boolean
    // // "vjestine" : [ //array / niz
    // //     "HTML",
    // //     "CSS",
    // //     "JavaScript",
    // //     "React"
    // // ],
    // // "adresa" : { //objekt
    // //     "ulica" : "Ul. Sv. Leopolda Mandića",
    // //     "grad" : "Zagreb",
    // //     "pbroj" : 10040
    // // }


    //Ovo je JSON FORMAT, TEKSTUALNI OBLIK, string
    const KorisnikJSON = '{ "name" : "Mihael", "surrname" : "Matić", "godine" : 26, "vozacka" : true, "vjestine" : [ "HTML", "CSS", "JavaScript", "React" ], "adresa" : { "ulica" : "Ul. Sv. Leopolda Mandića", "grad" : "Zagreb", "pbroj" : 10040 } }'
    //pomocu json.parse() ga pretvaramo u javascript objekt
    const Korisnik = JSON.parse(KorisnikJSON);

    console.log(KorisnikJSON);




    




    // Ova komponenta vraća informacije o korisniku
    return(
        <div>
            <h1>Profil korisnika</h1>
            <p>Ime: {Korisnik.name}</p>
            <p>Prezime: {Korisnik.surrname}</p>
            <p>Godine: {Korisnik.godine}</p>

            <div>
                Vještine:
                <ul>


                    {
                        //Map koristimo za prolazak kroz niz(i ispisivanje vrijednosti u ovom slučaju)
                        Korisnik.vjestine.map(
                            (vjestina, index) => (
                                <li>{index+1}. {vjestina}</li>
                            )
                    )

                    }

                </ul>
            </div>

            <p>Ulica: {Korisnik.adresa.ulica}</p>
            <p>Grad: {Korisnik.adresa.grad}</p>
            <p>Poštanski broj: {Korisnik.adresa.pbroj}</p>
        </div>
    )
}

export default Profil