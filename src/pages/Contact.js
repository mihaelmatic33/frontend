import { useState, useEffect } from "react";




const Contact = () => {
  const [page, setPage] = useState(null);


  useEffect(

    () => {
      fetch('https://front2.edukacija.online/backend/wp-json/wp/v2/pages/617')
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

export default Contact;