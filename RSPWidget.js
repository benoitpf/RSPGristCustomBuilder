function displayAsTreeWithJsTree(data, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Élément avec l'ID '${containerId}' introuvable !`);
    return;
  }
  container.innerHTML = `<div id="jstree"></div>`;
  $("#jstree").jstree({
    core: {
      data: formatDataForJsTree(data)
    }
  });
}

function formatDataForJsTree(node) {
  if (typeof node !== "object" || node === null) {
    return { text: String(node) };
  }
  const result = [];
  for (const key in node) {
    const child = formatDataForJsTree(node[key]);
    child.text = key;
    result.push(child);
  }
  return result;
}

grist.ready({ requiredAccess: 'full' });

// Attends que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
  const labelDansLeWidget = document.querySelector("#nom");
  if (!labelDansLeWidget) {
    console.error("Élément avec l'ID 'nom' introuvable !");
    return;
  }
  let nomIssuDeLaTable = ""
  
  grist.onRecord(record => {
  
    console.info("###############");
    console.info(record);
    console.info(record.nom);
    
    nomIssuDeLaTable = record.nom;
    
    labelDansLeWidget.textContent = nomIssuDeLaTable;
  
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
                  //document.getElementById('result').innerText = JSON.stringify(data);
                  displayAsTreeWithJsTree(data, "result");
                }
        })
                
      }
      else {}
  
    })
  
  });

  grist.onRecords(table => {
    // Code qui sera executé lorsque les données dans la table ont changé.
  });
});
