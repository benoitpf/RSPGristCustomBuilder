grist.ready({ requiredAccess: 'full' });

const labelDansLeWidget = document.querySelector("#nom");
let nomIssuDeLaTable = ""

grist.onRecord(record => {

  console.info(record);
  
  let nomIssuDeLaTable = record.nom;
  
  let labelDansLeWidget.textContent = nomIssuDeLaTable;

  let url = "https://apim-passerelle-klifbb-otl.omogen.in.cloe.education.gouv.fr/mesirh/dev/rsp/mes-qua-d1/api/externe/unite_structurelle_complet?identUs=";
  url += record.nom;


  fetch(url).then((response) => {
    if (response.ok) {
      response.json().then((data) => {
              const results = data
              if (!results) {
                console.info("pas de data");
              }
              else{
                document.getElementById('result').innerText = JSON.stringify(data);
              }
      })
              
    }
    else {}

  })

});

grist.onRecords(table => {
  // Code qui sera executé lorsque les données dans la table ont changé.
});
