//import korisnici from './data/korisnici.json';
import { useState } from "react";
import { data } from "react-router-dom";
const Profilil = () => {
    
    const [korisnici, setKorisnici] = useState([]);

    fetch('https://jsonplaceholder.typicode.com/users/')
      .then(response => response.json())
      .then(
        (data) => {
            setKorisnici(data);
        }
      )

    return(
        <div className='container'>

            <h1>Popis korisnika</h1>

            <table className='table '>

                <thead>
                    <tr>
                        <th scope='col'>#</th>
                        <th scope='col'>Name</th>
                        <th scope='col'>Username</th>
                        <th scope='col'>Email</th>
                        <th scope='col'>Adress</th>
                        <th scope='col'>Phone</th>
                        <th scope='col'>Website</th>
                        <th scope='col'>Company</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        korisnici.map((korisnikk) => (
                            <tr>
                                <td>{korisnikk.id}</td>
                                <td>{korisnikk.name}</td>
                                <td>{korisnikk.username}</td>
                                <td>{korisnikk.email}</td>
                                <td>
                                    <p>{korisnikk.address.street}</p>
                                    <p>{korisnikk.address.suite}</p>
                                    <p>{korisnikk.address.city}</p>
                                    <p>{korisnikk.address.zipcode}</p>
                                    <p>{korisnikk.address.geo.lat}</p>
                                    <p>{korisnikk.address.geo.lng}</p>
                                    </td>
                                <td>{korisnikk.phone}</td>
                                <td>{korisnikk.website}</td>
                                <td>
                                    <p>{korisnikk.company.name}</p>
                                    <p>{korisnikk.company.catchPhrase}</p>
                                    <p>{korisnikk.company.bs}</p>
                                    </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            



            </div>
    )

}

export default Profilil


