import Korisnik from "./data/korisnik.json";
const Profil = () => {
    const KorisnikJSON = '{ "name" : "Mihael", "surrname" : "Matić", "godine" : 26, "vozacka" : true, "vjestine" : [ "HTML", "CSS", "JavaScript", "React" ], "adresa" : { "ulica" : "Ul. Sv. Leopolda Mandića", "grad" : "Zagreb", "pbroj" : 10040 } }'
    const Korisnik = JSON.parse(KorisnikJSON);

    console.log(KorisnikJSON);
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