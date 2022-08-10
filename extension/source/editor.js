// create the editor
const container = document.getElementById("jsoneditor");
const options = {};
const editor = new JSONEditor(container, options);

Persistence.getExtensionData().then(data => {
	editor.set(data);
});

document.getElementById('editor-save').addEventListener('click', () => {
	Persistence.storeExtensionData(editor.get());
});
