const appVarsElement = document.getElementById("appVars");
if (appVarsElement === null) {
    throw new Error("no #appVars element on the page.");
}
const AppVars = JSON.parse(appVarsElement.dataset.appVars);

export default AppVars;