// Get a list of items in inventory based on the classification_id
let classificationList = document.querySelector("#classificationList");
classificationList.addEventListener("change", listChange);
listChange();

function listChange() {
    let classification_id = classificationList.value;
    let classIdURL = "/inv/getInventory/" + classification_id;
    fetch(classIdURL)
        .then(function (response) {
            if (response.ok) {
                return response.json();
            }
            throw Error("Network response was not OK");
        })
        .then(function (data) {
            buildInventoryList(data);
        })
        .catch(function (error) {
            console.log("There was a problem: ", error.message);
            document.getElementById("inventoryDisplay").innerHTML = "No vehicles in this category";
        });
}

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {
    let inventoryDisplay = document.getElementById("inventoryDisplay");

    // Set up the table labels
    let dataTable = "<thead>";
    dataTable += "<tr><th>Vehicle Name</th><th>Modify</th><th>Delete</th><th>Service</th></tr>";
    dataTable += "</thead>";

    // Set up the table body
    dataTable += "<tbody>";

    // Iterate over all vehicles in the array and put each in a row
    data.forEach(function (element) {
        dataTable += `<tr>`;
        dataTable += `<td>${element.inv_make} ${element.inv_model}</td>`;
        dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`;
        dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td>`;
        dataTable += `<td><a href="/service/list/${element.inv_id}" class="btn btn-sm btn-outline-primary">Service</a></td>`;
        dataTable += `</tr>`;
    });

    dataTable += "</tbody>";

    // Display the contents in the Inventory Management view
    inventoryDisplay.innerHTML = dataTable;
}
