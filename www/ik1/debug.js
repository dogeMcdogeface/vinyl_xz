let debugHolder = document.getElementById("debug-holder");

//----------- PRINT DEBUG TO DOM --------------------------------------------------------------------//
function displayDebug(obj) {
	debugHolder.innerHTML = "";
	const table = document.createElement('table');

	for (const [key, value] of Object.entries(obj)) {
		const row = table.insertRow();
		row.insertCell().appendChild(document.createTextNode(`${key}`));
		for (const [subKey, subValue] of Object.entries(value)) {
			const keyEl = document.createElement("div");
			keyEl.innerText = `${subKey}`;
			keyEl.classList.add("var");
			row.insertCell().append(keyEl, subValue);
		}
	}
	debugHolder.appendChild(table);
}
