import tecaji from './data/tecaj.json'

const Tecaj = () => {
  return (
     <div className='container'>

            <h1>Teačaj</h1>

            <table className='table '>

                <thead>
                    <tr>
                        <th scope='col'>Država</th>
                        <th scope='col'>valuta</th>
                        <th scope='col'>kupovni</th>
                        <th scope='col'>srednji</th>
                        <th scope='col'>prodajni</th>
                        <th scope='col'>datum</th>
                        
                    </tr>
                </thead>
                <tbody>
                    {
                        tecaji.map((tecaj) => (
                            <tr>
                                <td>{tecaj.drzava}</td>
                                <td>{tecaj.valuta}</td>
                                <td>{tecaj.kupovni_tecaj}</td>
                                <td>{tecaj.srednji_tecaj}</td>
                                
                                <td>{tecaj.prodajni_tecaj}</td>
                                <td>{new Date(tecaj.datum_primjene).toLocaleDateString('hr-HR')}</td>
                                
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            



            </div>
  );
};

export default Tecaj;
