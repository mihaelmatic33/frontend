import tekstovi from './data/tekstovi.json';
const Tekstovi = () => {

    return(
        
        <div>
           {tekstovi.map((tekstov) => (
            <>
                
                <h1>{tekstov.title}</h1>
                <p>{tekstov.body}</p>
                </>
            ))}
        </div>
       
    )

}


export default Tekstovi


