type AppVars = Record<string, unknown>;

const appVarsElement = document.getElementById("appVars");
if (appVarsElement === null) {
    throw new Error("no #appVars element on the page.");
}
const rawAppVars = appVarsElement.dataset.appVars;
if (rawAppVars == null) {
    throw new Error("no data-app-vars attribute on #appVars.");
}

const AppVars: AppVars = JSON.parse(rawAppVars);

export default AppVars;
