import { useState, useEffect } from "react";



const BASE_URL = process.env.REACT_APP_API_URL;
const Categories = () => {
  const [page, setPage] = useState(null);


  useEffect(

    () => {
      fetch(`${BASE_URL}v2/pages/652`)
      .then(response => response.json())
      .then(
        (data) => {
          setPage(data);
          console.log(data)
        
        }
      )
    }, []
  )


  if(!page) return <p>Ucitavanje</p>






  return (
    <div dangerouslySetInnerHTML={{__html: page.content.rendered}}></div>
  );
};

export default Categories;
