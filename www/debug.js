let debugHolder = document.getElementById("debug-holder");

function displayDebug(obj) {
	debugHolder.innerHTML = "";
	table = document.createElement('table');
	for (const fieldName in obj) {
		const field = obj[fieldName];
		row = table.insertRow();
				const td = row.insertCell();
			td.appendChild(document.createTextNode(`${fieldName}`));
		
		for (const subFieldName in field) { // Loop through each sub-field in the field
			const subField = field[subFieldName];
			const td = row.insertCell();
			td.appendChild(document.createTextNode(`${subFieldName} ${subField}`));
			td.appendChild(document.createTextNode(`${subFieldName} ${subField}`));
		}
	}
	debugHolder.appendChild(table);
}
