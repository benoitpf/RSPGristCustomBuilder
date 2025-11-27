function buildTree(node, parentElement) {
  if (typeof node === "object" && node !== null) {
    for (const key in node) {
      const li = document.createElement("li");
      const value = node[key];
      li.textContent = key;
      parentElement.appendChild(li);
      if (typeof value === "object" && value !== null) {
        const ul = document.createElement("ul");
        li.appendChild(ul);
        buildTree(value, ul);
      } else {
        const span = document.createElement("span");
        span.textContent = `: ${value}`;
        li.appendChild(span);
      }
    }
  } else if (Array.isArray(node)) {
    node.forEach((item, index) => {
      const li = document.createElement("li");
      li.textContent = `[${index}]`;
      parentElement.appendChild(li);
      if (typeof item === "object" && item !== null) {
        const ul = document.createElement("ul");
        li.appendChild(ul);
        buildTree(item, ul);
      } else {
        const span = document.createElement("span");
        span.textContent = `: ${item}`;
        li.appendChild(span);
      }
    });
  }
}

function displayAsTree(data, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  const ul = document.createElement("ul");
  buildTree(data, ul);
  container.appendChild(ul);
}


function formatDataForJsTree(node) {
  if (Array.isArray(node)) {
    return node.map((item, index) => ({
      text: `[${index}]: ${JSON.stringify(item)}`,
      children: typeof item === "object" && item !== null ? formatDataForJsTree(item) : false
    }));
  } else if (typeof node === "object" && node !== null) {
    const result = [];
    for (const key in node) {
      const value = node[key];
      if (typeof value !== "object" || value === null) {
        result.push({
          text: `${key}: ${value}`,
          children: false
        });
      } else {
        result.push({
          text: key,
          children: formatDataForJsTree(value)
        });
      }
    }
    return result;
  }
  return String(node);
}

function displayAsTreeWithJsTree(data, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`Élément avec l'ID '${containerId}' introuvable !`);
    return;
  }
  container.innerHTML = `<div id="jstree"></div>`;
  $("#jstree").jstree({
    core: {
      data: formatDataForJsTree(data),
      check_callback: true
    }
  });
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
                  //displayAsTreeWithJsTree(data, "result");
                  displayAsTree(data,"result");
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
