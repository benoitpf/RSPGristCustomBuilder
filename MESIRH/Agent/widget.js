// To update Grist table, we first need to know what table we are connected to.
// Here we will listen to all messages sent from Grist to our custom widget,
// and if any of this message has a tableId, we will store it in global window
// object.
let tableId;
let error = "";
let waiting = false;

// To update Grist table, we first need to know what table we are connected to.
// Here we will listen to all messages sent from Grist to our custom widget,
// and if any of this message has a tableId, we will store it in global window
// object.
grist.on("message", (data) => {
    if (data.tableId) {
        tableId = data.tableId;
    }
});

// Next we will listen to onRecords event and store the information
// that is send with this event in two global variables.
let rows = null; // All rows in a table.
let mappings = null; // Column mappings configuration.

grist.onRecords((_rows, _mappings) => {

    mappings = _mappings;
    rows = grist.mapColumnNames(_rows);
    console.info("onrecords:"+ mappings);

    if (!rows) {
        // grist.mapColumnNames helper will return null if not all
        // columns are mapped.
        error = "Please map columns";
        console.error(error);
    } else {
        error = "";
    }
})

async function getapiinfo(url){
    console.info("#####"+url+"#####");

    let apidatas = ""
    try {
        const response = await fetch(url, {
            headers: {
                'X-Omogen-Api-Key': 'e9e91e1e-1b02-4050-9b11-03e08148168a',
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const flux = await response.json();
            if (!flux) {
                console.info("pas de data");
            } else {
                apidatas = flux;
                if (apidatas.length === 0) {
                    console.error("Aucune donnée récupérée.");
                }
                else {
                    console.info("recuperation data ok:" + apidatas.length);
                }
            }
        } else {
            console.info("erreur dans le fetch vers " + url);
        }
    }
     catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
    }
    return apidatas;
}

const  refreshClickedDataApi = async (event) => {

    const button = event.target;
    button.disabled = true;

    const statusDiv = document.getElementById('status');

    try {
        statusDiv.textContent = "Récupération en cours...";
        let apidatas=""


        if (!rows || !tableId) {
            error = "Please map columns and ensure tableId is set";
            console.error("refreshClicked:", error);
            return;
        }

        waiting = true;
        error = null;

        let urlElement;
        let params;
        let plateforme;
        if (button.id==='fetchDataApiDev'){
            urlElement = document.getElementById('DEV');
            params = document.getElementById('DEVParams');
            plateforme = 'DEV';
        }
        else if (button.id==='fetchDataApiKlif'){
            urlElement = document.getElementById('KLIF');
            params = document.getElementById('KLIFParams');
            plateforme = 'KLIF';
        }
        else {
            urlElement = document.getElementById('PROD');
            params = document.getElementById('PRODParams');
            plateforme = 'PROD';
        }

        let url = urlElement.value;
        let urlO = url;
        if (params != null && params.value.length > 0) {
            const separateur = url.includes("?") ? "&" : "?";
            url = url + separateur + params.value;
        }

        apidatas = await getapiinfo(url);
        if (apidatas.length === 0) {
            statusDiv.textContent = "Aucune donnée API à insérer.";
            return;
        }

        console.info("Ajouter les données à Grist");
        // console.info(apidatas);

        // ... existing code ...

        // Process each item in the array
        apidatas.forEach((item, index) => {
            console.info(`Item ${index}:`);
            let nomUsage = "";


            // Iterate through all properties of the item
            for (const [key, value] of Object.entries(item)) {
                if (Array.isArray(value)) {
                    console.log(`  ${key} (Array[${value.length}]):`);
                    value.forEach((subItem, subIndex) => {
                        if (typeof subItem === 'object' && subItem !== null) {
                            console.log(`    [${subIndex}]:`);
                            for (const [subKey, subValue] of Object.entries(subItem)) {
                                console.log(`      ${subKey}: ${JSON.stringify(subValue)}`);
                            }
                        } else {
                            console.log(`    [${subIndex}]: ${JSON.stringify(subItem)}`);
                        }
                    });
                } else if (typeof value === 'object' && value !== null) {
                    console.log(`  ${key} (Object):`);
                    for (const [subKey, subValue] of Object.entries(value)) {
                        console.log(`    ${subKey}: ${JSON.stringify(subValue)}`);
                        if (key==="etatCivil"){
                            if (subKey==="nomUsage"){
                                nomUsage=subValue;
                            }
                        }
                    }
                } else {
                    console.log(`  ${key}: ${JSON.stringify(value)}`);

                }
            }

            const res = grist.docApi.applyUserActions(
                [
                    ['AddRecord', tableId, null,
                        {
                            numen: item.numen,
                            numen_h: item.numen_h,
                            typeNSI: item.typeNSI,
                            codeBase: item.codeBase,
                            nomUsage:nomUsage
                        }
                    ]
                ]
            ).then(result => {
                console.info("******* resultat ids ajoutes", result)
                // Id de la ligne Catalogue créée
                const newRowId = result.retValues[0]; // selon la forme exacte du retour
            });
        });



        statusDiv.textContent = `Données insérées avec succès (${apidatas.length} enregistrements).`;

    } catch (err) {
        console.error(err);
        error = err.message;
        statusDiv.textContent = `Erreur : ${String(err)}`;
    } finally {
        button.disabled = false;
        waiting = false;
    }
};

const refreshClickedCategories = async (event) => {

    const button = event.target;
    button.disabled = true;

    const statusDiv = document.getElementById('status');

    try {
        statusDiv.textContent = "Récupération en cours...";
        let apidatas = [];


        waiting = true;
        error = null;


        let urlElement;
        let params;

        if (button.id==='fetchCategoriesDev'){
            urlElement = document.getElementById('DEV');
            params = document.getElementById('DEVParams');
        }
        else if (button.id==='fetchCategoriesKlif'){
            urlElement = document.getElementById('KLIF');
            params = document.getElementById('KLIFParams');
            }
        else {
            urlElement = document.getElementById('PROD');
            params = document.getElementById('PRODParams');
        }

        let url = urlElement.value + "/categories";

        console.info(button.id);
        console.info(url);

        apidatas = await getapiinfo(url);
        if (apidatas.length === 0) {
            statusDiv.textContent = "Aucune categorie";
            return;
        }
        const liste = document.getElementById('liste');
        liste.innerHTML = '';
        for (const item of apidatas) {
            const li = document.createElement('li');
            li.textContent = `${item.key ? item.key : item.id} : ${item.description} `;
            liste.appendChild(li);
        }
        statusDiv.textContent = `Données récupérées avec succès (${apidatas.length} enregistrements).`;

    } catch (err) {
        console.error(err);
        error = err.message;
        statusDiv.textContent = `Erreur : ${String(err)}`;
    } finally {
        button.disabled = false;
        waiting = false;
    }
};

// Tell Grist that we are ready, and inform about our requirements.
grist.ready({
    // We need full access to the document, in order to update stock prices.
    requiredAccess: 'full',
    // We need some information how to read the table.
    columns: [  "numen",
                "numen_h",
                "typeNSI",
                "codeBase",
                "nomUsage"]
});

// document.getElementById("fetchDataApiDev").addEventListener("click", refreshClickedDataApi);
document.getElementById("fetchDataApiKlif").addEventListener("click", refreshClickedDataApi);
// document.getElementById("fetchDataApiProd").addEventListener("click", refreshClickedDataApi);
// document.getElementById("fetchCategoriesProd").addEventListener("click", refreshClickedCategories);
// document.getElementById("fetchCategoriesDev").addEventListener("click", refreshClickedCategories);
// document.getElementById("fetchCategoriesKlif").addEventListener("click", refreshClickedCategories);
